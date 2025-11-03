<template>
  <div class="map-detail-wrapper">
    <div v-show="tabList.length" :class="['toggle', expand && 'expand']">
      <div style="display: flex; flex-direction: column; justify-content: right">
        <span class="rightPanelExpand" @click="handleSwitch">{{
          expand ? "⟩" : "⟨"
        }}</span>
        <div class="mapLayerContent" style="clear: both">
          <template>
            <div
              class="layer-controller-wrapper"
              :style="{
                top: '10px',
              }"
            >
              <button
                v-for="(item, idx) in layerList"
                :key="idx"
                type="primary"
                size="small"
                :class="['layer-controller-toggle2', activeIdx == idx ? 'active' : '']"
                @click="handleClickBtn(item,idx, $event)"
              >
                {{ item }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
    <div v-show="expand && tabList.length" class="panel">
      <div class="mask right" v-show="tabList.length"></div>
      <el-tabs v-show="tabList.length" v-model="activeTab" class="dark-tabs" type="card">
        <el-tab-pane
          v-for="item of tabList"
          :key="item.value"
          :name="item.value"
          :label="item.label"
          style="padding: 0px 10px"
        >
          <component :is="item.value"></component>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>
<script>
import * as components from "./components";
import { constant } from "@/map";
// import Waterlogging from './components/Waterlogging.vue'

export default {
  components,

  data() {
    return {
      /**
       * {Object} tab
       * {String} tab.label tab标题
       * {String} tab.value tab类型
       */
      tabList: [],
      activeIdx: 0,
      activeTab: "",
      expand: false,
      layerList:[...constant.VIEW_SETTINGS_MAP.keys(),...constant.MODEL_3DTILES_INFO_LIST.map(item=>item.name)]
    };
  },
  methods: {
    handleSwitch() {
      this.expand = !this.expand;
    },
    handleToggleMapSide() {},
    handleClickBtn(item, idx, e) {
      this.activeIdx = idx;
      this.$bus.emit("mapLocate", {
        type: "FlyToLocal",
        data: item,
      });
    },
    handleAddPanel(data) {
      //可显示弹窗的类型
      const isShowPanel = ["积涝点水位", "洪涝风险", "淹没分析"];
      if (isShowPanel.includes(data.label)) {
      // if (true) {
        let idx = this.tabList.findIndex((item) => item.label == data.label);
        if (idx == -1) {
          this.tabList.push(data);
        }
        this.expand = true;
        this.activeTab = data.value;
      }
    },
    handleRemovePanel(value) {
      this.expand = true;
      this.tabList = this.tabList.filter((item) => item.value != value);
      if (this.tabList.length) {
        this.activeTab = this.tabList.at(-1).value;
      } else {
        this.activeTab = "";
      }
    },
    handleUpdatePanels(tabList) {
      this.tabList = tabList;
    },
  },
  mounted() { 
    console.log("map-detail-wrapper mounted",this.layerList);
  },
  created() {
    this.$bus.on("addMapDetail", this.handleAddPanel);
    this.$bus.on("removeMapDetail", this.handleRemovePanel);
  },
  destroyed() {
    this.$bus.off("addMapDetail", this.handleAddPanel);
    this.$bus.off("removeMapDetail", this.handleRemovePanel);
  },
};
</script>
<style lang="scss" scoped>
.map-detail-wrapper {
  position: absolute;
  height: 96%;
  z-index: 99;
  top: 2%;
  right: 0;
  width: 400px;

  .panel {
    margin: 0 5px;
    border-radius: 5px;
    box-shadow: inset 0 0 5px 1px #56a2f3;
    .el-tab-pane {
      padding: 0px !important;
    }
  }
}

.toggle {
  position: absolute;
  top: 5%;
  font-size: 20px;
  user-select: none;
  background: transparent;
  color: #ccc;
  right: 0%;

  .rightPanelExpand {
    padding: 18px 3px;
    cursor: pointer;
    box-shadow: inset 0 0 5px 1px #56a2f3;
    outline: 3px solid #2da6fc;
    border-radius: 10px 0px 0px 10px;
    cursor: pointer;
    margin-left: auto;
  }

  &.expand {
    right: calc(-4% + 413px);
    /* outline: 3px solid #2DA6FC; */
  }
  .mapLayerContent {
    width: 100px;
    font-size: 16px;
    font-weight: bold;
    padding: 10px 0px;
  }
}

::v-deep .el-tabs__item {
  height: auto;
  line-height: 1;
  padding: 10px 10px;
}

.mask {
  position: absolute;
  top: 0;
  right: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  pointer-events: none;

  &.right {
    right: 0;
    background: linear-gradient(
      90deg,
      rgba(0, 23, 53, 0) 0%,
      rgba(0, 23, 53, 0.5) 10%,
      rgba(0, 17, 39, 0.75) 100%
    );
  }
}

.layer-controller-wrapper {
  z-index: 3;
  display: flex;
  flex-direction: column;
  border: 1px solid #335c94;
  background-color: rgba(4, 26, 56, 0.56);
  padding: 5px;
}

.layer-controller-toggle2 {
  padding: 5px 10px;
  border-radius: 4px;
  background: linear-gradient(0deg, rgba(27, 46, 75, 0.7), rgba(27, 46, 75, 0.7)),
    linear-gradient(90deg, rgba(42, 88, 162, 0.9) 13.35%, rgba(25, 58, 109, 0) 75%);
  border: 1px solid #50beff;
  color: white;
  cursor: pointer;
  outline: none;
  & + .layer-controller-toggle2 {
    margin-top: 5px;
  }
  &.active {
    background: linear-gradient(0deg, rgba(27, 74, 75, 0.7), rgba(27, 74, 75, 0.7)),
      linear-gradient(90deg, rgba(42, 160, 162, 0.9) 13.35%, rgba(25, 108, 109, 0) 75%);
    border: 1px solid #50ffd7;

    // color: yellow!important;
  }
}
</style>
