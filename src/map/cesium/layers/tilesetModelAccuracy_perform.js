/**
 * 增强版 3D Tiles 模型精度管理类
 * 集成 Web Worker 优化加载性能
 * 
 * @class TilesetModelAccuracyEnhanced
 * @extends BaseLayer
 */

import BaseLayer from "./baseLayer.js";
import * as constant from "@/map/constant";
import { moveModel } from "@/map/cesium/helps/modelHandle";

class TilesetModelAccuracyEnhanced extends BaseLayer {
  /**
   * 默认 Tileset 配置
   */
  static DEFAULT_TILESET_CONFIG = {
    enableCollision: false,
    maximumMemoryUsage: 256,
    maximumScreenSpaceError: 16,
    maximumNumberOfLoadedTiles: 2000,
    shadows: false,
    skipLevelOfDetail: true,
    baseScreenSpaceError: 512,
    skipScreenSpaceErrorFactor: 8,
    skipLevels: 1,
    immediatelyLoadDesiredLevelOfDetail: false,
    loadSiblings: false,
    cullWithChildrenBounds: true,
    dynamicScreenSpaceError: true,
    dynamicScreenSpaceErrorDensity: 0.00278,
    dynamicScreenSpaceErrorFactor: 4.0,
    dynamicScreenSpaceErrorHeightFalloff: 0.25,
    preloadWhenHidden: false,
    preloadFlightDestinations: false,
    enableDebugWireframe: false,
    debugShowBoundingVolume: false,
    enablePick: true,
    allowPicking: true
  };

  /**
   * 默认可见性配置
   */
  static DEFAULT_VISIBILITY_CONFIG = {
    maxCameraHeight: 15000,
    viewDistanceThreshold: 10000,
    priorityLoadDistance: 5000,
    cameraUpdateThrottle: 100
  };

  /**
   * 构造函数
   * @param {Object} options - 配置选项
   */
  constructor(options = {}) {
    super(options);
    
    // 核心属性
    this.tilesetModels = [];
    this.tilesetFlags = [];
    this.hasLoaded = false;
    
    // 配置
    this.tilesetConfig = { ...TilesetModelAccuracyEnhanced.DEFAULT_TILESET_CONFIG, ...options.tilesetConfig };
    this.visibilityConfig = { ...TilesetModelAccuracyEnhanced.DEFAULT_VISIBILITY_CONFIG, ...options.visibilityConfig };
    
    // Web Worker 相关
    this.loadWorker = null;
    this.workerInitialized = false;
    this.loadingQueue = new Map();
    this.loadedModels = new Map();
    
    // 性能监控
    this.performanceMetrics = {
      loadStartTime: null,
      loadEndTime: null,
      totalLoadTime: 0,
      modelLoadTimes: new Map(),
      memoryUsage: 0
    };
    
    // 向后兼容性
    this.tilesetModel = null;
    this.tilesetFlag = null;
    
    // 初始化 Worker
    this.initializeWorker();
  }

  /**
   * 初始化 Web Worker
   */
  initializeWorker() {
    try {
      // 创建 Worker
      this.loadWorker = new Worker('../workers/TilesetLoadWorker.js');
      
      // 监听 Worker 消息
      this.loadWorker.addEventListener('message', (event) => {
        this.handleWorkerMessage(event.data);
      });
      
      // 监听 Worker 错误
      this.loadWorker.addEventListener('error', (error) => {
        console.error('TilesetLoadWorker error:', error);
        this.workerInitialized = false;
      });
      
      this.workerInitialized = true;
      console.log('✅ TilesetLoadWorker initialized successfully');
      
    } catch (error) {
      console.warn('⚠️ Web Worker not supported, falling back to main thread loading:', error);
      this.workerInitialized = false;
    }
  }

  /**
   * 处理 Worker 消息
   * @param {Object} message - Worker 消息
   */
  handleWorkerMessage(message) {
    const { type, data } = message;
    
    switch (type) {
      case 'START_LOADING':
        this.startModelLoading(data);
        break;
        
      case 'LOADING_PROGRESS':
        this.updateLoadingProgress(data);
        break;
        
      case 'MODEL_LOADED_FROM_CACHE':
        this.handleCachedModel(data);
        break;
        
      case 'LOADING_ERROR':
        this.handleLoadingError(data);
        break;
        
      case 'STATUS_UPDATE':
        this.updateWorkerStatus(data);
        break;
        
      default:
        console.log('Unknown worker message type:', type);
    }
  }

  /**
   * 开始模型加载
   * @param {Object} data - 加载数据
   */
  async startModelLoading(data) {
    const { name, url, config } = data;
    const startTime = performance.now();
    
    try {
      const resource = new Cesium.Resource({
        url: url,
        headers: {
          'Cache-Control': 'max-age=3600'
        }
      });

      const tilesetModel = Cesium.Cesium3DTileset.fromUrl(resource, config);
      const tileset = await tilesetModel;
      
      // 记录加载时间
      const loadTime = performance.now() - startTime;
      this.performanceMetrics.modelLoadTimes.set(name, loadTime);
      
      // 处理加载成功
      this.handleTilesetLoaded(tileset, { name, url });
      
      // 通知 Worker 加载完成
      if (this.workerInitialized) {
        this.loadWorker.postMessage({
          type: 'MODEL_LOADED',
          data: { modelName: name, success: true }
        });
      }
      
    } catch (error) {
      console.error(`❌ Failed to load ${name}:`, error);
      
      // 通知 Worker 加载失败
      if (this.workerInitialized) {
        this.loadWorker.postMessage({
          type: 'MODEL_LOADED',
          data: { modelName: name, success: false }
        });
      }
    }
  }

  /**
   * 更新加载进度
   * @param {Object} data - 进度数据
   */
  updateLoadingProgress(data) {
    const { name, estimatedTime, queueLength } = data;
    
    // 触发进度事件
    this.dispatchEvent('loadingProgress', {
      modelName: name,
      estimatedTime,
      queueLength,
      timestamp: Date.now()
    });
  }

  /**
   * 处理缓存模型
   * @param {Object} data - 缓存数据
   */
  handleCachedModel(data) {
    const { name } = data;
    console.log(`📦 Model ${name} loaded from cache`);
    
    // 触发缓存加载事件
    this.dispatchEvent('modelLoadedFromCache', { modelName: name });
  }

  /**
   * 处理加载错误
   * @param {Object} data - 错误数据
   */
  handleLoadingError(data) {
    const { name, error, retryCount } = data;
    console.error(`❌ Failed to load ${name} after ${retryCount} retries:`, error);
    
    // 触发错误事件
    this.dispatchEvent('loadingError', {
      modelName: name,
      error,
      retryCount
    });
  }

  /**
   * 更新 Worker 状态
   * @param {Object} status - 状态数据
   */
  updateWorkerStatus(status) {
    this.workerStatus = status;
    
    // 触发状态更新事件
    this.dispatchEvent('workerStatusUpdate', status);
  }

  /**
   * 显示所有模型
   * @returns {Promise<void>}
   */
  async show() {
    if (this.hasLoaded) {
      console.log('Models already loaded');
      return;
    }

    console.log('🚀 Starting enhanced 3D Tiles loading...');
    this.performanceMetrics.loadStartTime = performance.now();
    
    const showList = constant.MODEL_3DTILES_INFO_LIST;
    
    if (this.workerInitialized) {
      // 使用 Worker 加载
      await this.loadWithWorker(showList);
    } else {
      // 回退到主线程加载
      await this.loadWithMainThread(showList);
    }
    
    this.hasLoaded = true;
    this.performanceMetrics.loadEndTime = performance.now();
    this.performanceMetrics.totalLoadTime = this.performanceMetrics.loadEndTime - this.performanceMetrics.loadStartTime;
    
    console.log(`✅ All models loaded in ${this.performanceMetrics.totalLoadTime.toFixed(2)}ms`);
    
    // 设置相机监听器
    this.setupCameraListener();
    
    // 向后兼容性
    this.tilesetModel = this.tilesetModels[0];
    this.tilesetFlag = this.tilesetFlags[0];
  }

  /**
   * 使用 Worker 加载模型
   * @param {Array} showList - 模型列表
   */
  async loadWithWorker(showList) {
    const timestamp = new Date().getTime();
    
    // 计算每个模型的优先级（基于相机距离）
    const modelsWithPriority = showList.map((item, index) => {
      const distance = this.calculateCameraDistance(item.center);
      const priority = Math.floor(distance / 1000); // 距离越近优先级越高（数字越小）
      
      return {
        ...item,
        url: `/geodata/3dtiles/${item.name}/tileset.json`,
        priority,
        index
      };
    });

    // 按优先级排序
    modelsWithPriority.sort((a, b) => a.priority - b.priority);
    
    // 添加到 Worker 队列
    for (const modelInfo of modelsWithPriority) {
      this.loadWorker.postMessage({
        type: 'ADD_TO_QUEUE',
        data: {
          modelInfo,
          priority: modelInfo.priority
        }
      });
    }
  }

  /**
   * 使用主线程加载模型（回退方案）
   * @param {Array} showList - 模型列表
   */
  async loadWithMainThread(showList) {
    const timestamp = new Date().getTime();
    const loadPromises = [];
    
    for (let i = 0; i < showList.length; i++) {
      const item = showList[i];
      const promise = this.loadSingleTileset(item, i, timestamp);
      loadPromises.push(promise);
      
      // 限制并发数量
      if (loadPromises.length >= 2) {
        await Promise.race(loadPromises);
      }
    }
    
    // 等待所有模型加载完成
    await Promise.allSettled(loadPromises);
  }

  /**
   * 计算相机到模型的距离
   * @param {Array} center - 模型中心坐标
   * @returns {number} 距离
   */
  calculateCameraDistance(center) {
    if (!this.viewer || !this.viewer.camera) {
      return Infinity;
    }
    
    const cameraPosition = this.viewer.camera.position;
    const modelPosition = Cesium.Cartesian3.fromDegrees(center[0], center[1], center[2] || 0);
    
    return Cesium.Cartesian3.distance(cameraPosition, modelPosition);
  }

  /**
   * 加载单个 Tileset
   * @param {Object} modelInfo - 模型信息
   * @param {number} index - 索引
   * @param {number} timestamp - 时间戳
   */
  async loadSingleTileset(modelInfo, index, timestamp) {
    try {
      const resource = this.createTilesetResource(modelInfo, timestamp);
      const tileset = await this.createTilesetInstance(resource);
      
      this.handleTilesetLoaded(tileset, modelInfo, index);
      
    } catch (error) {
      this.handleTilesetError(error, modelInfo);
    }
  }

  /**
   * 创建 Tileset 资源
   * @param {Object} modelInfo - 模型信息
   * @param {number} timestamp - 时间戳
   * @returns {Cesium.Resource} Cesium 资源对象
   */
  createTilesetResource(modelInfo, timestamp) {
    const baseURL = `/geodata/3dtiles/${modelInfo.name}/tileset.json`;
    // const tilesetUrl = baseURL + "?timestamp=" + timestamp;
    const tilesetUrl = baseURL;
    
    return new Cesium.Resource({
      url: tilesetUrl,
      headers: {
        'Cache-Control': 'max-age=3600'
      }
    });
  }

  /**
   * 创建 Tileset 实例
   * @param {Cesium.Resource} resource - Cesium 资源对象
   * @returns {Promise} 3D Tileset Promise
   */
  createTilesetInstance(resource) {
    return Cesium.Cesium3DTileset.fromUrl(resource, this.tilesetConfig);
  }

  /**
   * 处理 Tileset 加载成功
   * @param {Object} tileset - 加载成功的 tileset
   * @param {Object} modelInfo - 模型信息
   * @param {number} index - 索引
   */
  handleTilesetLoaded(tileset, modelInfo, index = this.tilesetFlags.length) {
    const { viewer } = this;
    
    // 添加到场景
    this.tilesetFlags[index] = tileset;
    viewer.scene.primitives.add(tileset);
    
    // 设置模型位置
    const modelMatrix = moveModel(tileset, modelInfo.center[0], modelInfo.center[1], -10);
    tileset.modelMatrix = modelMatrix;
    
    // 缓存模型信息
    this.loadedModels.set(modelInfo.name, {
      tileset,
      modelInfo,
      loadedAt: Date.now()
    });
    
    console.log(`✅ ${modelInfo.name} loaded successfully`);
    
    // 初始化可见性控制
    this.updateTilesetVisibility();
  }

  /**
   * 处理 Tileset 加载错误
   * @param {Error} error - 错误对象
   * @param {Object} modelInfo - 模型信息
   */
  handleTilesetError(error, modelInfo) {
    console.error(`❌ Failed to load ${modelInfo.name}:`, error);
    
    // 触发错误事件
    this.dispatchEvent('tilesetLoadError', {
      modelName: modelInfo.name,
      error: error.message
    });
  }

  /**
   * 检查 Tileset 可见性
   * @returns {boolean} 是否需要更新可见性
   */
  checkTilesetVisibility() {
    const { viewer } = this;
    if (!viewer || !viewer.camera) return false;

    const { maxCameraHeight, viewDistanceThreshold } = this.visibilityConfig;
    const cameraHeight = viewer.camera.positionCartographic.height;
    
    return cameraHeight <= maxCameraHeight;
  }

  /**
   * 更新 Tileset 可见性
   */
  updateTilesetVisibility() {
    if (!this.checkTilesetVisibility()) {
      this.tilesetFlags.forEach(tileset => {
        if (tileset) tileset.show = false;
      });
      return;
    }

    const { viewer } = this;
    const { viewDistanceThreshold } = this.visibilityConfig;
    const cameraPosition = viewer.camera.position;

    this.tilesetFlags.forEach((tileset, index) => {
      if (!tileset) return;

      const modelInfo = constant.MODEL_3DTILES_INFO_LIST[index];
      if (!modelInfo) return;

      const modelPosition = Cesium.Cartesian3.fromDegrees(
        modelInfo.center[0], 
        modelInfo.center[1], 
        modelInfo.center[2] || 0
      );
      
      const distance = Cesium.Cartesian3.distance(cameraPosition, modelPosition);
      tileset.show = distance <= viewDistanceThreshold;
    });
  }

  /**
   * 设置相机监听器
   */
  setupCameraListener() {
    const { viewer } = this;
    if (!viewer || !viewer.camera) return;

    const { cameraUpdateThrottle } = this.visibilityConfig;
    
    // 节流函数
    let throttleTimer = null;
    const throttledUpdate = () => {
      if (throttleTimer) return;
      
      throttleTimer = setTimeout(() => {
        this.updateTilesetVisibility();
        throttleTimer = null;
      }, cameraUpdateThrottle);
    };

    this.cameraListener = viewer.camera.changed.addEventListener(throttledUpdate);
  }

  /**
   * 移除相机监听器
   */
  removeCameraListener() {
    if (this.cameraListener) {
      this.cameraListener();
      this.cameraListener = null;
    }
  }

  /**
   * 隐藏所有模型
   */
  hide() {
    try {
      this.tilesetFlags.forEach(tileset => {
        if (tileset && this.viewer && this.viewer.scene) {
          tileset.show = false;
          this.viewer.scene.primitives.remove(tileset);
        }
      });
      
      this.removeCameraListener();
      console.log('✅ All tilesets hidden successfully');
      
    } catch (error) {
      console.error('❌ Error hiding tilesets:', error);
    }
  }

  /**
   * 销毁实例
   */
  destroy() {
    try {
      // 清理 Worker
      if (this.loadWorker) {
        this.loadWorker.terminate();
        this.loadWorker = null;
      }
      
      // 清理模型
      this.hide();
      
      // 清理缓存
      this.loadedModels.clear();
      this.loadingQueue.clear();
      
      // 重置状态
      this.hasLoaded = false;
      this.tilesetModels = [];
      this.tilesetFlags = [];
      
      console.log('✅ TilesetModelAccuracyEnhanced destroyed successfully');
      
    } catch (error) {
      console.error('❌ Error destroying TilesetModelAccuracyEnhanced:', error);
    }
  }

  /**
   * 获取加载状态
   * @returns {Object} 加载状态信息
   */
  getStatus() {
    return {
      hasLoaded: this.hasLoaded,
      loadedModelsCount: this.loadedModels.size,
      totalModelsCount: constant.MODEL_3DTILES_INFO_LIST.length,
      workerInitialized: this.workerInitialized,
      workerStatus: this.workerStatus,
      performanceMetrics: this.performanceMetrics,
      visibilityConfig: this.visibilityConfig
    };
  }

  /**
   * 获取性能报告
   * @returns {Object} 性能报告
   */
  getPerformanceReport() {
    const modelLoadTimes = Array.from(this.performanceMetrics.modelLoadTimes.entries());
    const averageLoadTime = modelLoadTimes.reduce((sum, [, time]) => sum + time, 0) / modelLoadTimes.length;
    
    return {
      totalLoadTime: this.performanceMetrics.totalLoadTime,
      averageModelLoadTime: averageLoadTime || 0,
      modelLoadTimes: Object.fromEntries(this.performanceMetrics.modelLoadTimes),
      loadedModelsCount: this.loadedModels.size,
      workerEnabled: this.workerInitialized
    };
  }

  /**
   * 触发自定义事件
   * @param {string} eventType - 事件类型
   * @param {Object} data - 事件数据
   */
  dispatchEvent(eventType, data) {
    if (typeof window !== 'undefined' && window.CustomEvent) {
      const event = new CustomEvent(`tileset-${eventType}`, { detail: data });
      window.dispatchEvent(event);
    }
  }
}

// 创建单例实例
const tilesetModelAccuracyEnhanced = new TilesetModelAccuracyEnhanced();

// 导出类和实例（保持向后兼容性）
export { TilesetModelAccuracyEnhanced };
export default tilesetModelAccuracyEnhanced;