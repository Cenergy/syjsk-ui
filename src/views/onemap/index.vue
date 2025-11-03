<template>
  <div style="height: 100%">
    <CMap style="position: fixed; top: 0; left: 0" />
    <el-row type="flex" style="height: 100%; pointer-events: none">
      <el-col :span="6">
        <div class="leftPanel">
          <div :class="['toggle', isShowLeft && 'expand']" @click="handleSwitch">
            {{ isShowLeft ? "⟨" : "⟩" }}
          </div>
          <div class="mask left" v-show="isShowLeft"></div>
          <div class="leftPanelContent" v-show="isShowLeft">
            <FirstContent />
            <SecondContent style="flex: 1" />
            <ThirdContent style="flex: 1" />
          </div>
        </div>
      </el-col>
      <el-col :span="mapSpan" style="position: relative; pointer-events: none">
        <div style="position: absolute; z-index: 2; top: 10px; left: 130px" v-if="false">
          <AlarmIcon
            v-for="alarm of alarmList"
            :key="alarm.recID"
            :icon="alarm.icon"
            alt.native="alarm.alarmType + alarm.alarmColor"
            title.native="alarm.str"
          />
        </div>
        <LayerControl style="top: 10px; left: 0px; pointer-events: all" />
        <layerLegend style="bottom: 10px; left: 0px" />
        <MapDetail style="pointer-events: all" />
        <!-- <waterSummary style="position: absolute; top: 10px; left: 250px;" /> -->
        <MapPopup></MapPopup>
        <div class="btnlist" v-show="false">
          <el-button type="primary" @click="removeRain">晴天</el-button>
          <el-button type="primary" @click="addRain('small')">小雨</el-button>
          <el-button type="primary" @click="addRain('medium')">中雨</el-button>
          <el-button type="primary" @click="addRain('heavy')">大雨</el-button>
        </div>
      </el-col>
      <PointDetail />
      <PipeDetail />
    </el-row>
    <FullscreenIframe :visible.sync="isShowIframe" :src="iframeUrl" />
    <!-- <FooterBar  :tab-list="[]" @click="handleSwitch" /> -->
  </div>
</template>
<script>
import { getWeatherAlarm } from "../../api/nljc";
import waterSummary from "@/components/summary/index.vue";
import LayerLegend from "@/components/layerLegend/index.vue";
import FlashNews from "./FlashNews.vue";


import FirstContent from "./FirstContent.vue";
import SecondContent from "./SecondContent.vue";
import ThirdContent from "./ThirdContent.vue";

import ForecastRain from "./ForecastRain.vue";
import PointDetail from "./PointDetail/index.vue";
import PipeDetail from "./PipeDetail/index.vue";

import AlarmIcon from "@/components/AlarmIcon";
import CMap from "@/components/CMap";
import FooterBar from "@/components/FooterBar";
import LayerControl from "@/components/LayerControl/index.vue";
import MapDetail from "@/components/MapDetail/index.vue";
import FullscreenIframe from "@/components/FullscreenIframe";
import MapPopup from "@/components/MapPopup/MapPopup.vue";

export default {
  components: {
    FlashNews,
    FirstContent,
    SecondContent,
    ThirdContent,
    ForecastRain,
    PointDetail,
    PipeDetail,
    CMap,
    LayerControl,
    MapDetail,
    AlarmIcon,
    LayerLegend,
    FullscreenIframe,
    waterSummary,
    FooterBar,
    MapPopup
  },
  data() {
    return {
      isShowLeft: true,
      isShowIframe: false,
      iframeUrl: "",
      alarmList: [],
    };
  },
  computed: {
    mapSpan() {
      return this.isShowLeft ? 18 : 24;
    },
  },
  methods: {
    handleSwitch() {
      this.isShowLeft = !this.isShowLeft;
    },
    removeRain() {
      this.$bus.emit("removeWeather", {});
    },
    addRain(type) {
      this.$bus.emit("addWeather", type);
    },
    onSwitchLeftCol(isShow) {
      this.isShowLeft = isShow;
    },
    onShowTflj() {
      this.iframeUrl = "http://192.168.117.20:8008/Html/LiteView/LiteView_Typhon.html";
      this.isShowIframe = true;
    },
    onShowQxyt() {
      this.iframeUrl = "https://ra.gd121.cn/radargenie/mapLayer?code=yuntu";
      this.isShowIframe = true;
    },
  },
  mounted() {
    getWeatherAlarm().then(({ data }) => {
      this.alarmList = data.subAlarm;
    });
    // this.$bus.on("switchLeftCol", this.onSwitchLeftCol)
    this.$bus.on("showTyphoonTrackDialog", this.onShowTflj);
    this.$bus.on("showCloudDialog", this.onShowQxyt);
    // this.$bus.emit("openJLDDetail", "462")
  },
  beforeDestroy() {
    // this.$bus.off("switchLeftCol", this.onSwitchLeftCol)
    this.$bus.off("showTyphoonTrackDialog", this.onShowTflj);
    this.$bus.off("showCloudDialog", this.onShowQxyt);
  },
};
</script>
<style scoped>
.leftPanel {
  position: absolute;
  height: 96%;
  /* display: flex; */
  z-index: 99;
  pointer-events: none;
  /* flex-direction: column; */
  top: 2%;

  & > * {
    pointer-events: auto;
  }

  .leftPanelContent {
    width: 400px;
    width: 400px;
    height: 100%;
    display: flex;
    flex-direction: column;

    & > .dark-card {
      margin: 5px 5px;
      border-radius: 3%;
    }
    & > .dark-card:first-child {
      margin-top: 0px;
    }
    & > .dark-card:last-child {
      margin-bottom: 0px;
    }
  }
}

.col {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
}

.btnlist {
  position: absolute;
  top: 51px;
  right: 414.5px;
}

.toggle {
  top: 5%;
  left: 0%;
  position: absolute;
  user-select: none;
  font-size: 20px;
  padding: 18px 3px;
  background: transparent;
  border-radius: 0px 10px 10px 0px;
  color: #ccc;
  cursor: pointer;
  box-shadow: inset 0 0 5px 1px #56a2f3;
  outline: 3px solid #2da6fc;

  &.expand {
    left: 99%;
    outline: 3px solid #56a2f3;
  }
}

.mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;

  &.left {
    left: 0;
    background: linear-gradient(
      270deg,
      rgba(0, 23, 53, 0) 0%,
      rgba(0, 23, 53, 0.5) 10%,
      rgba(0, 17, 39, 0.75) 100%
    );
  }
}
</style>
