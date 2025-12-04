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
    <WaterLevelSelector
      :effectWaterLevelList="effectWaterLevelList"
      v-model="selectedWaterLevelList"
      :singleCheck.sync="singleCheck"
      :showSingleCheck="false"
      @change="handleWaterLevelList"
    />

    <ZebraTitle style="margin-bottom: 15px">
      <span style="color: #000">查询条件</span>
    </ZebraTitle>
    <div
      class="tableContainer"
      style="flex: 1; overflow: hidden; display: flex; flex-direction: column"
    >
      <div>
        <span style="color: #FFF;">{{ housesCountText }}</span>
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
        <el-table-column align="center" label="影响水深" prop="bybj"></el-table-column>
        <el-table-column align="center" label="户主名称" prop="cwbj"></el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
import { constant } from "@/map";
import waterLevelLayer from "@/map/cesium/layers/waterLevelLayer";
import WaterLevelSelector from "@/components/MapDetail/components/common/WaterLevelSelector.vue";

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
  },

  data() {
    return {
      showWaterNameList,
      selectedName,
      tableData: [],
      selectedWaterLevelList: [],
      previousWaterLevelList: [],
      effectWaterLevelList: EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT,
      singleCheck: true,
    };
  },

  computed: {
    displayWaterLevel() {
      return this.waterLevelKey || (this.selectedWaterLevelList[0] || "未选择");
    },
    housesCountText() {
      // 生成mock的this.housesCount条数的tableData
      this.tableData = [];
      for (let i = 0; i < this.housesCount; i++) {
        this.tableData.push({
          tsmc: `村镇${i}`,
          xmmc: `小组${i}`,
          bybj: `${i}米`,
          cwbj: `户主${i}`,
        });
      }
      return this.housesCount ? `共${this.housesCount}户受影响` : "";
    },
  },

  methods: {
    handleRowClick(row, column, event) {
      this.$bus.emit("changeFloodRiskImage", row.imageName);
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
      }else{
        this.selectedName = '全部';
      }
    });
    this.$bus.on("changeWaterLevelType", (data) => {
      console.log("🚀 ~ data:", data);
      const {waterLevelKey} = data;
      this.selectedWaterLevelList = [waterLevelKey];
      console.log("🚀 ~ this.selectedWaterLevelList:", this.selectedWaterLevelList);
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
    waterLevelLayer.removeAll();
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
</style>
