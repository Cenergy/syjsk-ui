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
        >个控制点位
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
        <el-table-column align="center" label="所属乡镇" prop="RefName"></el-table-column>
        <el-table-column align="center" label="高程点" prop="height"></el-table-column>
        <el-table-column align="center" label="参考水深(米)" prop="depth"></el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
import { constant } from "@/map";
import { gcdData } from "@/api/map";
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
  name: "waterGcdLayer",

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
      // 本地维护当前显示的水位标签，避免直接修改父传入的 props
      currentWaterLevelLabel: "",
      // 本地副本，避免直接修改 props.cfg
      localCfg: {},
    };
  },

  computed: {
    displayWaterLevel() {
      // 优先使用本地维护的当前水位标签，其次使用父传入的 waterLevelKey 或选中列表
      return (
        this.currentWaterLevelLabel ||
        this.waterLevelKey ||
        this.selectedWaterLevelList[0] ||
        "未选择"
      );
    },
  },

  methods: {
    buildTableDataMock(options = {}) {
      // this.orignalTableData 过滤区域和水深，赋值给tableData
      const { cfg = {} } = options;
      const { value: waterHeight, label } = cfg;
      console.log("🚀 ~ label:", label);
      // 记录当前水位标签到本地状态，避免直接修改 props
      this.currentWaterLevelLabel = label || "";
      console.log("🚀 ~ waterHeight:", waterHeight);
        console.log("🚀 ~ this.selectedName:", this.selectedName);
      if (
        this.selectedName === "全部" ||
        this.selectedName === "整体影响" ||
        this.selectedName === ""
      ) {
        this.tableData = this.orignalTableData.map((item) => {
            const depth = waterHeight - item.height;
            return {
              ...item,
              depth: depth > 0 ? depth.toFixed(2) : "--",
            };
          });
      } else {
        this.tableData = this.orignalTableData
          .filter((item) => {
            return item.RefName === this.selectedName;
          })
          .map((item) => {
            const depth = waterHeight - item.height;
            return {
              ...item,
              depth: depth > 0 ? depth.toFixed(2) : "--",
            };
          });
      }

      this.count = this.tableData.length;
    },
    handleRowClick(row, column, event) {
      const filterData = gcdData.filter({ OBJECTID: row.OBJECTID })|| [];
      // flyto
      this.$bus.emit("mapLocate", {
        type: "FlyToLocal",
        data: {
           center: [filterData[0].geometry.coordinates[0], filterData[0].geometry.coordinates[1]],
           height: 500,
        },
      });
      //  高亮显示hightlightData

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
   
      const labelOrder = EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT.map((i) => i.label);
      this.selectedWaterLevelList = labelOrder.filter((label) =>
        this.selectedWaterLevelList.includes(label)
      );
      this.previousWaterLevelList = [...this.selectedWaterLevelList];
      // this.$bus.emit("waterLevelChanged", this.selectedWaterLevelList);
      // this.$store.commit("selectedWaterLevelList", this.selectedWaterLevelList);
    },
  },

  mounted() {
    // 初始化表格 mock 数据
    gcdData.fetch().then((data) => {
      const { features } = data;
      // 使用本地副本或父传入的 cfg，避免直接依赖 props
      const sourceCfg = (this.localCfg && Object.keys(this.localCfg).length)
        ? this.localCfg
        : this.cfg;
      const hasValue = sourceCfg && typeof sourceCfg.value === "number";
      const waterLevelVal = hasValue ? sourceCfg.value : NaN;
      const featuresData = features.map((item, i) => {
        const depthRaw = waterLevelVal - item.properties.height;
        return {
          ...item.properties,
          tsmc: item.properties.RefName,
          xmmc: item.properties.ssc,
          cwbj: item.properties.wz,
          lxdh: item.properties.lxdh == 0 ? "--" : item.properties.lxdh,
          depth: hasValue && depthRaw > 0 ? depthRaw.toFixed(2) : "--",
        };
      });
      this.orignalTableData = Object.freeze(
        featuresData.sort((a, b) => a.height - b.height)
      );
      this.buildTableDataMock({ cfg: sourceCfg });

      // 加载受影响民房面数据图层
      affectedHousesLayer.add({ data, id: "affected-houses", zIndex: 120 });
    });
    // 若通过 props 传入 currentAreaName，则选中对应区域
    if (this.currentAreaName) {
      this.selectedName = this.currentAreaName;
    }
  },
  created() {
    // 初始化本地 cfg 副本
    this.localCfg = { ...(this.cfg || {}) };
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
      // 同步本地显示标签（changeWaterLevelType 传入的是还原后的 key，如 "199.0"）
      this.currentWaterLevelLabel = waterLevelKey || "";
    });
    // 监听民房数点击事件，使用传入值刷新表格 mock 数据
    this.$bus.on("clickSubmergedCivilHousingCount", (data) => {
      console.log("🚀 ~ data:===================》", data);
      const { cfg } = data;
      // 同步到本地副本，避免直接修改 props
      if (cfg) this.localCfg = { ...cfg };
      // 按最新 cfg 重建表格数据
      this.buildTableDataMock({ cfg });
    });
  },

  watch: {
    // 当 props 中的 waterLevelKey 变化时，同步选中状态
    waterLevelKey(newVal) {
      if (newVal) {
        this.selectedWaterLevelList = [newVal];
        this.previousWaterLevelList = [newVal];
        // this.$store.commit("selectedWaterLevelList", this.selectedWaterLevelList);
        // 同步本地显示标签
        this.currentWaterLevelLabel = newVal;
      }
    },
    // 影响区域选择变化时，重建表格数据
    selectedName() {
      const sourceCfg = (this.localCfg && Object.keys(this.localCfg).length)
        ? this.localCfg
        : this.cfg;
      this.buildTableDataMock({ cfg: sourceCfg });
    },
    // housesCount 变化时重新生成表格 mock 数据
    housesCount() {
      const sourceCfg = (this.localCfg && Object.keys(this.localCfg).length)
        ? this.localCfg
        : this.cfg;
      this.buildTableDataMock({ cfg: sourceCfg });
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
