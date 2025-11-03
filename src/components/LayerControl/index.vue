<template>
  <div class="panelContainer">
    <div class="layerSelectBtn" @click="changeLayerSelect('layerGuideLine', 10)">
      图层
    </div>
    <div class="layerSelect" ref="layerSelect" :class="{ show: whoShowsLayerSelect }">
      <template v-for="(items, groupName) in layerGroup">
        <el-checkbox
          v-show="whoShowsLayerSelect === groupName"
          v-for="item in items"
          :key="item.label"
          :label="item.label"
          :value="item.value"
          v-model="item.flag"
          @change="handleLayerSelect($event, item)"
        >
          {{ item.label }}
        </el-checkbox>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: "layerControl",
  components: {},
  props: {},
  data() {
    return {
      whoShowsLayerSelect: "",
      layerGroup: {
        layerGuideLine: [
          {
            value: "administrativeLayer",
            label: "行政区划",
            flag: false,
          },
          {
            value: "terrainLayer",
            label: "地形数据",
            flag: true,
          },
          {
            value: "cloudImage",
            label: "卫星云图",
            flag: false,
          },
          {
            value: "tilesetModelAccuracy",
            label: "倾斜摄影",
            flag: true,
          },
          {
            value: "riverLayer",
            label: "河流水系",
            flag: false,
          },
          {
            value: "weather",
            label: "降雨效果",
            flag: false,
          },
          {
            value: "watershedLayer",
            label: "流域范围",
            flag: false,
          },
          {
            value: "waterLayer",
            label: "模拟水位",
            flag: false,
          },
        ],
      },
    };
  },
  watch: {},
  computed: {},
  created() {},
  mounted() {},
  methods: {
    changeLayerSelect(val, top) {
      if (this.whoShowsLayerSelect == val) {
        this.whoShowsLayerSelect = "";
      } else {
        this.whoShowsLayerSelect = val;
        this.$refs.layerSelect.style.top = top ? top + "px" : "0px";
      }
    },
    handleLayerSelect(isSelected, data) {
      console.log(isSelected, data);
      if (isSelected) {
        this.$bus.emit("addMapLayer", {
          val: data.value,
          label: data.label,
        });
        this.$bus.emit("addMapDetail", {
          value: data.value,
          label: data.label,
        });
      } else {
        this.$bus.emit("removeMapLayer", {
          val: data.value,
          label: data.label,
        });
        this.$bus.emit("removeMapDetail", data.value);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.panelContainer {
  position: absolute;
  z-index: 100;
  background: url("../../assets/images/background2.png");
  background-size: 100% 100%;
  top: 10px;
  //   left: 10px;

  .layerSelectBtn {
    list-style: none;
    margin: 0;
    padding: 0;
    width: 100px;
    text-align: center;
    // border: 1px solid rgba(45, 137, 194, 0.8);
    // background: #FFF;
    background: rgba(29, 55, 60, 0.65);
    color: #fff;
    border-radius: 10px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 10px;
    // font-weight: 600;
    user-select: none;
  }

  .layerSelect {
    position: absolute;
    top: 0 !important;
    left: 102px;
    color: #fff;
    display: none;
    height: max-content;
    background-image: url("../../assets/images/box.png");
    background-color: rgba(0, 0, 0, 0.4); /* Darker background color */
    background-blend-mode: multiply; /* Blend mode to darken the image */
    background-size: 100% 100%;
    padding: 10px;
    grid-template-columns: 1fr 1fr; /* 2 columns with equal width */
    grid-gap: 10px 20px; /* Gap between grid items */
    align-items: start; /* Align items to the start of each grid cell */

    &.show {
      display: grid;
    }

    ::v-deep .el-checkbox {
      margin-right: 0;
      margin-bottom: 0;
    }

    ::v-deep .el-checkbox__label {
      color: #fff !important;
    }
  }
}
</style>
