<template>
  <div ref="mapWrapRef" style="width: 100%; height: 100%; position: relative;">
    <!-- <canvas id="canvasMap" style="display: none;"></canvas> -->
    <!-- <div class="map-btn" style="top: 10px; right: 90px;" @click="handleFullScreen">
      <i class="el-icon-full-screen"></i>
      {{ isFullscreen ? '取消' : '' }}全屏
    </div> -->
    <div id="map" ref="mapRef"></div>
  </div>
</template>
<script>
import { home as mapBus } from "@/map/leaflet";

export default {
  props: {
    mapBus: {
      type: Object,
      default() {
        return mapBus;
      }
    }
  },
  data() {
    return {
      isFullscreen: false,
    };
  },
  mounted() {
    // 地图初始化
    this.mapBus.startup && this.mapBus.startup();
  },
  destroyed() {
    // 地图销毁
    this.mapBus.destroy && this.mapBus.destroy();
  },
  methods: {
    handleClickZQ() {
      this.$bus.emit("addMapLayer", {
        val: 'ZQXX',
        label: "灾情信息"
      });
      this.$bus.emit("addMapDetail", {
        val: 'ZQXX',
        label: "灾情信息"
      });
    },
    handleFullScreen() {
      if (this.isFullscreen) {
        document.exitFullscreen();
      } else {
        this.$refs.mapWrapRef.requestFullscreen();
      }
      this.isFullscreen = !this.isFullscreen;
    }
  }

};
</script>
<style lang="scss" scoped>
/* @import "~"; */
#map {
  /* position: absolute !important;
  top: 0;
  left: 0; */
  width: 100%;
  height: 100%;
  z-index: 0;
  background-color: #005689;

  /* z-index: 1; */
}

.map-btn {
  z-index: 3;
  position: absolute;
  user-select: none;
  padding: 8px 15px;
  border-radius: 4px;
  color: white;
  border: 1px solid #1f73ff;
  background-color: #051b4c;
  cursor: pointer;
}

</style>
