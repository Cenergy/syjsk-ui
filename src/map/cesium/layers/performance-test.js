/**
 * 3D Tiles 性能测试工具
 * 用于对比优化前后的性能差异
 */

class TilesetPerformanceTester {
  constructor() {
    this.metrics = {
      loadStartTime: null,
      loadEndTime: null,
      initialLoadTime: 0,
      memoryUsage: [],
      networkRequests: [],
      visibilityChecks: 0,
      cameraUpdates: 0
    };
    
    this.isMonitoring = false;
  }

  // 开始性能监控
  startMonitoring(tilesetLayer) {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.metrics.loadStartTime = performance.now();
    
    console.log('🔍 开始3D Tiles性能监控...');
    
    // 监控内存使用
    this.memoryMonitor = setInterval(() => {
      if (tilesetLayer) {
        const status = tilesetLayer.getLoadingStatus();
        this.metrics.memoryUsage.push({
          timestamp: Date.now(),
          cacheSize: status.cacheSize,
          loadedCount: status.loadedModelsCount,
          isLoading: status.isLoading
        });
      }
    }, 1000);

    // 监控网络请求（通过拦截fetch）
    this.originalFetch = window.fetch;
    window.fetch = (...args) => {
      const url = args[0];
      if (typeof url === 'string' && url.includes('.json')) {
        this.metrics.networkRequests.push({
          url,
          timestamp: Date.now(),
          type: '3dtiles'
        });
      }
      return this.originalFetch.apply(window, args);
    };

    return this;
  }

  // 停止监控
  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    this.metrics.loadEndTime = performance.now();
    this.metrics.initialLoadTime = this.metrics.loadEndTime - this.metrics.loadStartTime;
    
    // 清理监控器
    if (this.memoryMonitor) {
      clearInterval(this.memoryMonitor);
    }
    
    // 恢复原始fetch
    if (this.originalFetch) {
      window.fetch = this.originalFetch;
    }
    
    console.log('⏹️ 性能监控已停止');
    return this.generateReport();
  }

  // 记录可见性检查
  recordVisibilityCheck() {
    this.metrics.visibilityChecks++;
  }

  // 记录相机更新
  recordCameraUpdate() {
    this.metrics.cameraUpdates++;
  }

  // 生成性能报告
  generateReport() {
    const report = {
      // 加载性能
      loading: {
        totalTime: this.metrics.initialLoadTime,
        averageTimePerModel: this.metrics.initialLoadTime / 7, // 假设7个模型
        networkRequests: this.metrics.networkRequests.length
      },
      
      // 内存使用
      memory: {
        peakCacheSize: Math.max(...this.metrics.memoryUsage.map(m => m.cacheSize)),
        averageCacheSize: this.metrics.memoryUsage.reduce((sum, m) => sum + m.cacheSize, 0) / this.metrics.memoryUsage.length,
        memoryGrowthRate: this.calculateMemoryGrowthRate()
      },
      
      // 交互性能
      interaction: {
        visibilityChecks: this.metrics.visibilityChecks,
        cameraUpdates: this.metrics.cameraUpdates,
        checksPerUpdate: this.metrics.visibilityChecks / Math.max(this.metrics.cameraUpdates, 1)
      },
      
      // 网络性能
      network: {
        totalRequests: this.metrics.networkRequests.length,
        requestTimeline: this.metrics.networkRequests.map(r => ({
          time: r.timestamp - this.metrics.loadStartTime,
          url: r.url.split('/').pop()
        }))
      }
    };

    return report;
  }

  // 计算内存增长率
  calculateMemoryGrowthRate() {
    if (this.metrics.memoryUsage.length < 2) return 0;
    
    const first = this.metrics.memoryUsage[0];
    const last = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
    const timeSpan = last.timestamp - first.timestamp;
    const memoryGrowth = last.cacheSize - first.cacheSize;
    
    return timeSpan > 0 ? (memoryGrowth / timeSpan) * 1000 : 0; // 每秒增长
  }

  // 打印详细报告
  printDetailedReport(report) {
    console.log('\n📊 === 3D Tiles 性能报告 ===');
    
    console.log('\n🚀 加载性能:');
    console.log(`  总加载时间: ${report.loading.totalTime.toFixed(2)}ms`);
    console.log(`  平均每模型: ${report.loading.averageTimePerModel.toFixed(2)}ms`);
    console.log(`  网络请求数: ${report.loading.networkRequests}个`);
    
    console.log('\n💾 内存使用:');
    console.log(`  峰值缓存: ${report.memory.peakCacheSize}个模型`);
    console.log(`  平均缓存: ${report.memory.averageCacheSize.toFixed(1)}个模型`);
    console.log(`  内存增长率: ${report.memory.memoryGrowthRate.toFixed(2)}个/秒`);
    
    console.log('\n🎮 交互性能:');
    console.log(`  可见性检查: ${report.interaction.visibilityChecks}次`);
    console.log(`  相机更新: ${report.interaction.cameraUpdates}次`);
    console.log(`  检查效率: ${report.interaction.checksPerUpdate.toFixed(2)}次/更新`);
    
    console.log('\n🌐 网络性能:');
    console.log(`  总请求数: ${report.network.totalRequests}个`);
    console.log('  请求时间线:');
    report.network.requestTimeline.forEach((req, index) => {
      console.log(`    ${index + 1}. ${req.time.toFixed(0)}ms - ${req.url}`);
    });
    
    console.log('\n=========================\n');
  }

  // 性能评分
  calculatePerformanceScore(report) {
    let score = 100;
    
    // 加载时间评分 (期望 < 3000ms)
    if (report.loading.totalTime > 5000) score -= 30;
    else if (report.loading.totalTime > 3000) score -= 15;
    
    // 内存使用评分 (期望峰值 < 6)
    if (report.memory.peakCacheSize > 7) score -= 20;
    else if (report.memory.peakCacheSize > 5) score -= 10;
    
    // 交互效率评分 (期望 < 2次检查/更新)
    if (report.interaction.checksPerUpdate > 3) score -= 25;
    else if (report.interaction.checksPerUpdate > 2) score -= 10;
    
    // 网络效率评分 (期望并发请求 < 4)
    const concurrentRequests = this.calculateMaxConcurrentRequests(report.network.requestTimeline);
    if (concurrentRequests > 5) score -= 15;
    else if (concurrentRequests > 3) score -= 5;
    
    return Math.max(0, score);
  }

  // 计算最大并发请求数
  calculateMaxConcurrentRequests(timeline) {
    // 简化计算：假设每个请求持续500ms
    const requestDuration = 500;
    let maxConcurrent = 0;
    
    timeline.forEach((req, index) => {
      const concurrent = timeline.filter(other => 
        Math.abs(other.time - req.time) < requestDuration
      ).length;
      maxConcurrent = Math.max(maxConcurrent, concurrent);
    });
    
    return maxConcurrent;
  }
}

// 使用示例和自动化测试
class AutoPerformanceTest {
  constructor(tilesetLayer) {
    this.tilesetLayer = tilesetLayer;
    this.tester = new TilesetPerformanceTester();
  }

  // 运行完整性能测试
  async runFullTest() {
    console.log('🧪 开始自动化性能测试...');
    
    // 1. 开始监控
    this.tester.startMonitoring(this.tilesetLayer);
    
    // 2. 执行加载
    await this.tilesetLayer.show();
    
    // 3. 模拟用户交互
    await this.simulateUserInteraction();
    
    // 4. 停止监控并生成报告
    const report = this.tester.stopMonitoring();
    
    // 5. 分析结果
    this.tester.printDetailedReport(report);
    const score = this.tester.calculatePerformanceScore(report);
    
    console.log(`🏆 性能评分: ${score}/100`);
    
    if (score >= 80) {
      console.log('✅ 性能优秀！');
    } else if (score >= 60) {
      console.log('⚠️ 性能良好，但有改进空间');
    } else {
      console.log('❌ 性能需要优化');
    }
    
    return { report, score };
  }

  // 模拟用户交互
  async simulateUserInteraction() {
    console.log('🎮 模拟用户交互...');
    
    const viewer = this.tilesetLayer.viewer;
    if (!viewer) return;
    
    // 模拟相机移动
    for (let i = 0; i < 5; i++) {
      // 随机移动相机
      const randomLon = 118.5 + (Math.random() - 0.5) * 0.1;
      const randomLat = 24.8 + (Math.random() - 0.5) * 0.1;
      const randomHeight = 1000 + Math.random() * 10000;
      
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(randomLon, randomLat, randomHeight)
      });
      
      this.tester.recordCameraUpdate();
      
      // 等待一段时间让系统响应
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
}

// 导出工具
export { TilesetPerformanceTester, AutoPerformanceTest };

// 全局使用示例
window.testTilesetPerformance = async function(tilesetLayer) {
  const autoTest = new AutoPerformanceTest(tilesetLayer);
  return await autoTest.runFullTest();
};

console.log('🔧 3D Tiles性能测试工具已加载');
console.log('使用方法: window.testTilesetPerformance(tilesetModelAccuracy)');