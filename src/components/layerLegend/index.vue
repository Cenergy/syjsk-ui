<template>
  <div class="legendContainer" v-show="radar || pointLayerShow">
    <div class="legendGroup1">
      <pointLayer v-if="pointLayerShow" :pointLayerGroup="pointLayerGroup" />
      <rainMonitor v-if="rainMonitor" />
    </div>

    <cloudLegend v-if="cloud" :cloudLegend="cloudLegend" />
    <radarLegend v-if="radar" :radarData="radarData" />
  </div>
</template>
<script>
import radarLegend from './radar/index.vue'
import pointLayer from './pointLayer/index.vue'
import cloudLegend from './cloud/index.vue'
import rainMonitor from './rainMonitor/index.vue'
export default {
  name: 'layerLegend',
  components: { radarLegend, pointLayer, cloudLegend, rainMonitor },

  props: {},

  data() {
    return {
      //卫星云图图例
      cloud: false,
      cloudLegend: {},
      //雷达图例
      radar: false,
      radarData: {},
      //点图层图例
      // pointLayer: false,
      pointLayerGroup: [],
      //降雨监测
      rainMonitor: false,
    }
  },

  methods: {
    handleSetLegend(res) {
      const { type, data } = res
      if (type === 'radar') {
        this.radarData = data;
        this[type] = true;
      } else if (type === 'pointLayer') {
        this.pointLayerGroup.push(data);
      } else if (type === 'rainMonitor') {
        this[type] = true;
      }
    },
    handleDelLegend(res) {
      const { type, data } = res;
      if (type === 'radar' || type === 'rainMonitor') {
        this[type] = false;
      } else if (type === 'pointLayer') {
        this.pointLayerGroup = this.pointLayerGroup.filter(item => item.label !== data.label);
      }
    }
  },
  computed: {
    pointLayerShow() {
      return this.pointLayerGroup.length > 0;
    }
  },
  created() {
    this.$bus.on('setLegend', this.handleSetLegend)
    this.$bus.on('closeLegend', this.handleDelLegend)
  },
  destroyed() {
    this.$bus.off('setLegend', this.handleSetLegend)
    this.$bus.off('closeLegend', this.handleDelLegend)
  },
  mounted() {


  },

  watch: {

  }

}

</script>
<style lang="scss" scoped>
.legendContainer {
  position: absolute;
  pointer-events: none;
  // height: 20%;
  // border: 1px solid #000;
  .legendGroup1 {
    display: flex;
    align-items: flex-end;
    margin-bottom: 0.5vh;
  }
}
</style>