<template>
  <div class="mapTool">
    <ul>
      <li @click="draw('point')">点</li>
      <li @click="draw('line')">线</li>
      <li @click="draw('area')">面</li>
      <li @click="reset">复位</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'mapTool',
  components: {},
  props: {},
  data() {
    return {
    }
  },
  watch: {},
  computed: {},
  created() {},
  mounted() {},
  methods: {
    draw(type) {
      this.$bus.emit('mapDraw', type);
    },
    reset() {
       
    }
  },
}
</script>
<style lang="scss" scoped>
.mapTool{
  ul{
    list-style:none;
  }
}
</style>