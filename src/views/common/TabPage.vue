<template>
  <div class="tab-page-container">
    <!-- Tab 导航 -->
    <div class="tab-navigation">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick" type="border-card">
        <el-tab-pane 
          v-for="tab in tabList" 
          :key="tab.name" 
          :label="tab.label" 
          :name="tab.name"
        >
          <div class="tab-content">
            <!-- 根据不同tab显示不同内容 -->
            <div class="content-body">
              <!-- 视频播放区域 -->
              <div class="video-section">
                <div class="video-container">
                  <video 
                    ref="videoPlayer"
                    :src="currentVideoSrc"
                    controls
                    preload="metadata"
                    @loadedmetadata="onVideoLoaded"
                    @error="onVideoError"
                  >
                    您的浏览器不支持视频播放
                  </video>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TabPage',
  data() {
    return {
      activeTab: '',
      videoLoaded: false,
      isFullscreen: false,
      // 视频源配置
      videoSources: {
        'si-quan': '/geodata/videos/1.mp4',
        'si-zhi': '/geodata/videos/2.mp4',
        'si-yu': '/geodata/videos/3.mp4',
        'si-guan': '/geodata/videos/4.mp4',
        'data-mgn': '/geodata/videos/1.mp4' // 默认使用第一个视频
      },
      // Tab配置
      tabConfigs: {
        'si-quan': {
          title: '四全管理',
          description: '全覆盖、全要素、全天候、全周期的综合管理系统',
          tabs: [
            { name: 'si-quan', label: '四全', title: '四全管理', description: '全覆盖、全要素、全天候、全周期' }
          ]
        },
        'si-zhi': {
          title: '四制管理',
          description: '制度化、规范化、标准化、信息化的管理体系',
          tabs: [
            { name: 'si-zhi', label: '四制', title: '四制管理', description: '制度化、规范化、标准化、信息化' }
          ]
        },
        'si-yu': {
          title: '四预管理',
          description: '预报、预警、预演、预案的预防性管理系统',
          tabs: [
            { name: 'si-yu', label: '四预', title: '四预管理', description: '预报、预警、预演、预案' }
          ]
        },
        'si-guan': {
          title: '四管管理',
          description: '水库除险、安全体检、维修养护、安全保障的管理系统',
          tabs: [
            { name: 'si-guan', label: '四管', title: '四管管理', description: '水库除险、安全体检、维修养护、安全保障' }
          ]
        },
        'data-mgn': {
          title: '数据管理',
          description: '数据采集、存储、分析、应用的综合管理平台',
          tabs: [
            { name: 'data-mgn', label: '数据管理', title: '数据管理', description: '数据采集、存储、分析、应用' }
          ]
        }
      },
      // 各个模块的功能特性
      siQuanFeatures: [
        { id: 1, title: '全覆盖', description: '覆盖水库全域范围，无死角监控', icon: 'el-icon-view' },
        { id: 2, title: '全要素', description: '监控水位、流量、降雨等所有要素', icon: 'el-icon-data-analysis' },
        { id: 3, title: '全天候', description: '24小时不间断监控预警', icon: 'el-icon-time' },
        { id: 4, title: '全周期', description: '覆盖建设、运行、维护全生命周期', icon: 'el-icon-refresh' }
      ],
      siZhiFeatures: [
        { id: 1, title: '制度化', description: '建立完善的管理制度体系', icon: 'el-icon-document' },
        { id: 2, title: '规范化', description: '标准化的操作流程和规范', icon: 'el-icon-s-order' },
        { id: 3, title: '标准化', description: '统一的技术标准和规范', icon: 'el-icon-medal' },
        { id: 4, title: '信息化', description: '数字化、智能化管理手段', icon: 'el-icon-monitor' }
      ],
      siYuFeatures: [
        { id: 1, title: '预报', description: '水文气象预报和趋势分析', icon: 'el-icon-cloudy' },
        { id: 2, title: '预警', description: '风险识别和预警信息发布', icon: 'el-icon-warning' },
        { id: 3, title: '预演', description: '应急场景模拟和演练', icon: 'el-icon-video-play' },
        { id: 4, title: '预案', description: '应急预案制定和管理', icon: 'el-icon-notebook-2' }
      ],
      siGuanFeatures: [
        { id: 1, title: '水库除险', description: '水库安全隐患排查和处理', icon: 'el-icon-warning-outline' },
        { id: 2, title: '安全体检', description: '定期安全检查和评估', icon: 'el-icon-search' },
        { id: 3, title: '维修养护', description: '设施设备维护和保养', icon: 'el-icon-setting' },
        { id: 4, title: '安全保障', description: '安全运行保障措施', icon: 'el-icon-lock' }
      ],
      dataMgnFeatures: [
        { id: 1, title: '数据采集', description: '多源数据自动采集和汇聚', icon: 'el-icon-download' },
        { id: 2, title: '数据存储', description: '海量数据安全存储管理', icon: 'el-icon-folder' },
        { id: 3, title: '数据分析', description: '智能数据分析和挖掘', icon: 'el-icon-pie-chart' },
        { id: 4, title: '数据应用', description: '数据可视化和决策支持', icon: 'el-icon-s-data' }
      ]
    }
  },
  computed: {
    // 当前页面类型
    pageType() {
      return this.$route.meta?.type || this.$route.params.type || this.$route.query.type || 'si-quan';
    },
    // 当前页面配置
    currentConfig() {
      return this.tabConfigs[this.pageType] || this.tabConfigs['si-quan'];
    },
    // 页面标题
    pageTitle() {
      return this.currentConfig.title;
    },
    // 页面描述
    pageDescription() {
      return this.currentConfig.description;
    },
    // Tab列表
    tabList() {
      return this.currentConfig.tabs;
    },
    // 当前视频源
    currentVideoSrc() {
      return this.videoSources[this.pageType] || this.videoSources['si-quan'];
    }
  },
  watch: {
    pageType: {
      immediate: true,
      handler(newType) {
        this.activeTab = newType;
        // 切换tab时重置视频状态
        this.videoLoaded = false;
        this.isFullscreen = false;
        this.$nextTick(() => {
          if (this.$refs.videoPlayer) {
            this.$refs.videoPlayer.load();
          }
        });
      }
    }
  },
  methods: {
    handleTabClick(tab) {
      // Tab切换时可以添加额外逻辑
      console.log('切换到Tab:', tab.name);
    },
    // 视频加载完成
    onVideoLoaded() {
      this.videoLoaded = true;
      console.log('视频加载完成');
    },
    // 视频加载错误
    onVideoError(error) {
      console.error('视频加载失败:', error);
      this.$message.error('视频加载失败，请检查视频文件是否存在');
    },
    // 切换全屏
    toggleFullscreen() {
      const video = this.$refs.videoPlayer;
      if (!video) return;

      if (!this.isFullscreen) {
        // 进入全屏
        if (video.requestFullscreen) {
          video.requestFullscreen();
        } else if (video.webkitRequestFullscreen) {
          video.webkitRequestFullscreen();
        } else if (video.mozRequestFullScreen) {
          video.mozRequestFullScreen();
        } else if (video.msRequestFullscreen) {
          video.msRequestFullscreen();
        }
      } else {
        // 退出全屏
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    },
    // 监听全屏状态变化
    handleFullscreenChange() {
      this.isFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
    }
  },
  mounted() {
    // 监听全屏状态变化事件
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', this.handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', this.handleFullscreenChange);
  },
  beforeDestroy() {
    // 清理事件监听器
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('mozfullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('MSFullscreenChange', this.handleFullscreenChange);
  }
}
</script>

<style scoped>
.tab-page-container {
  padding: 0;
  background: rgba(45,49,58,1);
  height: 100%;
  margin-top:-20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.tab-navigation {
  background: white;
  border-radius: 0;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tab-content {
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 视频播放器样式 */
.video-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.video-container {
  background: #000;
  border-radius: 0;
  overflow: hidden;
  box-shadow: none;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.video-container video {
  width: 100%;
  flex: 1;
  display: block;
  background: rgba(45,49,58,1);
  object-fit: fill;
}

.video-controls {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  text-align: center;
  flex-shrink: 0;
}

.video-controls .el-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-weight: 500;
}

.video-controls .el-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.video-controls .el-button:disabled {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.5);
}

/* Tab样式优化 */
::v-deep .el-tabs--border-card {
  border: none;
  box-shadow: none;
  height: 100%;
  display: flex;
  flex-direction: column;
}

::v-deep .el-tabs--border-card > .el-tabs__header {
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

::v-deep .el-tabs--border-card > .el-tabs__header .el-tabs__item {
  border: none;
  color: #606266;
  font-weight: 500;
  height:0px;
  /* 隐藏tab标签文字 */
  font-size: 0;
  text-indent: -9999px;
  overflow: hidden;
  width: 50px; /* 设置固定宽度 */
}

::v-deep .el-tabs--border-card > .el-tabs__header .el-tabs__item.is-active {
  background: white;
  color: #409eff;
  border-bottom: 2px solid #409eff;
}

::v-deep .el-tabs__content {
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}
::v-deep .el-tabs__header{
  height: 0px;
}

::v-deep .el-tab-pane {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 全屏时的样式 */
video:fullscreen {
  width: 100vw;
  height: 100vh;
  object-fit: contain;
}

video:-webkit-full-screen {
  width: 100vw;
  height: 100vh;
  object-fit: contain;
}

video:-moz-full-screen {
  width: 100vw;
  height: 100vh;
  object-fit: contain;
}

video:-ms-fullscreen {
  width: 100vw;
  height: 100vh;
  object-fit: contain;
}
</style>