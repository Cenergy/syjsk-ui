<template>
  <div style="display: flex; flex-direction: column; height: calc(100vh - 165px)">
    <!-- 增加区域下拉，默认和左侧保持一致 -->
    <el-form label-width="75px" label-position="right" size="medium">
      <el-form-item label="影响区域" style="color: #fff !important">
        <el-select
          v-model="selectedName"
          placeholder="请选择区域"
          @change="selectAreaName"
        >
          <el-option
            v-for="item in showWaterNameList"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <!-- 典型水位选择组件 -->
    <!-- <WaterLevelSelector
      :effectWaterLevelList="effectWaterLevelList"
      v-model="selectedWaterLevelList"
      :singleCheck.sync="singleCheck"
      :showSingleCheck="false"
      @change="handleWaterLevelList"
    /> -->

    <ZebraTitle style="margin-bottom: 5px">
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
    <div
      class="tableContainer"
      style="flex: 1; overflow: hidden; display: flex; flex-direction: column"
    >
      <div style="color: #fff; font-size: 1rem; text-indent: 0.5em">
        <span style="color: orange">当前水位:{{ displayWaterLevel }}</span>
      </div>
      <div style="color: #fff; font-size: 1rem; text-indent: 0.5em">
        <span style="color: orange">{{ selectedName }}</span> 共<span
          style="color: orange"
          >{{ count }}</span
        >户受影响
      </div>

      <el-table
        ref="table"
        :data="tableData"
        highlight-current-row
        size="mini"
        class="dark"
        height="100%"
        @row-click="handleRowClick"
      >
        <el-table-column align="center" label="所属村镇" prop="tsmc"></el-table-column>
        <el-table-column align="center" label="所属小组" prop="xmmc"></el-table-column>
        <el-table-column align="center" label="户主姓名" prop="cwbj"></el-table-column>
        <el-table-column align="center" label="联系电话" prop="lxdh"></el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
import { constant } from "@/map";
import houseData from "@/api/map/getHouses";
import waterLevelLayer from "@/map/cesium/layers/waterLevelLayer";
import affectedHousesLayer from "@/map/cesium/layers/affectedHousesLayer";
import WaterLevelSelector from "@/components/MapDetail/components/common/WaterLevelSelector.vue";

import { turf } from "swpdmap";


const { EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT, MODEL_3DTILES_INFO_LIST } = constant;

const selectedName = "全部";
const showWaterNameList = [
  selectedName,
  ...MODEL_3DTILES_INFO_LIST.map((item) => item.name),
];

export default {
  name: "floodRisk",

  components: { WaterLevelSelector },

  props: {
    waterLevelKey: {
      type: String,
      default: "",
    },
    housesCount: {
      type: Number,
      default: 0,
    },
    currentAreaName: {
      type: String,
      default: "全部",
    },
    cfg: {
      type: Object,
      default: () => {},
    },
  },

  data() {
    return {
      showWaterNameList,
      selectedName,
      tableData: [],
      orignalTableData: [],
      selectedWaterLevelList: [],
      previousWaterLevelList: [],
      effectWaterLevelList: EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT,
      singleCheck: true,
      count: 0,
    };
  },

  computed: {
    displayWaterLevel() {
      return this.waterLevelKey || this.selectedWaterLevelList[0] || "未选择";
    },
  },

  methods: {
    buildTableDataMock(options = {}) {
      console.log("🚀 ~ options:", options);
      // this.orignalTableData 过滤区域和水深，赋值给tableData
      console.log("🚀 ~ this.selectedName:", this.selectedName);
      const { cfg = {} } = options;
      const { value: waterHeight } = cfg;
      console.log("🚀 ~ waterHeight:", waterHeight);
      if (
        this.selectedName === "全部" ||
        this.selectedName === "整体影响" ||
        this.selectedName === ""
      ) {
         this.tableData = this.orignalTableData.filter((item) => {
          return item.hsx <= waterHeight;
        });
      } else {
        this.tableData = this.orignalTableData.filter((item) => {
          return item.RefName === this.selectedName && item.hsx <= waterHeight;
        });
      }

      this.count = this.tableData.length;
    },
    handleRowClick(row, column, event) {
      const filterData=houseData.filterHouses({OBJECTID: row.OBJECTID});
      console.log("🚀 ~ filterData:", filterData);
     const hightlightData = turf.featureCollection(filterData);
    //  高亮显示hightlightData
      affectedHousesLayer.highlight(hightlightData);

      // this.$bus.emit("mapLocate", {
      //   type: "FlyToLocal",
      //   data: row.id,
      // });

      console.log("🚀 ~ row:", row);
      // this.$bus.emit("changeFloodRiskImage", row.imageName);
    },
    selectAreaName(name) {
      let selectedName = name;
      if (name === "全部") {
        selectedName = "整体影响";
      }
      if (name !== "全部") {
        this.$bus.emit("changeSelectedAreaName", name);
      }
      this.$bus.emit("mapLocate", {
        type: "FlyToLocal",
        data: selectedName,
      });
    },
    handleWaterLevelList() {
      const addWaterLevelList = this.selectedWaterLevelList.filter(
        (item) => !this.previousWaterLevelList.includes(item)
      );
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
      console.log("🚀 ~ this.selectedWaterLevelList:", this.selectedWaterLevelList);
      this.previousWaterLevelList = [...this.selectedWaterLevelList];
      // this.$bus.emit("waterLevelChanged", this.selectedWaterLevelList);
      // this.$store.commit("selectedWaterLevelList", this.selectedWaterLevelList);
    },
  },

  mounted() {
    // 初始化表格 mock 数据
    houseData.getHouses().then((data) => {
      console.log("🚀 ~ data:", data);
      const { features } = data;
      console.log("🚀 ~ features:", features);
      const {waterLevel} = this.cfg;
      const featuresData = features.map((item, i) => {
        return {
          ...item.properties,
          tsmc: item.properties.RefName,
          xmmc: item.properties.ssc,
          cwbj: item.properties.wz,
          lxdh: item.properties.lxdh==0?"--":item.properties.lxdh,
        };
      });
      this.orignalTableData = Object.freeze(featuresData);
      this.buildTableDataMock({cfg:this.cfg});

      // 加载受影响民房面数据图层
      affectedHousesLayer.add({ data, id: "affected-houses", zIndex: 120 });
    });
    const selectedWaterLevelList = EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT.filter(
      (item) => item.checked
    ).map((item) => {
      waterLevelLayer.add(item);
      waterLevelLayer.add({ id: "sk" });
      return item.label;
    });
    this.selectedWaterLevelList = selectedWaterLevelList;
    this.previousWaterLevelList = selectedWaterLevelList;
    // this.$store.commit("selectedWaterLevelList", this.selectedWaterLevelList);
    // 若通过 props 传入 waterLevelKey，则选中对应水位
    if (this.waterLevelKey) {
      this.selectedWaterLevelList = [this.waterLevelKey];
      this.previousWaterLevelList = [this.waterLevelKey];
      // this.$store.commit("selectedWaterLevelList", this.selectedWaterLevelList);
    }
    this.$nextTick(() => {
      if (this.tableData.length > 0) {
        this.$refs.table.setCurrentRow(this.tableData[0]);
      }
    });
    // 若通过 props 传入 currentAreaName，则选中对应区域
    if (this.currentAreaName) {
      this.selectedName = this.currentAreaName;
    }
  },
  created() {
    this.$bus.on("changeSelectedAreaName", (name) => {
      if (this.showWaterNameList.includes(name)) {
        this.selectedName = name;
      } else {
        this.selectedName = "全部";
      }
    });
    this.$bus.on("changeWaterLevelType", (data) => {
      console.log("🚀 ~ data:", data);
      const { waterLevelKey } = data;
      this.selectedWaterLevelList = [waterLevelKey];
      console.log("🚀 ~ this.selectedWaterLevelList:", this.selectedWaterLevelList);
    });
    // 监听民房数点击事件，使用传入值刷新表格 mock 数据
    this.$bus.on("clickSubmergedCivilHousingCount", (data) => {
      this.buildTableDataMock(data);
    });
  },

  watch: {
    // 当 props 中的 waterLevelKey 变化时，同步选中状态
    waterLevelKey(newVal) {
      if (newVal) {
        this.selectedWaterLevelList = [newVal];
        this.previousWaterLevelList = [newVal];
        // this.$store.commit("selectedWaterLevelList", this.selectedWaterLevelList);
      }
    },
    // 影响区域选择变化时，重建表格数据
    selectedName() {
      this.buildTableDataMock({ cfg: this.cfg });
    },
    // housesCount 变化时重新生成表格 mock 数据
    housesCount() {
      this.buildTableDataMock();
    },
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

  beforeDestroy() {
    this.$bus.off("changeSelectedAreaName");
    this.$bus.off("clickSubmergedCivilHousingCount");
    waterLevelLayer.removeAll();
    affectedHousesLayer.removeAll();
  },
};
</script>
<style lang="scss" scoped>
::v-deep .el-checkbox-button {
  margin: 5px;
}
::v-deep .el-checkbox-button__inner {
  padding: 5px 8px;
  border-radius: 5px !important;
}

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
</style>
