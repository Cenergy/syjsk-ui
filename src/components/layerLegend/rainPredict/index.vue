<template>
  <div class="legendDetail">
    <div class="title">
      <span>数据时间：</span>
      <span>{{ rainPredictData.yy }}年{{ rainPredictData.mm }}月{{ rainPredictData.dd }}日&nbsp;&nbsp;{{ rainPredictData.hh }}点{{ rainPredictData.mi
      }}分</span>
    </div>
    <div class="content">
      <div class="colorContainer" v-for="item in colorGroup" :key="item.scale">
        <span style="font-size: 0.8vw;">{{ item.scale }}</span>
        <div :style="{
          width: '3.5vw',
          height: '2vh',
          display: 'inline-block',
          background: item.color
        }"></div>
      </div>


    </div>
  </div>
</template>
<script>
export default {
  name: 'cloudLegend',
  components: {},
  props: {
    rainPredictData: {
      type: Object,
      default: () => ({})
    }
  },

  data() {

    return {
      time: {
        yy: "",
        mm: "",
        dd: "",
        hh: "",
        mi: "",
        ss: "",
      },
      colorGroup: [
        { color: '#F271D0', scale: -90 },
        { color: '#F277CD', scale: -88 },
        { color: '#F27ECB', scale: -86 },
        { color: '#F285C8', scale: -84 },
        { color: '#F28CC6', scale: -82 },
        { color: '#F393C3', scale: -80 },
        { color: '#F39AC1', scale: -78 },
        { color: '#F3A1BE', scale: -76 },
        { color: '#F3A8BC', scale: -74 },
        { color: '#F3AFB9', scale: -72 },
        { color: '#F45F60', scale: -70 },
        { color: '#F3676A', scale: -68 },
        { color: '#F27074', scale: -66 },
        { color: '#F1787F', scale: -64 },
        { color: '#F18189', scale: -62 },
        { color: '#F08A94', scale: -60 },
        { color: '#EF929E', scale: -58 },
        { color: '#EF9BA8', scale: -56 },
        { color: '#EEA3B3', scale: -54 },
        { color: '#EDACBD', scale: -52 },
        { color: '#EDB5C8', scale: -50 },
        { color: '#EDB9CA', scale: -48 },
        { color: '#EDBDCD', scale: -46 },
        { color: '#EDC1D0', scale: -44 },
        { color: '#EDC5D3', scale: -42 },
        { color: '#EDCAD6', scale: -40 },
        { color: '#EDCED9', scale: -38 },
        { color: '#EDD2DC', scale: -36 },
        { color: '#EDD6DF', scale: -34 },
        { color: '#EDDAE2', scale: -32 },
        { color: '#EEE7FF', scale: -30 },
        { color: '#E7E0E6', scale: -28 },
        { color: '#E0DAE2', scale: -26 },
        { color: '#D9D4DE', scale: -24 },
        { color: '#D2CDDB', scale: -22 },
        { color: '#CBC7D7', scale: -20 },
        { color: '#C4C1D3', scale: -18 },
        { color: '#BDBAD0', scale: -16 },
        { color: '#B6B4CC', scale: -14 },
        { color: '#AFAEC8', scale: -12 },
        { color: '#A5A6C4', scale: -10 }
      ],

    }

  },

  methods: {

  },

  mounted() {

  },

  watch: {
    // rainPredictData(val) {
    //   this.time = val
    // }
  }

}

</script>
<style lang="scss" scoped>
.legendDetail {
  pointer-events: auto;
  cursor: default;
  width: 100%;
  height: 8vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  color: #fff;

  .title {
    font-size: 1vw;


  }
}

.content {
  display: flex;

  .colorContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}

.color-legend {
  text-align: center;
}
</style>