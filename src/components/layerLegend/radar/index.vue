<template>
  <div class="legendDetail">
    <div class="title">
      <span>雷达时间：</span>
      <span>{{ radarData.yy }}年{{ radarData.mm }}月{{ radarData.dd }}日&nbsp;&nbsp;{{ radarData.hh }}点{{ radarData.mi
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
  name: 'radarLegend',
  components: {},
  props: {
    radarData: {
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
        { color: '#87CEEB', scale: 5 },
        { color: '#0000FF', scale: 10 },
        { color: '#0080FF', scale: 15 },
        { color: '#00FF00', scale: 20 },
        { color: '#7CFC00', scale: 25 },
        { color: '#FFFF00', scale: 30 },
        { color: '#FFA500', scale: 35 },
        { color: '#FF4500', scale: 40 },
        { color: '#FF0000', scale: 45 },
        { color: '#FF00FF', scale: 50 },
        { color: '#DA70D6', scale: 55 },
        { color: '#9370DB', scale: 60 }
      ],

    }

  },

  methods: {

  },

  mounted() {

  },

  watch: {
    // radarData(val) {
    //   this.time = val
    // }
  }

}

</script>
<style lang="scss" scoped>
.legendDetail {
  pointer-events: auto;
   background-color: rgba(29, 55, 60, 0.65);
  cursor: default;
  width: 100%;
  height: 8vh;
  border-radius: 5px;
  // border: 1px solid #ccc;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  color: #FFF;

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