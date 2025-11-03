<template>
  <div class="tab-page-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">{{ pageTitle }}</h1>
      <p class="page-description">{{ pageDescription }}</p>
    </div>

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
            <div class="content-header">
              <h2>{{ tab.title }}</h2>
              <p class="content-description">{{ tab.description }}</p>
            </div>
            
            <!-- 根据不同tab显示不同内容 -->
            <div class="content-body">
              <template v-if="tab.name === 'si-quan'">
                <div class="feature-grid">
                  <div class="feature-card" v-for="item in siQuanFeatures" :key="item.id">
                    <div class="feature-icon">
                      <i :class="item.icon"></i>
                    </div>
                    <h3>{{ item.title }}</h3>
                    <p>{{ item.description }}</p>
                  </div>
                </div>
              </template>
              
              <template v-else-if="tab.name === 'si-zhi'">
                <div class="feature-grid">
                  <div class="feature-card" v-for="item in siZhiFeatures" :key="item.id">
                    <div class="feature-icon">
                      <i :class="item.icon"></i>
                    </div>
                    <h3>{{ item.title }}</h3>
                    <p>{{ item.description }}</p>
                  </div>
                </div>
              </template>
              
              <template v-else-if="tab.name === 'si-yu'">
                <div class="feature-grid">
                  <div class="feature-card" v-for="item in siYuFeatures" :key="item.id">
                    <div class="feature-icon">
                      <i :class="item.icon"></i>
                    </div>
                    <h3>{{ item.title }}</h3>
                    <p>{{ item.description }}</p>
                  </div>
                </div>
              </template>
              
              <template v-else-if="tab.name === 'si-guan'">
                <div class="feature-grid">
                  <div class="feature-card" v-for="item in siGuanFeatures" :key="item.id">
                    <div class="feature-icon">
                      <i :class="item.icon"></i>
                    </div>
                    <h3>{{ item.title }}</h3>
                    <p>{{ item.description }}</p>
                  </div>
                </div>
              </template>
              
              <template v-else-if="tab.name === 'data-mgn'">
                <div class="feature-grid">
                  <div class="feature-card" v-for="item in dataMgnFeatures" :key="item.id">
                    <div class="feature-icon">
                      <i :class="item.icon"></i>
                    </div>
                    <h3>{{ item.title }}</h3>
                    <p>{{ item.description }}</p>
                  </div>
                </div>
              </template>
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
    }
  },
  watch: {
    pageType: {
      immediate: true,
      handler(newType) {
        this.activeTab = newType;
      }
    }
  },
  methods: {
    handleTabClick(tab) {
      // Tab切换时可以添加额外逻辑
      console.log('切换到Tab:', tab.name);
    }
  }
}
</script>

<style scoped>
.tab-page-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 30px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 10px;
}

.page-title {
  font-size: 2.5em;
  margin: 0 0 10px 0;
  font-weight: 300;
}

.page-description {
  font-size: 1.2em;
  margin: 0;
  opacity: 0.9;
}

.tab-navigation {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.tab-content {
  padding: 30px;
}

.content-header {
  text-align: center;
  margin-bottom: 40px;
}

.content-header h2 {
  font-size: 2em;
  color: #303133;
  margin: 0 0 10px 0;
}

.content-description {
  font-size: 1.1em;
  color: #606266;
  margin: 0;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  margin-top: 30px;
}

.feature-card {
  background: white;
  padding: 30px 20px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid #ebeef5;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px 0 rgba(0, 0, 0, 0.15);
}

.feature-icon {
  margin-bottom: 20px;
}

.feature-icon i {
  font-size: 3em;
  color: #409eff;
}

.feature-card h3 {
  font-size: 1.3em;
  color: #303133;
  margin: 0 0 15px 0;
}

.feature-card p {
  color: #606266;
  line-height: 1.6;
  margin: 0;
}

/* Tab样式优化 */
::v-deep .el-tabs--border-card {
  border: none;
  box-shadow: none;
}

::v-deep .el-tabs--border-card > .el-tabs__header {
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
}

::v-deep .el-tabs--border-card > .el-tabs__header .el-tabs__item {
  border: none;
  color: #606266;
  font-weight: 500;
}

::v-deep .el-tabs--border-card > .el-tabs__header .el-tabs__item.is-active {
  background: white;
  color: #409eff;
  border-bottom: 2px solid #409eff;
}

::v-deep .el-tabs__content {
  padding: 0;
}
</style>