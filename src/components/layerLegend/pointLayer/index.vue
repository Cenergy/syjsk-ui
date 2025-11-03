<template>
  <div class="legendDetail">
    <div class="title">
      <span>地图图例</span>
    </div>
    <div class="content">
      <div class="item" v-for="(item, index) in pointLayerGroup" :key="index">
        <img :src="item.url" alt="">
        <div class="name">{{ item.label }}</div>
      </div>
    </div>
  </div>
</template>
<script>
export default {

  name: 'pointLayer',

  components: {},

  props: {
    pointLayerGroup: {
      type: Array,
      default: () => ([])
    }
  },

  data() {

    return {

    }

  },

  methods: {

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
  cursor: default;
  width: max-content;
  min-width: fit-content;
   background-color: rgba(29, 55, 60, 0.65);
  border-radius: 5px;
  // border: 1px solid #ccc;
  // backdrop-filter: blur(5px); /* 背景模糊 */
  // -webkit-backdrop-filter: blur(5px); /* 兼容老版本 Safari */
  display: flex;
  flex-direction: column;
  // justify-content: space-evenly;
  align-items: flex-start;

  .title {
    font-size: 0.8vw;
    color: #fff;
    font-weight: 550;
    letter-spacing: 0.05vw;
    margin: 0.4vh 0.3vw;
  }

  .content {
    width: auto;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    flex-wrap: wrap;
    padding: 0.6vh 0.4vw;
    max-width: 11vw;

    .item {
      display: flex;
      align-items: center;
      color: #FFF;
      margin: 0 0.05vw;

      .name {
        font-size: 0.7vw;
      }

      img {
        width: 2vw;
      }
    }
  }
}
</style>