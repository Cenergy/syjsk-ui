<template>
  <el-tabs v-model="activeName" class="dark" type="border-card">
    <!-- <el-tab-pane
            label="实时水雨情"
            lazy
        >
            <RTWaterRain />
        </el-tab-pane>
        <el-tab-pane
            label="水位过程线"
            lazy
        >
            <WaterRainProgress />
        </el-tab-pane>
        <el-tab-pane
            label="水位库容"
            lazy
        >
            <WaterCapacityRadio />
        </el-tab-pane> -->
    <!--        <el-tab-pane
            label="暴雨分析"
            lazy
        >
            <RainAnalysis />
        </el-tab-pane>  暴雨分析功能不完善 隐藏-->
    <el-tab-pane label="基本信息" lazy>
      <BaseInfo />
    </el-tab-pane>
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
    <el-tab-pane label="抢险预案">
      <Area1PaperPlan />
    </el-tab-pane>
    <el-tab-pane label="运行计划" lazy>
      <ReservePlan :id="id" />
    </el-tab-pane>
    <!-- 循环showw tabs-->
    <el-tab-pane v-for="(item, index) in showTabs" :key="index" :label="item" class="my-custom-class">
      <ImageContainer :imgUrl="getImgUrl(item)" />
    </el-tab-pane>
    <!-- <el-tab-pane label="告警记录" lazy>
      <AlarmRecord />
    </el-tab-pane> -->
  </el-tabs>
</template>
<script>
// import { findWatStationSkInfoJson } from '@/api/map/reservoir'
// import { getStationbystcd } from '@/api/gmfx/tbStation';

import popupMixin from "../popupMixin";
import BaseInfo from "./BaseInfo.vue";
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

const showTabs = [
  // "基本信息",
  "实时水雨情",
  "水位过程线",
  "水位库容",
  "视频监控",
  // "CIM",
  "责任人",
  // "值守人员",
  // "三个责任人",
  "大坝安全",
  "人员转移路线",
  "一页纸预案",
  // "街道一页纸",
  // "社区一页纸",
  // "抢险方案",
  // "工情信息",
];

export default {
  mixins: [popupMixin],
  components: {
    BaseInfo,
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
    };
  },
  methods: {
    getData() {},
    getImgUrl(tab) {
      return require(`@/assets/map/${tab}.png`);
    },
  },
  created() {
    this.getData();
  },
};
</script>
<style scoped>

</style>
