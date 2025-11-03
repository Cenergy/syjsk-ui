<template>
  <div class="legendDetail">
    <div class="title">
      <span>雨量图例</span>
    </div>
    <div class="content">
      <div class="item" v-for="(item, index) in rainGroup" :key="index">
        <div class="rectangle" :style="{ background: getRgbColor(item.color) }"></div>
        <span class="judge">{{ item.judge }}</span>
        <span class="label">{{ item.label }}</span>


      </div>
    </div>
  </div>
</template>
<script>
export default {

  name: 'rainMonitor',

  components: {},

  props: {},

  data() {

    return {
      rainGroup: [
        {
          judge: "<10mm",
          label: "小雨",
          color: [0, 253, 255]
        },
        {
          judge: "10-25mm",
          label: "中雨",
          color: [4, 229, 3]
        },
        {
          judge: "25-50mm",
          label: "大雨",
          color: [0, 12, 218]
        },
        {
          judge: "50-100mm",
          label: "暴雨",
          color: [250, 243, 11]
        },
        {
          judge: "100-250mm",
          label: "大暴雨",
          color: [250, 115, 31]
        },
      ]
    }

  },

  methods: {
    getRgbColor(colorArray) {
      return `rgb(${colorArray.join(',')})`;
    }
  },

  mounted() {

  },

  watch: {

  }

}

</script>
<style lang="scss" scoped>
.legendDetail {
  pointer-events: auto;
   background-color: rgba(29, 55, 60, 0.65);
  cursor: default;
  width: max-content;
  min-width: fit-content;
  border-radius: 5px;
  // border: 1px solid #ccc;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  margin-left: 0.8vw;
  max-height: 15vh;

  .title {
    font-size: 0.8vw;
    color: #FFF;
    font-weight: 500;
    letter-spacing: 0.05vw;
    margin: 0.4vh 0.3vw;
  }

  .content {
    width: auto;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    flex-wrap: wrap;
    padding: 0.6vh 0.4vw;
    max-width: 11vw;

    .item {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      color: #FFF;

      // margin: 0 0.05vw;
      .rectangle {
        width: 1vw;
        height: 1vh;
        margin-right: 2vw;
      }

      .label {
        font-size: 0.8vw;
      }

      .judge {
        width: 4.5vw;
        font-size: 0.8vw;
      }
    }

  }
}
</style>