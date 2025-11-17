<template>
  <div class="legendDetail">
    <div class="title">
      <span>{{ legendTitle }}</span>
    </div>
    <div class="content">
      <div class="item" v-for="(item, index) in legendItems" :key="index">
        <div class="rectangle" :style="{ background: item.color }"></div>
        <span class="label">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'waterLevelLegend',
  props: {
    legend: {
      type: Object,
      default: () => ({ label: '水位图例', items: [] })
    }
  },
  computed: {
    legendTitle() {
      return this.legend && this.legend.label ? this.legend.label : '水位图例';
    },
    legendItems() {
      const items = (this.legend && this.legend.items) || [];
      return Array.isArray(items) ? items : [];
    }
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
  display: flex;
  flex-direction: column;
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
    justify-content: flex-start;
    flex-wrap: wrap;
    padding: 0.6vh 0.4vw;
    max-width: 11vw;

    .item {
      display: flex;
      align-items: center;
      color: #FFF;
      margin: 0.2vh 0.2vw;

      .rectangle {
        width: 2vw;
        height: 2vh;
        margin-right: 0.3vw;
        border-radius: 2px;
        border: 1px solid rgba(255,255,255,0.4);
      }

      .label {
        font-size: 0.7vw;
      }
    }
  }
}
</style>