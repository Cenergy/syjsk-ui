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
    maximumMemoryUsage: 100, // 最大内存使用量(MB)，防止浏览器卡顿
    maximumScreenSpaceError: 32, // 屏幕空间错误，影响细节层级
    maximumNumberOfLoadedTiles: 1000, // 最大加载瓦片数量
    shadows: false, // 是否显示阴影
    skipLevelOfDetail: true, // 启用细节层级跳过优化
    baseScreenSpaceError: 1024, // 基础屏幕空间错误
    skipScreenSpaceErrorFactor: 16, // 跳过屏幕空间错误因子
    skipLevels: 1, // 跳过的最小级别数
    immediatelyLoadDesiredLevelOfDetail: false, // 是否立即加载所需细节层级
    loadSiblings: false, // 是否加载兄弟瓦片
    cullWithChildrenBounds: true, // 使用子边界体积剔除
    dynamicScreenSpaceError: true, // 动态屏幕空间错误
    dynamicScreenSpaceErrorDensity: 0.00278, // 动态屏幕空间错误密度
    dynamicScreenSpaceErrorFactor: 4.0, // 动态屏幕空间错误因子
    dynamicScreenSpaceErrorHeightFalloff: 0.25 // 动态屏幕空间错误高度衰减
  };

  // 默认可见性控制配置
  static DEFAULT_VISIBILITY_CONFIG = {
    minCameraHeight: 0, // 最小相机高度（米）
    maxCameraHeight: 10000, // 最大相机高度（米）
    viewDistanceThreshold: 8000 // 视图距离阈值（米）
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
    if (!this.tilesetFlags || this.tilesetFlags.length === 0) {
      return;
    }

    const shouldBeVisible = this.checkTilesetVisibility();
    
    this.tilesetFlags.forEach(tileset => {
      if (tileset) {
        tileset.show = shouldBeVisible;
      }
    });
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
    this.cameraChangeListener = viewer.camera.changed.addEventListener(() => {
      this.updateTilesetVisibility();
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
    
    // 添加到场景
    this.tilesetFlags.push(tileset);
    viewer.scene.primitives.add(tileset);
    
    // 设置模型位置
    const modelMatrix = moveModel(tileset, modelInfo.center[0], modelInfo.center[1], -10);
    tileset.modelMatrix = modelMatrix;
    
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
    
    const timestamp = new Date().getTime();
    const modelList = constant.MODEL_3DTILES_INFO_LIST;
    
    if (!modelList || modelList.length === 0) {
      console.warn('No 3D Tiles models configured');
      return;
    }

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
      this.hasLoaded = false;
      
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
    }
  }

  // 更新可见性配置
  updateVisibilityConfig(config) {
    this.visibilityConfig = { ...this.visibilityConfig, ...config };
    if (this.isVisibilityControlEnabled) {
      this.updateTilesetVisibility();
    }
  }
}

// 创建单例实例以保持向后兼容性
const tilesetModelAccuracyInstance = new TilesetModelAccuracy();

// 导出类和单例实例
export { TilesetModelAccuracy };
export default tilesetModelAccuracyInstance;
