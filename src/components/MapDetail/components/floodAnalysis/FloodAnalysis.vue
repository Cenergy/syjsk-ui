<template>
  <div
    style="
      display: flex;
      flex-direction: column;
      height: calc(100vh - 165px);
      color: #fff !important;
    "
  >
    <ZebraTitle style="margin-bottom: 15px">
      <span
        style="
          font-family: Source Han Sans CN;
          font-weight: 700;
          font-size: 16px;
          line-height: 28px;
          letter-spacing: 0%;
          color: #fff;
        "
        >查询条件</span
      >
    </ZebraTitle>
    <WaterLevelSelector
      :effectWaterLevelList="effectWaterLevelList"
      v-model="selectedWaterLevelList"
      :singleCheck.sync="singleCheck"
      @change="handleWaterLevelList"
    />
    <ZebraTitle>
      <div style="display: flex; justify-content: space-between; width: 100%">
        <span
          style="
            font-family: Source Han Sans CN;
            font-weight: 700;
            font-size: 16px;
            line-height: 28px;
            letter-spacing: 0%;
            color: #fff;
          "
          >{{ statisticName }}影响区域列表</span
        >
        <el-button type="primary" size="mini" @click="handleRowDblClick"
          >查看详情</el-button
        >
      </div>
    </ZebraTitle>
    <div
      class="tableContainer"
      style="flex: 1; overflow: hidden; display: flex; flex-direction: column"
    >
      <!-- <div style="display: flex; justify-content: flex-end; margin-bottom: 8px">
        <el-radio-group v-model="viewMode" size="mini">
          <el-radio-button label="list">列表展示</el-radio-button>
          <el-radio-button label="chart">图表展示</el-radio-button>
        </el-radio-group>
      </div> -->
      <EffectAll v-if="viewMode === 'list'" />
      <!-- <ChartShow v-else /> -->
    </div>
  </div>
</template>

<script>
import { constant } from "@/map";
import EffectSta from "./EffectSta";
import EffectAll from "./EffectAll.vue";
import ChartShow from "@/components/MapPopup/FloodStatistical/ChartShow.vue";
import waterLevelLayer from "@/map/cesium/layers/waterLevelLayer";
import waterGcdLayer from "@/map/cesium/layers/waterGcdLayer";
import affectedHousesLayer from "@/map/cesium/layers/affectedHousesLayer";
import WaterLevelSelector from "@/components/MapDetail/components/common/WaterLevelSelector.vue";

const { EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT, MODEL_3DTILES_INFO_LIST } = constant;

const effectWaterLevelList = EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT.map(
  (item) => item.label
);
const areaNameList = MODEL_3DTILES_INFO_LIST.map((item) => item.name);


export default {
  components: {
    EffectSta,
    EffectAll,
    ChartShow,
    WaterLevelSelector,
  },
  data() {
    return {
      viewMode: "list",
      selectedWaterLevelList: [],
      previousWaterLevelList: [],
      effectWaterLevelList: EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT,
      singleCheck: false,
      query: {
        hdnm: "",
        keyword: "",
        value: "198.4",
        ll: 20,
        sw: 30,
      },
      data: [],
      statisticName: "整体-",
      rawData: [],
      currentEffectLayer: null, // 当前影响范围线图层
    };
  },
  watch: {
    selectedWaterLevelList(newValue, oldValue) {
      if (this.singleCheck) {
        if (newValue.length > 1) {
          this.selectedWaterLevelList = [newValue[newValue.length - 1]];
          this.handleWaterLevelList(newValue, oldValue);
        }
      }
    },
    singleCheck(newValue, oldValue) {
      if (newValue) {
        if (this.selectedWaterLevelList.length > 1) {
          this.selectedWaterLevelList = [
            this.selectedWaterLevelList[this.selectedWaterLevelList.length - 1],
          ];
          this.handleWaterLevelList(newValue, oldValue);
        }
      }
    },
  },
  methods: {
    getData() {
      const res = { data: [] }; // await getWaterLoggingPointBaseInfo();
      this.data = res.data;
      //temp
      let tempData = constant.MODEL_3DTILES_INFO_LIST;
      tempData = tempData.map((item) => {
        item.rz = 0;
        item.jjsw = 0.15;
        return item;
      });
      this.data.push(...tempData);
    },
    handleWaterLevelList() {
      // 判断增加的数据有哪些
      const addWaterLevelList = this.selectedWaterLevelList.filter(
        (item) => !this.previousWaterLevelList.includes(item)
      );
      // 判断减少的数据有哪些
      const removeWaterLevelList = this.previousWaterLevelList.filter(
        (item) => !this.selectedWaterLevelList.includes(item)
      );
      
      addWaterLevelList.forEach((item) => {
        const obj = EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT.find((i) => i.label === item);
        if (!obj) return;
        waterLevelLayer.add(obj);
      });
      removeWaterLevelList.forEach((item) => {
        const obj = EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT.find((i) => i.label === item);
        if (!obj) return;
        waterLevelLayer.hide(obj.id);
      });
      const labelOrder = EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT.map((i) => i.label);
      this.selectedWaterLevelList = labelOrder.filter((label) =>
        this.selectedWaterLevelList.includes(label)
      );
      this.previousWaterLevelList = [...this.selectedWaterLevelList];
      this.$bus.emit("waterLevelChanged", this.selectedWaterLevelList);
      // 保存到store里面
      this.$store.commit("selectedWaterLevelList", this.selectedWaterLevelList);
      const maxDepth = Math.max(...EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT.filter(item => this.selectedWaterLevelList.includes(item.label)).map(item => item.value));
      // 显示高程控制点图层，联动“水深”标签
      waterGcdLayer.show({maxDepth});
    },
    handleRowClick(row) {
      // const row = this.data[idx]
      this.$bus.emit("mapLocate", {
        type: "River",
        data: row,
      });
    },
    handleRowDblClick(row) {
      this.$bus.emit("openMapDialog", {
        type: "FloodStatistical",
        data: row,
      });
    },
  },
  created() {
    this.getData();
  },
  mounted() {
    // 默认加载正常蓄水位的影响范围线
    // this.loadEffectLayer("198.4");
    const selectedWaterLevelList = EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT.filter(
      (item) => item.checked
    ).map((item) => {
      waterLevelLayer.add(item);
      waterLevelLayer.add({
        id: "sk",
      });
      return item.label;
    });
    this.selectedWaterLevelList = selectedWaterLevelList;
    this.previousWaterLevelList = selectedWaterLevelList;
    this.$store.commit("selectedWaterLevelList", this.selectedWaterLevelList);
    // 显示高程控制点图层，联动“水深”标签
    waterGcdLayer.show({maxDepth: 198.4});
    // 显示受影响的房子
    affectedHousesLayer.add({ id: "affected-houses", zIndex: 120 });
    this.$bus.on("mapLocate", (evt) => {
      const name = evt.data;
      if (areaNameList.includes(name)) {
        this.statisticName = `${name}-`;
      } else {
        this.statisticName = "整体-";
      }
    });
  },
  beforeDestroy() {
    waterLevelLayer.removeAll();
    // 隐藏高程控制点图层
    waterGcdLayer.hide();
  },
};
</script>

<style scoped>
.tableContainer ::v-deep .el-table {
  background-color: transparent !important;
  background: transparent !important;
}

::v-deep .el-form-item__label {
  color: white;
}

.tableContainer ::v-deep .el-table__header-wrapper {
  background-color: transparent !important;
  background: transparent !important;
}

.tableContainer ::v-deep .el-table__body-wrapper {
  background-color: transparent !important;
  background: transparent !important;
}

.tableContainer ::v-deep .el-table th,
.tableContainer ::v-deep .el-table td {
  background-color: transparent !important;
  background: transparent !important;
  color: white !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
}

.tableContainer ::v-deep .el-table th.el-table__cell {
  background-color: transparent !important;
  background: transparent !important;
}

.tableContainer ::v-deep .el-table td.el-table__cell {
  background-color: transparent !important;
  background: transparent !important;
}

.tableContainer ::v-deep .el-table tr {
  background-color: transparent !important;
  background: transparent !important;
}

.tableContainer ::v-deep .el-table tbody tr {
  background-color: transparent !important;
  background: transparent !important;
}

.tableContainer ::v-deep .el-table thead tr {
  background-color: transparent !important;
  background: transparent !important;
}

.tableContainer ::v-deep .el-table tr:hover > td {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.tableContainer ::v-deep .el-table--enable-row-hover .el-table__body tr:hover > td {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.tableContainer ::v-deep .el-table__empty-block {
  background-color: transparent !important;
  background: transparent !important;
}

.tableContainer ::v-deep .el-table__empty-text {
  color: white !important;
}

/* 确保表格容器本身也是透明的 */
.tableContainer {
  background-color: transparent !important;
  background: transparent !important;
}

/* 覆盖所有可能的白色背景 */
.tableContainer ::v-deep * {
  background-color: transparent !important;
}

.tableContainer ::v-deep .el-table__header {
  background-color: transparent !important;
}

.tableContainer ::v-deep .el-table__body {
  background-color: transparent !important;
}

.slider_label {
  text-align: center;
  vertical-align: middle;
  float: left;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  line-height: 40px;
  width: 70px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}
::v-deep .el-form-item__label {
  text-align: center;
}

::v-deep .el-checkbox-button {
  margin: 5px;
}
::v-deep .el-checkbox-button__inner {
  padding: 5px 8px;
  border-radius: 5px !important;
}
</style>
