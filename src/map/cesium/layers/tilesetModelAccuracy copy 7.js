import BaseLayer from "./baseLayer";
import eventBus from "../../../utils/EventBus";
import {constant}  from "@/map";
import { moveModel ,tileSet,tileSetAll } from "@/map/cesium/helps/modelHandle";

class tilesetModelAccuracy extends BaseLayer {
  constructor(options) {
    super(options);
    this.tilesetModel = null;
    this.tilesetFlag = null;
    
    // 可见性控制配置
    this.visibilityConfig = {
      minCameraHeight: 0, // 最小相机高度（米），低于此高度不显示3D Tiles
      maxCameraHeight: 15000, // 增加最大相机高度，提升远距离可见性
      viewDistanceThreshold: 12000, // 增加视图距离阈值
      priorityLoadDistance: 5000, // 优先加载距离阈值
      ...options?.visibilityConfig
    };
    
    this.cameraChangeListener = null;
    this.isVisibilityControlEnabled = true;
    
    // 性能优化相关属性
    this.loadingQueue = []; // 加载队列
    this.loadedModels = new Map(); // 已加载模型缓存
    this.isLoading = false; // 加载状态标志
    this.maxConcurrentLoads = 2; // 最大并发加载数
    this.currentLoadingCount = 0; // 当前加载数量
    this.lastCameraUpdate = 0; // 上次相机更新时间
    this.cameraUpdateThrottle = 100; // 相机更新节流时间(ms)
    
    // 预加载配置
    this.preloadConfig = {
      enabled: true,
      maxPreloadDistance: 8000,
      preloadDelay: 1000 // 预加载延迟时间
    };
  }
  // 计算相机到模型的距离（优化版本）
  calculateDistanceToModel(cameraPosition, modelInfo) {
    const modelPosition = Cesium.Cartesian3.fromDegrees(
      modelInfo.center[0], 
      modelInfo.center[1], 
      modelInfo.center[2] || 0
    );
    return Cesium.Cartesian3.distance(cameraPosition, modelPosition);
  }

  // 获取优先加载的模型列表
  getPriorityModels(cameraPosition) {
    const showList = constant.MODEL_3DTILES_INFO_LIST;
    const modelsWithDistance = showList.map(model => ({
      ...model,
      distance: this.calculateDistanceToModel(cameraPosition, model)
    }));

    // 按距离排序，近的优先
    return modelsWithDistance.sort((a, b) => a.distance - b.distance);
  }

  // 检查3D Tiles是否应该可见（优化版本）
  checkTilesetVisibility(tileset, modelInfo) {
    const { viewer } = this;
    if (!viewer || !this.isVisibilityControlEnabled) return true;

    const camera = viewer.camera;
    const cameraPosition = camera.position;
    const cameraHeight = viewer.scene.globe.ellipsoid.cartesianToCartographic(cameraPosition).height;

    // 检查相机高度是否在指定范围内
    if (cameraHeight < this.visibilityConfig.minCameraHeight || 
        cameraHeight > this.visibilityConfig.maxCameraHeight) {
      return false;
    }

    // 计算到模型的距离
    const distance = this.calculateDistanceToModel(cameraPosition, modelInfo);
    return distance <= this.visibilityConfig.viewDistanceThreshold;
  }

  // 更新3D Tiles的可见性（优化版本，支持单独控制）
  updateTilesetVisibility() {
    if (!this.tilesetFlags || this.tilesetFlags.length === 0) return;

    // 节流处理，避免频繁更新
    const now = Date.now();
    if (now - this.lastCameraUpdate < this.cameraUpdateThrottle) {
      return;
    }
    this.lastCameraUpdate = now;

    const { viewer } = this;
    const cameraPosition = viewer.camera.position;
    const showList = constant.MODEL_3DTILES_INFO_LIST;

    this.tilesetFlags.forEach((tileset, index) => {
      if (tileset && showList[index]) {
        const shouldBeVisible = this.checkTilesetVisibility(tileset, showList[index]);
        if (tileset.show !== shouldBeVisible) {
          tileset.show = shouldBeVisible;
        }
      }
    });

    // 触发预加载检查
    if (this.preloadConfig.enabled) {
      this.checkPreloadModels(cameraPosition);
    }
  }

  // 设置相机变化监听器（优化版本）
  setupCameraListener() {
    const { viewer } = this;
    if (!viewer) return;

    // 移除现有监听器
    if (this.cameraChangeListener) {
      this.cameraChangeListener();
      this.cameraChangeListener = null;
    }

    // 添加新的监听器，使用节流处理
    this.cameraChangeListener = viewer.camera.changed.addEventListener(() => {
      this.updateTilesetVisibility();
    });
  }

  // 创建优化的3D Tileset配置
  createOptimizedTilesetConfig() {
    return {
      enableCollision: false, // 禁用碰撞检测以提升性能
      maximumMemoryUsage: 256, // 增加内存使用限制
      maximumScreenSpaceError: 16, // 降低屏幕空间错误以提升质量
      maximumNumberOfLoadedTiles: 2000, // 增加最大加载瓦片数
      shadows: false, // 禁用阴影
      skipLevelOfDetail: true, // 启用细节级别跳过
      baseScreenSpaceError: 512, // 降低基础屏幕空间错误
      skipScreenSpaceErrorFactor: 8, // 降低跳过因子
      skipLevels: 1,
      immediatelyLoadDesiredLevelOfDetail: false,
      loadSiblings: false,
      cullWithChildrenBounds: true,
      dynamicScreenSpaceError: true, // 启用动态屏幕空间错误
      dynamicScreenSpaceErrorDensity: 0.00278,
      dynamicScreenSpaceErrorFactor: 4.0,
      dynamicScreenSpaceErrorHeightFalloff: 0.25,
      // 新增优化参数
      preloadWhenHidden: false, // 隐藏时不预加载
      preloadFlightDestinations: false, // 不预加载飞行目标
      enableDebugWireframe: false, // 禁用调试线框
      debugShowBoundingVolume: false, // 禁用边界体积显示
      enablePick: true, // 启用拾取功能
      allowPicking: true
    };
  }

  // 单个模型加载函数
  async loadSingleModel(modelInfo, index) {
    const { viewer } = this;
    if (!viewer || this.loadedModels.has(modelInfo.name)) {
      return this.loadedModels.get(modelInfo.name);
    }

    this.currentLoadingCount++;
    
    try {
      const timestamp = new Date().getTime();
      const baseURL = `/geodata/3dtiles/${modelInfo.name}/tileset.json`;
      const tilesetUrl = baseURL + "?timestamp=" + timestamp;
      
      const resource = new Cesium.Resource({
        url: tilesetUrl,
        headers: {
          'Cache-Control': 'max-age=3600' // 添加缓存控制
        }
      });

      const tilesetConfig = this.createOptimizedTilesetConfig();
      const tilesetModel = Cesium.Cesium3DTileset.fromUrl(resource, tilesetConfig);
      
      const tileset = await tilesetModel;
      
      // 缓存已加载的模型
      this.loadedModels.set(modelInfo.name, tileset);
      
      // 添加到场景
      viewer.scene.primitives.add(tileset);
      
      // 设置模型位置
      const modelMatrix = moveModel(tileset, modelInfo.center[0], modelInfo.center[1], -10);
      tileset.modelMatrix = modelMatrix;
      
      // 添加到管理数组
      if (!this.tilesetModels) this.tilesetModels = [];
      if (!this.tilesetFlags) this.tilesetFlags = [];
      
      this.tilesetModels[index] = tilesetModel;
      this.tilesetFlags[index] = tileset;
      
      // 初始化可见性
      const cameraPosition = viewer.camera.position;
      tileset.show = this.checkTilesetVisibility(tileset, modelInfo);
      
      console.log(`✅ ${modelInfo.name} 3D Tiles loaded successfully (${this.currentLoadingCount}/${constant.MODEL_3DTILES_INFO_LIST.length})`);
      
      return tileset;
    } catch (error) {
      console.error(`❌ Failed to load ${modelInfo.name} 3D Tiles:`, error);
      throw error;
    } finally {
      this.currentLoadingCount--;
    }
  }

  // 分批加载模型
  async loadModelsInBatches(priorityModels) {
    const batches = [];
    for (let i = 0; i < priorityModels.length; i += this.maxConcurrentLoads) {
      batches.push(priorityModels.slice(i, i + this.maxConcurrentLoads));
    }

    for (const batch of batches) {
      const loadPromises = batch.map((model, batchIndex) => {
        const originalIndex = constant.MODEL_3DTILES_INFO_LIST.findIndex(m => m.name === model.name);
        return this.loadSingleModel(model, originalIndex);
      });

      try {
        await Promise.allSettled(loadPromises);
        // 在批次之间添加小延迟，避免阻塞UI
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        console.warn('Batch loading error:', error);
      }
    }
  }

  // 预加载检查
  checkPreloadModels(cameraPosition) {
    if (!this.preloadConfig.enabled) return;

    const showList = constant.MODEL_3DTILES_INFO_LIST;
    const unloadedModels = showList.filter(model => !this.loadedModels.has(model.name));
    
    unloadedModels.forEach(model => {
      const distance = this.calculateDistanceToModel(cameraPosition, model);
      if (distance <= this.preloadConfig.maxPreloadDistance) {
        // 延迟预加载，避免影响当前操作
        setTimeout(() => {
          if (!this.loadedModels.has(model.name) && this.currentLoadingCount < this.maxConcurrentLoads) {
            const originalIndex = showList.findIndex(m => m.name === model.name);
            this.loadSingleModel(model, originalIndex);
          }
        }, this.preloadConfig.preloadDelay);
      }
    });
  }

  async show() {
    const { viewer, id } = this;
    if (!viewer || this.isLoading) return;

    this.isLoading = true;
    
    try {
      // 初始化数组
      this.tilesetModels = [];
      this.tilesetFlags = [];
      
      // 获取相机位置并计算优先级
      const cameraPosition = viewer.camera.position;
      const priorityModels = this.getPriorityModels(cameraPosition);
      
      console.log('🚀 开始优化加载3D Tiles模型，按距离优先级排序');
      
      // 首先加载最近的模型（立即可见的）
      const immediateModels = priorityModels.filter(model => 
        model.distance <= this.visibilityConfig.priorityLoadDistance
      );
      
      const deferredModels = priorityModels.filter(model => 
        model.distance > this.visibilityConfig.priorityLoadDistance
      );
      
      // 立即加载优先级高的模型
      if (immediateModels.length > 0) {
        console.log(`📍 立即加载 ${immediateModels.length} 个近距离模型`);
        await this.loadModelsInBatches(immediateModels);
      }
      
      // 延迟加载其他模型
      if (deferredModels.length > 0) {
        console.log(`⏳ 延迟加载 ${deferredModels.length} 个远距离模型`);
        setTimeout(async () => {
          await this.loadModelsInBatches(deferredModels);
        }, 500); // 500ms延迟
      }
      
      // 保持向后兼容性
      this.tilesetModel = this.tilesetModels[0];
      this.hasLoaded = true;
      
      // 设置相机监听器
      this.setupCameraListener();
      
      console.log('✅ 3D Tiles优化加载完成');
      
    } catch (error) {
      console.error('❌ 3D Tiles加载失败:', error);
    } finally {
      this.isLoading = false;
    }
  }
  //隐藏（优化版本）
  hide() {
    const { viewer, id } = this;

    // 停止加载过程
    this.isLoading = false;

    // 移除相机监听器
    if (this.cameraChangeListener) {
      this.cameraChangeListener();
      this.cameraChangeListener = null;
    }

    if (this.tilesetModels && viewer) {
      // 移除所有tileset，但保留缓存
      this.tilesetFlags.forEach(tileset => {
        if (tileset) {
          viewer.scene.primitives.remove(tileset);
        }
      });
      this.tilesetModels = [];
      this.tilesetFlags = [];
    }
    
    // 保持向后兼容性
    if (this.tilesetModel && viewer) {
      viewer.scene.primitives.remove(this.tilesetFlag);
      this.tilesetModel = null;
      this.tilesetFlag = null;
    }

    // 重置加载计数
    this.currentLoadingCount = 0;
    
    console.log('🔄 3D Tiles已隐藏，缓存保留');
  }

  // 清除所有缓存
  clearCache() {
    this.loadedModels.clear();
    console.log('🗑️ 3D Tiles缓存已清除');
  }

  // 启用/禁用可见性控制（优化版本）
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

  // 更新预加载配置
  updatePreloadConfig(config) {
    this.preloadConfig = { ...this.preloadConfig, ...config };
  }

  // 获取加载状态信息
  getLoadingStatus() {
    return {
      isLoading: this.isLoading,
      currentLoadingCount: this.currentLoadingCount,
      loadedModelsCount: this.loadedModels.size,
      totalModelsCount: constant.MODEL_3DTILES_INFO_LIST.length,
      cacheSize: this.loadedModels.size,
      visibilityControlEnabled: this.isVisibilityControlEnabled
    };
  }

  // 强制加载指定模型
  async forceLoadModel(modelName) {
    const modelInfo = constant.MODEL_3DTILES_INFO_LIST.find(m => m.name === modelName);
    if (!modelInfo) {
      console.warn(`模型 ${modelName} 不存在`);
      return null;
    }

    const index = constant.MODEL_3DTILES_INFO_LIST.findIndex(m => m.name === modelName);
    return await this.loadSingleModel(modelInfo, index);
  }

  // 预热缓存（加载所有模型到缓存但不显示）
  async preloadAllModels() {
    if (this.isLoading) return;
    
    console.log('🔥 开始预热所有3D Tiles模型缓存');
    const showList = constant.MODEL_3DTILES_INFO_LIST;
    
    for (let i = 0; i < showList.length; i++) {
      const model = showList[i];
      if (!this.loadedModels.has(model.name)) {
        try {
          await this.loadSingleModel(model, i);
          // 加载后立即隐藏，只保留在缓存中
          const tileset = this.loadedModels.get(model.name);
          if (tileset) {
            tileset.show = false;
          }
        } catch (error) {
          console.warn(`预加载模型 ${model.name} 失败:`, error);
        }
      }
    }
    
    console.log('✅ 所有模型预加载完成');
  }
}
export default new tilesetModelAccuracy();
