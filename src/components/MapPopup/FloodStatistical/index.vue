<template>
  <el-tabs v-model="activeName" class="dark" type="border-card">
    <!-- 共同的头部或其他内容 -->
    <template>
      <div
        style="
          margin-top: 0px;
          margin-bottom: 20px;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        "
      >
        <div style="display: flex; flex-direction: row; align-items: center">
          <span style="color: #fff; font-size: 16px; font-weight: bold">典型水位:</span>
          <el-checkbox-group
            v-model="selectedWaterLevelList2"
            @change="handleWaterLevelList"
          >
            <el-checkbox-button
              v-for="waterLevel in effectWaterLevelList"
              :label="waterLevel.label"
              :key="waterLevel.id"
            >
              {{ waterLevel.name }}
            </el-checkbox-button>
          </el-checkbox-group>
        </div>
        <div class="view-toggle">
          <el-radio-group v-model="viewMode" size="mini" @input="handleViewModeChange">
            <el-radio-button label="list" icon="el-icon-menu">列表展示</el-radio-button>
            <el-radio-button label="chart" icon="el-icon-chart">图表展示</el-radio-button>
          </el-radio-group>
        </div>
      </div>
    </template>

    <!-- <el-tab-pane label="淹没统计" lazy>
      <EffectAll v-if="viewMode === 'list'"/>
      <ChartShow v-else />
    </el-tab-pane> -->
    <el-tab-pane v-for="(item, index) in showTabs" :key="index" :label="item" :name="item">
      <!-- <EffectSta :name="item" /> -->
      <EffectAll :areaName="isFirstTab(item) ? null : item" v-if="viewMode === 'list'" />
      <ChartShow :areaName="isFirstTab(item) ? null : item" v-else />
      <div v-show="!isFirstTab(item)">
        <div class="section-title">{{ item }}重点防护对象</div>
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
              <tr
                v-for="(item, index) in protectionObjects"
                :key="index"
                :class="{ 'highlight-row': item.status === '紧急' }"
              >
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
                  <span :class="'level-' + item.level.toLowerCase()">{{
                    item.level
                  }}</span>
                </td>
                <td class="status">
                  <span :class="'status-' + item.status" class="status-badge">{{
                    item.status
                  }}</span>
                </td>
                <td class="actions">
                  <el-button size="mini" type="primary" @click="viewDetails(item)"
                    >详情</el-button
                  >
                  <el-button size="mini" type="warning" @click="contactPerson(item)"
                    >联系</el-button
                  >
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
            <span class="urgent-count" v-if="urgentCount > 0"
              >紧急状态: {{ urgentCount }} 个</span
            >
          </div>
          <!-- <div class="legend">
            <span class="legend-item"> <i class="legend-icon level-高"></i>高风险 </span>
            <span class="legend-item"> <i class="legend-icon level-中"></i>中风险 </span>
            <span class="legend-item"> <i class="legend-icon level-低"></i>低风险 </span>
          </div> -->
        </div>
      </div>
    </el-tab-pane>
  </el-tabs>
</template>
<script>
import { constant } from "@/map";

import popupMixin from "../popupMixin";
import EffectSta from "@/components/MapDetail/components/floodAnalysis/EffectSta.vue";
import EffectAll from "./EffectAll.vue";
import ChartShow from "./ChartShow.vue";
import { mapState } from "vuex";

const { EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT, MODEL_3DTILES_INFO_LIST,MODEL_3DTILES_AREA_LIST } = constant;

const effectWaterLevelList = EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT.map(
  (item) => item.label
);

const firstName = "淹没统计";
const showTabs = [firstName, ...MODEL_3DTILES_AREA_LIST.map((item) => item.name)];

export default {
  inject: ["getPopupData"],
  mixins: [popupMixin],
  components: {
    EffectSta,
    EffectAll,
    ChartShow,
  },
  props: {
    popupData: {
      type: Object,
      default: {},
    },
  },
  computed: {
    ...mapState(["selectedWaterLevelList"]),
  },
  data() {
    return {
      viewMode: "list",
      type: "Reservoir",
      id: null,
      activeName:firstName,
      selectedWaterLevelList2: [],
      previousWaterLevelList: [],
      effectWaterLevelList: EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT,
      romastcd: null,
      hasCamera: false,
      showTabs: showTabs,
      protectionObjects: [
        // {
        //   name: "XX小学",
        //   contact: "张校长",
        //   phone: "13800138001",
        //   type: "school",
        //   level: "高",
        //   status: "正常",
        // },
        // {
        //   name: "XX医院",
        //   contact: "李院长",
        //   phone: "13800138002",
        //   type: "hospital",
        //   level: "高",
        //   status: "紧急",
        // },
        // {
        //   name: "XX养老院",
        //   contact: "王主任",
        //   phone: "13800138003",
        //   type: "elderly",
        //   level: "中",
        //   status: "正常",
        // },
        // {
        //   name: "XX幼儿园",
        //   contact: "陈园长",
        //   phone: "13800138004",
        //   type: "kindergarten",
        //   level: "高",
        //   status: "警告",
        // },
        // {
        //   name: "XX服务中心",
        //   contact: "刘主任",
        //   phone: "13800138005",
        //   type: "community",
        //   level: "中",
        //   status: "正常",
        // },
        // {
        //   name: "XX农贸市场",
        //   contact: "赵经理",
        //   phone: "13800138006",
        //   type: "commercial",
        //   level: "低",
        //   status: "正常",
        // },
      ],
    };
  },

  computed: {
    urgentCount() {
      return this.protectionObjects.filter((item) => item.status === "紧急").length;
    },
  },
  methods: {
    handleViewModeChange() {
      console.log("🚀 ~ this.viewMode:", this.viewMode);
    },
    isFirstTab(tab) {
      return tab === firstName;
    },
    getData() {},
    // 新增视图切换方法
    switchToList() {
      this.viewMode = "list";
    },
    switchToMap() {
      this.viewMode = "map";
    },
    handleWaterLevelList() {
      // 保存到store里面
      const labelOrder = EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT.map((i) => i.label);
      this.selectedWaterLevelList2 = labelOrder.filter((label) =>
        this.selectedWaterLevelList2.includes(label)
      );
      this.$store.commit("selectedWaterLevelList", this.selectedWaterLevelList2);
    },
    getImgUrl(tab) {
      return require(`@/assets/map/${tab}.png`);
    },
    getObjectIcon(type) {
      const iconMap = {
        school: "el-icon-school",
        hospital: "el-icon-first-aid-kit",
        elderly: "el-icon-user-solid",
        kindergarten: "el-icon-sunny",
        community: "el-icon-office-building",
        commercial: "el-icon-shopping-bag-2",
      };
      return iconMap[type] || "el-icon-location";
    },
    viewDetails(item) {
      this.$message.info(`查看 ${item.name} 的详细信息`);
      // 这里可以添加查看详情的逻辑
    },
    contactPerson(item) {
      this.$confirm(`是否联系 ${item.contact}？`, "联系确认", {
        confirmButtonText: "拨打电话",
        cancelButtonText: "取消",
        type: "info",
      })
        .then(() => {
          window.open(`tel:${item.phone}`);
        })
        .catch(() => {
          this.$message.info("已取消联系");
        });
    },
  },
  mounted() {
    const popupData=this.getPopupData();
    const {name}=popupData;
    this.activeName=name||firstName;
    console.log("🚀 ~ name:", name);
    this.selectedWaterLevelList2 = this.$store.getters.selectedWaterLevelList || [];
  },
  created() {
    this.getData();
  },
};
</script>
<style scoped>
::v-deep .el-form-item__label {
  text-align: center;
}

::v-deep .el-checkbox-button {
  margin: 5px;
}
::v-deep .el-checkbox-button__inner {
  padding: 5px 8px;
  border-radius: 5px !important;
  border: 1px solid #1890ff !important;
}

::v-deep .is-checked .el-checkbox-button__inner {
  background-color: #1890ff !important;
}
::v-deep .el-radio-group .is-active .el-radio-button__inner {
  background-color: #1890ff !important;
}
</style>
