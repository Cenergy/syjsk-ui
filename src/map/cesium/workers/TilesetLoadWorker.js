/**
 * 3D Tiles 加载管理 Web Worker
 * 用于在后台线程中管理模型加载队列和优先级
 */

class TilesetLoadManager {
  constructor() {
    this.loadQueue = [];
    this.loadingModels = new Map();
    this.loadedCache = new Map();
    this.maxConcurrentLoads = 2;
    this.currentLoading = 0;
  }

  /**
   * 添加模型到加载队列
   * @param {Object} modelInfo - 模型信息
   * @param {number} priority - 优先级 (数字越小优先级越高)
   */
  addToQueue(modelInfo, priority = 5) {
    const queueItem = {
      ...modelInfo,
      priority,
      timestamp: Date.now(),
      retryCount: 0
    };

    // 按优先级插入队列
    const insertIndex = this.loadQueue.findIndex(item => item.priority > priority);
    if (insertIndex === -1) {
      this.loadQueue.push(queueItem);
    } else {
      this.loadQueue.splice(insertIndex, 0, queueItem);
    }

    this.processQueue();
  }

  /**
   * 处理加载队列
   */
  async processQueue() {
    while (this.currentLoading < this.maxConcurrentLoads && this.loadQueue.length > 0) {
      const modelInfo = this.loadQueue.shift();
      await this.loadModel(modelInfo);
    }
  }

  /**
   * 加载单个模型
   * @param {Object} modelInfo - 模型信息
   */
  async loadModel(modelInfo) {
    if (this.loadedCache.has(modelInfo.name)) {
      this.postMessage({
        type: 'MODEL_LOADED_FROM_CACHE',
        data: {
          name: modelInfo.name,
          cached: true
        }
      });
      return;
    }

    this.currentLoading++;
    this.loadingModels.set(modelInfo.name, modelInfo);

    try {
      // 通知主线程开始加载
      this.postMessage({
        type: 'START_LOADING',
        data: {
          name: modelInfo.name,
          url: modelInfo.url,
          config: this.getOptimizedConfig(modelInfo)
        }
      });

      // 模拟加载时间计算（基于模型大小和网络状况）
      const estimatedLoadTime = this.calculateLoadTime(modelInfo);
      
      this.postMessage({
        type: 'LOADING_PROGRESS',
        data: {
          name: modelInfo.name,
          estimatedTime: estimatedLoadTime,
          queueLength: this.loadQueue.length
        }
      });

    } catch (error) {
      this.handleLoadError(modelInfo, error);
    }
  }

  /**
   * 获取优化的配置
   * @param {Object} modelInfo - 模型信息
   * @returns {Object} 优化配置
   */
  getOptimizedConfig(modelInfo) {
    // 根据模型特性动态调整配置
    const baseConfig = {
      maximumMemoryUsage: 256,
      maximumScreenSpaceError: 16,
      maximumNumberOfLoadedTiles: 2000,
      skipLevelOfDetail: true,
      baseScreenSpaceError: 512,
      skipScreenSpaceErrorFactor: 8,
      loadSiblings: false,
      preloadWhenHidden: false
    };

    // 根据模型大小调整参数
    if (modelInfo.size && modelInfo.size > 50 * 1024 * 1024) { // 大于50MB
      baseConfig.maximumMemoryUsage = 512;
      baseConfig.maximumScreenSpaceError = 32;
    }

    return baseConfig;
  }

  /**
   * 计算预估加载时间
   * @param {Object} modelInfo - 模型信息
   * @returns {number} 预估时间（毫秒）
   */
  calculateLoadTime(modelInfo) {
    const baseTime = 2000; // 基础加载时间 2秒
    const sizeMultiplier = (modelInfo.size || 10 * 1024 * 1024) / (10 * 1024 * 1024); // 以10MB为基准
    const networkMultiplier = this.getNetworkSpeedMultiplier();
    
    return Math.round(baseTime * sizeMultiplier * networkMultiplier);
  }

  /**
   * 获取网络速度倍数
   * @returns {number} 网络速度倍数
   */
  getNetworkSpeedMultiplier() {
    // 简单的网络速度检测
    if (navigator.connection) {
      const effectiveType = navigator.connection.effectiveType;
      switch (effectiveType) {
        case '4g': return 1;
        case '3g': return 2;
        case '2g': return 4;
        default: return 1.5;
      }
    }
    return 1.5; // 默认值
  }

  /**
   * 处理加载错误
   * @param {Object} modelInfo - 模型信息
   * @param {Error} error - 错误信息
   */
  handleLoadError(modelInfo, error) {
    this.currentLoading--;
    this.loadingModels.delete(modelInfo.name);

    if (modelInfo.retryCount < 3) {
      // 重试机制
      modelInfo.retryCount++;
      modelInfo.priority += 1; // 降低优先级
      
      setTimeout(() => {
        this.addToQueue(modelInfo, modelInfo.priority);
      }, 1000 * modelInfo.retryCount); // 递增延迟重试
    } else {
      // 通知主线程加载失败
      this.postMessage({
        type: 'LOADING_ERROR',
        data: {
          name: modelInfo.name,
          error: error.message,
          retryCount: modelInfo.retryCount
        }
      });
    }

    // 继续处理队列
    this.processQueue();
  }

  /**
   * 模型加载完成回调
   * @param {string} modelName - 模型名称
   * @param {boolean} success - 是否成功
   */
  onModelLoaded(modelName, success) {
    this.currentLoading--;
    this.loadingModels.delete(modelName);

    if (success) {
      this.loadedCache.set(modelName, {
        loadedAt: Date.now(),
        accessCount: 1
      });
    }

    // 继续处理队列
    this.processQueue();
  }

  /**
   * 更新模型优先级
   * @param {string} modelName - 模型名称
   * @param {number} newPriority - 新优先级
   */
  updatePriority(modelName, newPriority) {
    const queueIndex = this.loadQueue.findIndex(item => item.name === modelName);
    if (queueIndex !== -1) {
      const modelInfo = this.loadQueue.splice(queueIndex, 1)[0];
      modelInfo.priority = newPriority;
      this.addToQueue(modelInfo, newPriority);
    }
  }

  /**
   * 获取加载状态
   * @returns {Object} 加载状态
   */
  getStatus() {
    return {
      queueLength: this.loadQueue.length,
      currentLoading: this.currentLoading,
      loadedCount: this.loadedCache.size,
      loadingModels: Array.from(this.loadingModels.keys())
    };
  }

  /**
   * 发送消息到主线程
   * @param {Object} message - 消息对象
   */
  postMessage(message) {
    self.postMessage(message);
  }
}

// Worker 实例
const loadManager = new TilesetLoadManager();

// 监听主线程消息
self.addEventListener('message', (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'ADD_TO_QUEUE':
      loadManager.addToQueue(data.modelInfo, data.priority);
      break;

    case 'MODEL_LOADED':
      loadManager.onModelLoaded(data.modelName, data.success);
      break;

    case 'UPDATE_PRIORITY':
      loadManager.updatePriority(data.modelName, data.priority);
      break;

    case 'GET_STATUS':
      loadManager.postMessage({
        type: 'STATUS_RESPONSE',
        data: loadManager.getStatus()
      });
      break;

    case 'SET_MAX_CONCURRENT':
      loadManager.maxConcurrentLoads = data.maxConcurrent;
      break;

    default:
      console.warn('Unknown message type:', type);
  }
});

// 定期发送状态更新
setInterval(() => {
  loadManager.postMessage({
    type: 'STATUS_UPDATE',
    data: loadManager.getStatus()
  });
}, 5000);