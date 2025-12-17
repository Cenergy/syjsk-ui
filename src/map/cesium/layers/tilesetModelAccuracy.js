import BaseLayer from "./baseLayer";
import eventBus from "../../../utils/EventBus";
import { constant } from "@/map";
import { moveModel } from "@/map/cesium/helps/modelHandle";

/**
 * 3D Tiles模型精度控制层
 * 负责管理多个3D Tiles模型的加载、显示和可见性控制
 */
class TilesetModelAccuracy extends BaseLayer {
  // 默认3D Tiles配置常量
  static DEFAULT_TILESET_CONFIG = {
    enableCollision: true,
    // 限制内存与已加载瓦片数，减少大范围查看时的压力
    maximumMemoryUsage: 1024,
    maximumScreenSpaceError: 48,
    maximumNumberOfLoadedTiles: 512,
    shadows: false, // 是否显示阴影
    skipLevelOfDetail: true, // 启用细节层级跳过优化
    baseScreenSpaceError: 2048, // 基础屏幕空间错误（抬高以降低细节）
    skipScreenSpaceErrorFactor: 18, // 跳过屏幕空间错误因子
    skipLevels: 1, // 跳过的最小级别数
    immediatelyLoadDesiredLevelOfDetail: false, // 是否立即加载所需细节层级
    loadSiblings: false, // 是否加载兄弟瓦片
    cullWithChildrenBounds: true, // 使用子边界体积剔除
    // 开启动态屏幕空间错误：远距离时自动降低细节
    dynamicScreenSpaceError: true,
    dynamicScreenSpaceErrorDensity: 0.0025,
    dynamicScreenSpaceErrorFactor: 4.5,
    dynamicScreenSpaceErrorHeightFalloff: 0.3,
    // priority: {
    //   height: 1000.0, // 高度优先级
    //   distance: 500 // 距离优先级
    // }
  };

  // 默认可见性控制配置
  static DEFAULT_VISIBILITY_CONFIG = {
    minCameraHeight: 0, // 最小相机高度（米）
    maxCameraHeight: 8000, // 最大相机高度（米）
    viewDistanceThreshold: 4000, // 视图距离阈值（米）
    // 内存优化：不可见时延迟卸载、可见时按需加载
    unloadWhenHidden: true,
    hiddenUnloadDelayMs: 3000,
    reloadDebounceMs: 300
  };

  /**
   * 构造函数
   * @param {Object} options - 配置选项
   * @param {Object} options.visibilityConfig - 可见性控制配置
   * @param {Object} options.tilesetConfig - 3D Tiles配置
   */
  constructor(options = {}) {
    super(options);
    
    // 向后兼容性属性
    this.tilesetModel = null;
    this.tilesetFlag = null;
    
    // 模型管理数组
    this.tilesetModels = [];
    this.tilesetFlags = [];
    
    // 可见性控制配置
    this.visibilityConfig = {
      ...TilesetModelAccuracy.DEFAULT_VISIBILITY_CONFIG,
      ...options?.visibilityConfig
    };
    
    // 3D Tiles配置
    this.tilesetConfig = {
      ...TilesetModelAccuracy.DEFAULT_TILESET_CONFIG,
      ...options?.tilesetConfig
    };
    
    // 控制状态
    this.cameraChangeListener = null;
    this.isVisibilityControlEnabled = true;
    this.hasLoaded = false;
    this.renderModeConfigured = false;

    // 使用 rAF 节流相机变化响应，避免高频触发造成抖动
    this.updateVisibilityThrottled = this.throttleRAF(() => this.updateTilesetVisibility());

    // 内存优化定时器与模型缓存
    this.unloadTimers = [];
    this.reloadTimers = [];
    this.modelListCache = null;
  }
  /**
   * 检查3D Tiles是否应该可见
   * 基于相机高度和距离阈值判断模型可见性
   * @returns {boolean} 是否应该显示3D Tiles
   */
  checkTilesetVisibility() {
    const { viewer } = this;
    if (!viewer || !this.isVisibilityControlEnabled) {
      return true;
    }

    const camera = viewer.camera;
    const cameraPosition = camera.position;
    const cameraHeight = viewer.scene.globe.ellipsoid.cartesianToCartographic(cameraPosition).height;

    // 检查相机高度是否在指定范围内
    const { minCameraHeight, maxCameraHeight, viewDistanceThreshold } = this.visibilityConfig;
    if (cameraHeight < minCameraHeight || cameraHeight > maxCameraHeight) {
      return false;
    }

    // 检查是否有任何3D Tiles在视图距离阈值内
    if (this.tilesetFlags && this.tilesetFlags.length > 0) {
      return this.tilesetFlags.some(tileset => {
        if (!tileset || !tileset.boundingSphere) {
          return false;
        }
        const distance = Cesium.Cartesian3.distance(cameraPosition, tileset.boundingSphere.center);
        return distance <= viewDistanceThreshold;
      });
    }

    return true;
  }

  /**
   * 更新3D Tiles的可见性
   * 根据当前相机状态更新所有模型的显示状态
   */
  updateTilesetVisibility() {
    const { viewer } = this;
    if (!viewer || !this.modelListCache || !this.tilesetFlags) return;

    const camera = viewer.camera;
    const cameraPosition = camera.position;
    const cameraHeight = viewer.scene.globe.ellipsoid.cartesianToCartographic(cameraPosition).height;
    const {
      minCameraHeight,
      maxCameraHeight,
      viewDistanceThreshold,
      unloadWhenHidden,
      hiddenUnloadDelayMs,
      reloadDebounceMs
    } = this.visibilityConfig;

    const heightOk = cameraHeight >= minCameraHeight && cameraHeight <= maxCameraHeight;

    this.modelListCache.forEach((modelInfo, index) => {
      const tileset = this.tilesetFlags[index];

      // 计算目标可见性（基于相机高度与距离）
      let desiredVisible = heightOk;
      if (desiredVisible) {
        if (tileset && tileset.boundingSphere) {
          const distance = Cesium.Cartesian3.distance(cameraPosition, tileset.boundingSphere.center);
          desiredVisible = distance <= viewDistanceThreshold;
        } else if (modelInfo && modelInfo.center && modelInfo.center.length >= 2) {
          // 未加载时用经纬度近似距离判断是否需要加载
          const centerCart = Cesium.Cartesian3.fromDegrees(modelInfo.center[0], modelInfo.center[1], 0);
          const distance = Cesium.Cartesian3.distance(cameraPosition, centerCart);
          desiredVisible = distance <= viewDistanceThreshold;
        }
      }

      if (desiredVisible) {
        // 需要可见：取消卸载并展示，未加载则触发按需加载
        this.cancelUnload(index);
        this.cancelReload(index);

        if (tileset) {
          tileset.show = true;
        } else {
          // 按需加载（防抖）
          this.scheduleReload(index, reloadDebounceMs);
        }
      } else {
        // 不可见：隐藏并延迟卸载以释放内存
        if (tileset) {
          tileset.show = false;
          if (unloadWhenHidden) {
            this.scheduleUnload(index, hiddenUnloadDelayMs);
          }
        } else {
          // 已卸载，确保不误触发加载
          this.cancelReload(index);
        }
      }
    });

    // 请求一次重绘（按需渲染模式下）
    try { viewer.scene.requestRender(); } catch (e) {}
  }

  /**
   * 设置相机变化监听器
   * 监听相机移动事件，自动更新模型可见性
   */
  setupCameraListener() {
    const { viewer } = this;
    if (!viewer) {
      return;
    }

    // 移除现有监听器，避免重复绑定
    this.removeCameraListener();

    // 添加新的监听器
    this.cameraChangeListener = viewer.camera.moveEnd.addEventListener(() => {
      this.updateVisibilityThrottled();
    });
  }

  /**
   * 移除相机变化监听器
   * 清理事件监听，防止内存泄漏
   */
  removeCameraListener() {
    if (this.cameraChangeListener) {
      this.cameraChangeListener();
      this.cameraChangeListener = null;
    }
  }

  /**
   * 创建3D Tileset资源配置
   * @param {Object} modelInfo - 模型信息
   * @param {string} timestamp - 时间戳，用于缓存控制
   * @returns {Object} Cesium Resource对象
   */
  createTilesetResource(modelInfo, timestamp) {
    const baseURL = `/geodata/3dtiles/${modelInfo.name}/tileset.json`;
    // const tilesetUrl = `${baseURL}?timestamp=${timestamp}`;
    const tilesetUrl = `${baseURL}`;
    
    return new Cesium.Resource({
      url: tilesetUrl,
    });
  }

  /**
   * 创建3D Tileset实例
   * @param {Object} resource - Cesium Resource对象
   * @returns {Promise} 3D Tileset Promise
   */
  createTilesetInstance(resource) {
    return Cesium.Cesium3DTileset.fromUrl(resource, this.tilesetConfig);
  }

  /**
   * 处理单个模型加载成功
   * @param {Object} tileset - 加载成功的tileset
   * @param {Object} modelInfo - 模型信息
   */
  handleTilesetLoaded(tileset, modelInfo) {
    const { viewer } = this;
    
    // 绑定到对应索引，避免重复加载时打乱顺序
    try {
      const index = constant.MODEL_3DTILES_INFO_LIST.findIndex(m => m.name === modelInfo.name);
      if (index >= 0) {
        this.tilesetFlags[index] = tileset;
        this.cancelReload(index);
      } else {
        this.tilesetFlags.push(tileset);
      }
    } catch (e) {
      this.tilesetFlags.push(tileset);
    }

    // 添加到场景
    viewer.scene.primitives.add(tileset);

    // 设置模型位置
    const modelMatrix = moveModel(tileset, modelInfo.center[0], modelInfo.center[1], -10);
    tileset.modelMatrix = modelMatrix;

    // 降低移动时的网络与队列压力
    try {
      tileset.cullRequestsWhileMoving = true;
      tileset.cullRequestsWhileMovingMultiplier = 80;
      tileset.backFaceCulling = true;
      // 应用更保守的细节策略（有些属性已通过 fromUrl 传递，再次设置保证生效）
      tileset.maximumNumberOfLoadedTiles = this.tilesetConfig.maximumNumberOfLoadedTiles;
      tileset.maximumMemoryUsage = this.tilesetConfig.maximumMemoryUsage;
      tileset.maximumScreenSpaceError = this.tilesetConfig.maximumScreenSpaceError;
      tileset.skipLevelOfDetail = this.tilesetConfig.skipLevelOfDetail;
      tileset.baseScreenSpaceError = this.tilesetConfig.baseScreenSpaceError;
      tileset.skipScreenSpaceErrorFactor = this.tilesetConfig.skipScreenSpaceErrorFactor;
      tileset.skipLevels = this.tilesetConfig.skipLevels;
      tileset.dynamicScreenSpaceError = this.tilesetConfig.dynamicScreenSpaceError;
      tileset.dynamicScreenSpaceErrorDensity = this.tilesetConfig.dynamicScreenSpaceErrorDensity;
      tileset.dynamicScreenSpaceErrorFactor = this.tilesetConfig.dynamicScreenSpaceErrorFactor;
      tileset.dynamicScreenSpaceErrorHeightFalloff = this.tilesetConfig.dynamicScreenSpaceErrorHeightFalloff;
    } catch (e) {
      // 某些版本属性可能不存在，忽略异常
    }

    // 初始化可见性控制
    this.updateTilesetVisibility();
  }

  /**
   * 处理模型加载错误
   * @param {Error} error - 错误对象
   * @param {Object} modelInfo - 模型信息
   */
  handleTilesetError(error, modelInfo) {
    console.error(`❌ Failed to load ${modelInfo.name} 3D Tiles:`, error);
  }

  /**
   * 加载单个3D Tiles模型
   * @param {Object} modelInfo - 模型信息
   * @param {string} timestamp - 时间戳
   * @returns {Promise} 加载Promise
   */
  async loadSingleTileset(modelInfo, timestamp) {
    try {
      const resource = this.createTilesetResource(modelInfo, timestamp);
      const tilesetModel = this.createTilesetInstance(resource);
      
      this.tilesetModels.push(tilesetModel);
      
      // 异步处理加载结果
      tilesetModel
        .then(tileset => this.handleTilesetLoaded(tileset, modelInfo))
        .catch(error => this.handleTilesetError(error, modelInfo));
        
      return tilesetModel;
    } catch (error) {
      this.handleTilesetError(error, modelInfo);
      throw error;
    }
  }

  /**
   * 显示所有3D Tiles模型
   * 异步加载配置列表中的所有模型
   * @returns {Promise<void>}
   */
  async show() {
    const { viewer } = this;
    if (!viewer) {
      console.warn('Viewer not available');
      return;
    }

    // 重置状态
    this.tilesetModels = [];
    this.tilesetFlags = [];
    this.unloadTimers = [];
    this.reloadTimers = [];
    
    const timestamp = new Date().getTime();
    const modelList = constant.MODEL_3DTILES_INFO_LIST;
    this.modelListCache = modelList || [];
    
    if (!modelList || modelList.length === 0) {
      console.warn('No 3D Tiles models configured');
      return;
    }

    // 预置索引数组，便于按索引写入/卸载
    this.tilesetFlags = new Array(modelList.length).fill(null);
    this.unloadTimers = new Array(modelList.length).fill(null);
    this.reloadTimers = new Array(modelList.length).fill(null);

    // 并行加载所有模型
    const loadPromises = modelList.map(modelInfo => 
      this.loadSingleTileset(modelInfo, timestamp)
    );

    try {
      await Promise.allSettled(loadPromises);
      
      // 设置向后兼容性
      this.tilesetModel = this.tilesetModels[0] || null;
      this.hasLoaded = true;
      
      // 设置相机监听器
      this.setupCameraListener();

      // 开启按需渲染模式，减少无变化时的绘制
      if (!this.renderModeConfigured && viewer && viewer.scene) {
        try {
          viewer.scene.requestRenderMode = true;
          // 降低相机微小变化触发的重绘频率
          viewer.scene.maximumRenderTimeChange = 0.5; // 秒
          this.renderModeConfigured = true;
        } catch (e) {}
      }

      console.log(`✅ 3D Tiles loading completed. ${this.tilesetFlags.length}/${modelList.length} models loaded successfully.`);
    } catch (error) {
      console.error('❌ Error during 3D Tiles loading:', error);
    }
  }
  /**
   * 隐藏所有3D Tiles模型
   * 清理资源并移除场景中的所有模型
   * @returns {void}
   */
  hide() {
    const { viewer } = this;
    if (!viewer) return;

    try {
      // 移除相机监听器
      this.removeCameraListener();

      // 取消所有计划的卸载/重新加载定时器，避免在 hide 后再次触发加载
      this.cancelAllTimers();
      
      // 清理所有tileset
      this.tilesetFlags.forEach(tileset => {
        if (tileset && !tileset.isDestroyed()) {
          viewer.scene.primitives.remove(tileset);
          tileset.destroy();
        }
      });
      
      // 重置状态
      this.tilesetModels = [];
      this.tilesetFlags = [];
      this.tilesetModel = null;
      this.modelListCache = null;
      // 禁用可见性控制，确保不会在隐藏后被动触发显示/加载
      this.isVisibilityControlEnabled = false;
      this.hasLoaded = false;
      
      // 请求一次重绘，确保场景立即反映隐藏结果
      try { viewer.scene.requestRender(); } catch (e) {}
      
      console.log('✅ All 3D Tiles models hidden and cleaned up');
    } catch (error) {
      console.error('❌ Error hiding 3D Tiles models:', error);
    }
  }

  /**
   * 销毁实例，清理所有资源
   * @returns {void}
   */
  destroy() {
    this.hide();
    
    // 清理其他可能的引用
    this.viewer = null;
    this.id = null;
  }

  /**
   * 获取当前加载状态信息
   * @returns {Object} 状态信息对象
   */
  getStatus() {
    return {
      hasLoaded: this.hasLoaded,
      totalModels: this.tilesetModels.length,
      loadedModels: this.tilesetFlags.length,
      isAllLoaded: this.tilesetModels.length === this.tilesetFlags.length && this.hasLoaded,
      modelNames: this.tilesetFlags.map((_, index) => {
        const modelInfo = constant.MODEL_3DTILES_INFO_LIST[index];
        return modelInfo ? modelInfo.name : `Model_${index}`;
      })
    };
  }

  /**
   * 设置特定模型的可见性
   * @param {string} modelName - 模型名称
   * @param {boolean} visible - 是否可见
   * @returns {boolean} 操作是否成功
   */
  setModelVisibility(modelName, visible) {
    const modelIndex = constant.MODEL_3DTILES_INFO_LIST.findIndex(
      model => model.name === modelName
    );
    
    if (modelIndex === -1) {
      console.warn(`Model "${modelName}" not found`);
      return false;
    }
    
    const tileset = this.tilesetFlags[modelIndex];
    if (tileset && !tileset.isDestroyed()) {
      tileset.show = visible;
      return true;
    }
    
    return false;
  }

  /**
   * 获取特定模型的可见性状态
   * @param {string} modelName - 模型名称
   * @returns {boolean|null} 可见性状态，null表示模型未找到
   */
  getModelVisibility(modelName) {
    const modelIndex = constant.MODEL_3DTILES_INFO_LIST.findIndex(
      model => model.name === modelName
    );
    
    if (modelIndex === -1) return null;
    
    const tileset = this.tilesetFlags[modelIndex];
    return tileset && !tileset.isDestroyed() ? tileset.show : null;
  }

  // 启用/禁用可见性控制
  setVisibilityControlEnabled(enabled) {
    this.isVisibilityControlEnabled = enabled;
    if (enabled) {
      this.updateTilesetVisibility();
      this.setupCameraListener();
    } else {
      // 禁用时显示所有3D Tiles
      if (this.tilesetFlags) {
        this.tilesetFlags.forEach(tileset => {
          if (tileset) {
            tileset.show = true;
          }
        });
      }
      // 移除监听器
      if (this.cameraChangeListener) {
        this.cameraChangeListener();
        this.cameraChangeListener = null;
      }
      // 取消所有定时器，避免误卸载
      this.cancelAllTimers();
    }
  }

  // 更新可见性配置
  updateVisibilityConfig(config) {
    this.visibilityConfig = { ...this.visibilityConfig, ...config };
    if (this.isVisibilityControlEnabled) {
      this.updateTilesetVisibility();
    }
  }

  // 使用 requestAnimationFrame 节流回调
  throttleRAF(handler) {
    let scheduled = false;
    return (...args) => {
      if (scheduled) return;
      scheduled = true;
      const run = () => {
        scheduled = false;
        try {
          handler.apply(this, args);
        } catch (e) {}
      };
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(run);
      } else {
        setTimeout(run, 16);
      }
    };
  }

  // ---------- 内存优化：卸载/重新加载逻辑 ----------
  scheduleUnload(index, delayMs = 3000) {
    // 若已有定时器，不重复设置
    if (this.unloadTimers[index]) return;
    const { viewer } = this;
    this.unloadTimers[index] = setTimeout(() => {
      this.unloadTimers[index] = null;
      const tileset = this.tilesetFlags[index];
      if (tileset && !tileset.isDestroyed()) {
        try {
          viewer.scene.primitives.remove(tileset);
          tileset.destroy();
        } catch (e) {}
        this.tilesetFlags[index] = null;
        try { viewer.scene.requestRender(); } catch (e) {}
      }
    }, delayMs);
  }

  cancelUnload(index) {
    const t = this.unloadTimers[index];
    if (t) {
      clearTimeout(t);
      this.unloadTimers[index] = null;
    }
  }

  scheduleReload(index, delayMs = 300) {
    if (this.reloadTimers[index]) return;
    const modelInfo = this.modelListCache && this.modelListCache[index];
    if (!modelInfo) return;
    this.reloadTimers[index] = setTimeout(() => {
      this.reloadTimers[index] = null;
      // 若仍未加载，触发加载
      if (!this.tilesetFlags[index]) {
        try {
          this.loadSingleTileset(modelInfo, new Date().getTime());
        } catch (e) {}
      }
    }, delayMs);
  }

  cancelReload(index) {
    const t = this.reloadTimers[index];
    if (t) {
      clearTimeout(t);
      this.reloadTimers[index] = null;
    }
  }

  cancelAllTimers() {
    if (this.unloadTimers) {
      this.unloadTimers.forEach((t, i) => {
        if (t) clearTimeout(t);
        this.unloadTimers[i] = null;
      });
    }
    if (this.reloadTimers) {
      this.reloadTimers.forEach((t, i) => {
        if (t) clearTimeout(t);
        this.reloadTimers[i] = null;
      });
    }
  }
}

// 创建单例实例以保持向后兼容性
const tilesetModelAccuracyInstance = new TilesetModelAccuracy();

// 导出类和单例实例
export { TilesetModelAccuracy };
export default tilesetModelAccuracyInstance;
