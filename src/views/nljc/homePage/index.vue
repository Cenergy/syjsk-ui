<template>
  <div class="container">
    <div :class="['col', !isShowLeft && 'hide']">
      <div v-show="isShowLeft" class="inner">
        <weatherQuickReport style="flex: 1" />
        <keyWaterCondition style="flex: 1;" />
        <rainForecast style="flex: 1;" />
      </div>
    </div>
    <div class="middle">
      <div style="flex: 1;">
        <layerControl />
        <!-- <mapDetail /> -->
        <LMap />
      </div>
    </div>
    <!-- <div :class="['mapDetail', !isShowRight && 'hide']">

    </div> -->
  </div>
</template>
<script>
import weatherQuickReport from './components/weatherQuickReport'
import keyWaterCondition from './components/keyWaterCondition'
import rainForecast from './components/rainForecast'
// import mapDetail from '@/components/mapDetail/index.vue'
import layerControl from '@/components/LayerControl/index.vue'
export default {
  name: 'HomePage',
  components: {
    layerControl,
    // mapDetail,
    weatherQuickReport,
    keyWaterCondition,
    rainForecast
  },
  data() {
    return {
      isShowLeft: true,
      isShowRight: true,
    }
  },
  created() {

  },
  methods: {

  }
}
</script>
<style lang="scss" scoped>
.container {
  display: flex;
  height: 100%;
  width: 100%;
}

.col {
  height: 100%;
  width: 400px;
  flex: 0 0 400px;
  position: relative;
  height: 100%;
  background-color: #FFF;
  box-sizing: border-box;
  z-index: 2;

  .inner {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  &.hide {
    width: 0;
    flex: 0 0 0px
  }

  >.dark-card {
    z-index: 1;
    flex: 0 1 auto;
  }
}

.mapDetail {
  position: absolute;
  top: 150px;
  right: 10px;
  width: 400px;
  height: 600px;
  background-color: #FFF;
  z-index: 100;
}

.middle {
  position: relative;
  flex: 1;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>