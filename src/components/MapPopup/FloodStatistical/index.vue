<template>
  <el-tabs v-model="activeName" class="dark" type="border-card">
    <!-- <el-tab-pane
        v-if="hasCamera"
        label="视频监控"
            lazy>
            <VideoMonitor />
        </el-tab-pane>
        <el-tab-pane
            label="责任人"
            lazy
        >
            <ResponsePerson />
        </el-tab-pane>
        <el-tab-pane label="抢险方案" lazy>
          <ReservePlan :id="id"/>
        </el-tab-pane>
        <el-tab-pane label="工情信息">
            <WorkInfo />
        </el-tab-pane>
        <el-tab-pane label="区级一张纸预案">
            <Area1PaperPlan />
        </el-tab-pane> -->
    <!-- <el-tab-pane label="街道一页纸">
            <Street1PaperPlan />
        </el-tab-pane>
        <el-tab-pane label="社区一页纸">
            <Community1PaperPlan />
        </el-tab-pane> -->
    <!--        <el-tab-pane label="监管记录">
          <monitor-record/>
        </el-tab-pane>
        <el-tab-pane label="设备管理"  lazy>
          <Equipment  :id="id"/>
        </el-tab-pane>-->

    <!-- <el-tab-pane label="水质情况" lazy>
      <water-quality />
    </el-tab-pane>
    <el-tab-pane label="大坝安全" lazy>
      <dam-monitor />
    </el-tab-pane> -->
    <!-- 循环showw tabs-->
    <el-tab-pane label="淹没统计" lazy>
      <EffectSta />
    </el-tab-pane>
    <el-tab-pane v-for="(item, index) in showTabs" :key="index" :label="item">
      <EffectSta :name="item" />
      <div>
        <div class="section-title">{{ name }}重点防护对象</div>
        <!-- 是個列表，有名稱和聯係人 -->
        <div class="table-container">
          <table class="rain-table">
            <thead>
              <tr>
                <th>防护对象名称</th>
                <th>联系人</th>
                <th>联系人电话</th>
                <th>防护等级</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in protectionObjects" :key="index" :class="{'highlight-row': item.status === '紧急'}">
                <td class="object-name">
                  <div class="name-with-icon">
                    <i :class="getObjectIcon(item.type)" class="object-icon"></i>
                    <span>{{ item.name }}</span>
                  </div>
                </td>
                <td class="contact-person">{{ item.contact }}</td>
                <td class="contact-phone">
                  <a :href="'tel:' + item.phone" class="phone-link">{{ item.phone }}</a>
                </td>
                <td class="protection-level">
                  <span :class="'level-' + item.level.toLowerCase()">{{ item.level }}</span>
                </td>
                <td class="status">
                  <span :class="'status-' + item.status" class="status-badge">{{ item.status }}</span>
                </td>
                <td class="actions">
                  <el-button size="mini" type="primary" @click="viewDetails(item)">详情</el-button>
                  <el-button size="mini" type="warning" @click="contactPerson(item)">联系</el-button>
                </td>
              </tr>
              <tr v-if="protectionObjects.length === 0" class="empty-row">
                <td colspan="6" class="empty-message">
                  <i class="el-icon-info"></i>
                  暂无防护对象数据
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="table-footer">
          <div class="summary-info">
            <span class="total-count">共 {{ protectionObjects.length }} 个防护对象</span>
            <span class="urgent-count" v-if="urgentCount > 0">紧急状态: {{ urgentCount }} 个</span>
          </div>
          <div class="legend">
            <span class="legend-item">
              <i class="legend-icon level-高"></i>高风险
            </span>
            <span class="legend-item">
              <i class="legend-icon level-中"></i>中风险
            </span>
            <span class="legend-item">
              <i class="legend-icon level-低"></i>低风险
            </span>
          </div>
        </div>
      </div>
    </el-tab-pane>
    <!-- <el-tab-pane label="告警记录" lazy>
      <AlarmRecord />
    </el-tab-pane> -->
  </el-tabs>
</template>
<script>
// import { findWatStationSkInfoJson } from '@/api/map/reservoir'
// import { getStationbystcd } from '@/api/gmfx/tbStation';
import { constant } from "@/map";

import popupMixin from "../popupMixin";
import BaseInfo from "./BaseInfo.vue";
import EffectSta from "@/components/MapDetail/components/floodAnalysis/EffectSta.vue";
// import RTWaterRain from './RTWaterRain.vue';
// import WaterRainProgress from './WaterRainProgress.vue';
// import WaterCapacityRadio from './WaterCapacityRadio.vue';
// import VideoMonitor from './VideoMonitor.vue';
// import ResponsePerson from './ResponsePerson.vue';
// import RefugeRoute from './RefugeRoute.vue';
import Area1PaperPlan from "./Area1PaperPlan.vue";
import ImageContainer from "./ImageContainer.vue";
// import Street1PaperPlan from './Street1PaperPlan.vue';
// import Community1PaperPlan from './Community1PaperPlan.vue';
// import WorkInfo from './WorkInfo.vue';
// import Equipment from './Equipment';
import ReservePlan from "./ReservePlan";
// import MonitorRecord from './MonitorRecord'
import WaterQuality from "./WaterQuality";
import AlarmRecord from "./AlarmRecord.vue";
import RainAnalysis from "./RainAnalysis.vue";

const showTabs = constant.MODEL_3DTILES_INFO_LIST.map((item) => item.name);

export default {
  mixins: [popupMixin],
  components: {
    BaseInfo,
    EffectSta,
    // RTWaterRain,
    // WaterRainProgress,
    // WaterCapacityRadio,
    // VideoMonitor,
    // ResponsePerson,
    // RefugeRoute,
    Area1PaperPlan,
    ImageContainer,
    // Street1PaperPlan,
    // Community1PaperPlan,
    // WorkInfo,
    // Equipment,
    ReservePlan,
    // MonitorRecord,
    WaterQuality,
    AlarmRecord,
    RainAnalysis,
  },
  data() {
    return {
      type: "Reservoir",
      id: null,
      romastcd: null,
      hasCamera: false,
      showTabs: showTabs,
      protectionObjects: [
        {
          name: "XX小学",
          contact: "张校长",
          phone: "13800138001",
          type: "school",
          level: "高",
          status: "正常"
        },
        {
          name: "XX医院",
          contact: "李院长",
          phone: "13800138002",
          type: "hospital",
          level: "高",
          status: "紧急"
        },
        {
          name: "XX养老院",
          contact: "王主任",
          phone: "13800138003",
          type: "elderly",
          level: "中",
          status: "正常"
        },
        {
          name: "XX幼儿园",
          contact: "陈园长",
          phone: "13800138004",
          type: "kindergarten",
          level: "高",
          status: "警告"
        },
        {
          name: "XX服务中心",
          contact: "刘主任",
          phone: "13800138005",
          type: "community",
          level: "中",
          status: "正常"
        },
        {
          name: "XX农贸市场",
          contact: "赵经理",
          phone: "13800138006",
          type: "commercial",
          level: "低",
          status: "正常"
        }
      ]
    };
  },
  computed: {
    urgentCount() {
      return this.protectionObjects.filter(item => item.status === '紧急').length;
    }
  },
  methods: {
    getData() {},
    getImgUrl(tab) {
      return require(`@/assets/map/${tab}.png`);
    },
    getObjectIcon(type) {
      const iconMap = {
        school: 'el-icon-school',
        hospital: 'el-icon-first-aid-kit',
        elderly: 'el-icon-user-solid',
        kindergarten: 'el-icon-sunny',
        community: 'el-icon-office-building',
        commercial: 'el-icon-shopping-bag-2'
      };
      return iconMap[type] || 'el-icon-location';
    },
    viewDetails(item) {
      this.$message.info(`查看 ${item.name} 的详细信息`);
      // 这里可以添加查看详情的逻辑
    },
    contactPerson(item) {
      this.$confirm(`是否联系 ${item.contact}？`, '联系确认', {
        confirmButtonText: '拨打电话',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        window.open(`tel:${item.phone}`);
      }).catch(() => {
        this.$message.info('已取消联系');
      });
    }
  },
  created() {
    this.getData();
  },
};
</script>
<style scoped>
.section-title {
  background: linear-gradient(90deg, #4a90e2, #357abd);
  color: white;
  padding: 8px 15px;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 15px;
  border-radius: 4px;
  text-align: center;
}

.table-container {
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.rain-table {
  width: 100%;
  border-collapse: collapse;
  background: transparent;
  color: #ffffff;
  font-size: 13px;
}

.rain-table th {
  background: linear-gradient(135deg, #2c3e50, #34495e);
  color: #ecf0f1;
  padding: 12px 8px;
  text-align: center;
  font-weight: 600;
  border: 1px solid #34495e;
  font-size: 12px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.rain-table td {
  padding: 10px 8px;
  text-align: center;
  border: 1px solid #34495e;
  background: rgba(44, 62, 80, 0.3);
  transition: all 0.3s ease;
}

.rain-table tbody tr:hover td {
  background: rgba(52, 73, 94, 0.6);
  transform: translateY(-1px);
}

.highlight-row td {
  background: rgba(231, 76, 60, 0.2) !important;
  border-color: #e74c3c !important;
}

.highlight-row:hover td {
  background: rgba(231, 76, 60, 0.4) !important;
}

.object-name {
  text-align: left !important;
  max-width: 150px;
}

.name-with-icon {
  display: flex;
  align-items: center;
  gap: 8px;
}

.object-icon {
  color: #3498db;
  font-size: 16px;
  flex-shrink: 0;
}

.contact-person {
  font-weight: 500;
  color: #ecf0f1;
}

.phone-link {
  color: #3498db;
  text-decoration: none;
  transition: color 0.3s ease;
}

.phone-link:hover {
  color: #5dade2;
  text-decoration: underline;
}

.protection-level span {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.level-高 {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
}

.level-中 {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
}

.level-低 {
  background: linear-gradient(135deg, #27ae60, #229954);
  color: white;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-正常 {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
}

.status-警告 {
  background: linear-gradient(135deg, #f39c12, #f1c40f);
  color: #2c3e50;
}

.status-紧急 {
  background: linear-gradient(135deg, #e74c3c, #ec7063);
  color: white;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(231, 76, 60, 0); }
  100% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0); }
}

.actions {
  white-space: nowrap;
}

.actions .el-button {
  margin: 0 2px;
  padding: 5px 10px;
  font-size: 11px;
}

.empty-row td {
  padding: 30px;
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
}

.empty-message i {
  margin-right: 8px;
  font-size: 16px;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: rgba(44, 62, 80, 0.5);
  border-radius: 6px;
  margin-top: 10px;
}

.summary-info {
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: #bdc3c7;
}

.total-count {
  font-weight: 600;
}

.urgent-count {
  color: #e74c3c;
  font-weight: 600;
  animation: blink 1.5s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.5; }
}

.legend {
  display: flex;
  gap: 15px;
  font-size: 11px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #bdc3c7;
}

.legend-icon {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.legend-icon.level-高 {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.legend-icon.level-中 {
  background: linear-gradient(135deg, #f39c12, #e67e22);
}

.legend-icon.level-低 {
  background: linear-gradient(135deg, #27ae60, #229954);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .table-container {
    padding: 10px;
    overflow-x: auto;
  }
  
  .rain-table {
    min-width: 600px;
  }
  
  .rain-table th,
  .rain-table td {
    padding: 8px 6px;
    font-size: 11px;
  }
  
  .table-footer {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .legend {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .actions .el-button {
    padding: 3px 6px;
    font-size: 10px;
  }
  
  .name-with-icon {
    flex-direction: column;
    gap: 4px;
  }
  
  .object-icon {
    font-size: 14px;
  }
}
</style>
