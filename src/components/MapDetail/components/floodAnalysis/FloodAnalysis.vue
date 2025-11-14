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
    <el-form label-width="80px" label-position="right" size="medium">
      <el-form-item label="典型水位" style="color: #fff !important">
        <div style="display: flex; align-items: center">
          <el-checkbox-group
            v-model="selectedWaterLevelList"
            size="medium"
            @change="handleWaterLevelList"
          >
            <el-checkbox-button
              v-for="waterLevel in effectWaterLevelList"
              :label="waterLevel.label"
              :key="waterLevel.id"
            >
              {{ waterLevel.name }}
            </el-checkbox-button>
          </el-checkbox-group>
          <!-- <span style="color: #fff; margin-left: 8px">米</span> -->
        </div>
      </el-form-item>
      <el-form-item label="是否单选" style="color: #fff !important">
        <div style="display: flex; align-items: center">
          <el-checkbox v-model="singleCheck" label="1">是</el-checkbox>
        </div>
      </el-form-item>
    </el-form>
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
          >影响区域列表(共{{ data.length }}条记录)</span
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
      <el-table :data="data" size="mini" height="60%" @row-click="handleRowClick">
        <el-table-column
          align="center"
          width="150"
          label="名称"
          prop="name"
        ></el-table-column>
        <el-table-column
          align="center"
          width="150"
          label="影响区域"
          prop="area"
        ></el-table-column>
        <el-table-column
          align="center"
          width="150"
          label="最大积水深度(m)"
          prop="depth"
        ></el-table-column>
      </el-table>
      <div class="flood-analysis-info" style="flex: 0; overflow: hidden">
        <div id="dat-gui-container"></div>
      </div>
      <EffectSta style="flex: 1"></EffectSta>
    </div>
  </div>
</template>

<script>
import { constant } from "@/map";
import EffectSta from "./EffectSta";
import waterLevelLayer from "@/map/cesium/layers/waterLevelLayer";

const { EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT } = constant;

const effectWaterLevelList = EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT.map(
  (item) => item.label
);

export default {
  components: {
    EffectSta,
  },
  data() {
    return {
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
        waterLevelLayer.add(obj.id, obj.zIndex);
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
      console.log("🚀 ~ this.selectedWaterLevelList:", this.selectedWaterLevelList);
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
      waterLevelLayer.add(item.id, item.zIndex);
      waterLevelLayer.add("sk");
      return item.label;
    });
    this.selectedWaterLevelList = selectedWaterLevelList;
    this.previousWaterLevelList = selectedWaterLevelList;
    this.$store.commit("selectedWaterLevelList", this.selectedWaterLevelList);
  },
  beforeDestroy() {
    waterLevelLayer.removeAll();
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
