<template>
  <div class="stat-container">
    <el-table :data="tableData" style="width: 100%" height="450" border>
      <el-table-column prop="name" label="典型水位" width="77"></el-table-column>
      <el-table-column
        v-for="(value, key) in mockData"
        :key="key"
        :prop="normalizeKey(key)"
        :label="key"
      >
        <!-- 设置第一列的宽度 -->
        <template slot-scope="scope">
          <span
            v-if="scope.row.name === '影响民房数(栋)'"
            class="cell-clickable"
            style="cursor: pointer"
            @click="handleHousingCountClick(scope, normalizeKey(key), key)"
          >
            {{ formatValue(scope.row[normalizeKey(key)]) }}
          </span>
          <span v-else>
            {{ formatValue(scope.row[normalizeKey(key)]) }}
          </span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import {
  getStatisticalData,
  tables,
} from "@/components/MapPopup/FloodStatistical/mockData";
import { constant } from "@/map";
const {
  EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT,
  MODEL_3DTILES_INFO_LIST,
  MODEL_3DTILES_AREA_LIST,
  getAreaNameFromChildren,
} = constant;

import layerGroup from "@/components/LayerControl/layerGroup";
import FloodSummary from "../common/FloodSummary.vue";

const houseLayer = layerGroup.layerGuideLine.find(
  (item) => item.value === "affectedHousesLayer"
);

export default {
  name: "EffectAll",
  components: { FloodSummary },
  props: {
    areaName: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      currentAreaName: this.areaName || "",

      statisticalItems: [
        { key: "affectedRoadLength", name: "影响公路（米）" },
        { key: "submergedCivilHousingCount", name: "影响民房数(栋)" },
        { key: "inundationArea", name: "影响面积(亩)" },
        { key: "submergedCivilLandArea", name: "影响农用地面积（亩）" },
        { key: "submergedArableLandArea", name: "影响耕地（亩）" },
      ],
      mockData: {},
    };
  },
  computed: {
    ...mapGetters(["selectedWaterLevelList"]),
    tableData() {
      return this.statisticalItems.map((item) => {
        const row = { name: item.name };
        for (const condition in this.mockData) {
          const safeKey = this.normalizeKey(condition);
          row[safeKey] = this.mockData[condition][item.key];
        }
        return row;
      });
    },
  },
  watch: {
    selectedWaterLevelList(newValue) {
      this.mockData = this.buildMockData(newValue);
    },
    areaName(newVal) {
      this.currentAreaName = newVal || "";
    },
  },
  methods: {
    // el-table 的 prop 使用点号表示嵌套路径，
    // 为避免 '199.0' 被解析为嵌套字段，做安全转换
    normalizeKey(key) {
      return String(key).replace(/\./g, "_");
    },
    // 转回正常的 key
    denormalizeKey(key) {
      return String(key).replace(/_/g, ".");
    },
    // 数值格式化：整数不带小数，非整数保留两位小数
    formatValue(val) {
      const num = Number(val);
      if (!Number.isFinite(num)) return "-";
      if (Number.isInteger(num)) return String(Math.trunc(num));
      // 非整数：最多保留 6 位小数，去掉末尾的 0 和可能多余的小数点
      return parseFloat(num.toFixed(2)).toString();
    },
    buildMockData(levelLabels) {
      const result = {};
      // 使用聚合统计数据（按水位分组求和）
      // 假如this.areaName有值，则统计这个areaName的值
      let aggregatedMap;
      console.log("🚀 ~ this.currentAreaName:", this.currentAreaName);
      if (this.currentAreaName) {
        // 若为父区域则聚合其 children；若无 children 则回退为当前区域自身
        const names = getAreaNameFromChildren(this.currentAreaName) || [];
        const tableNameList = names.length ? names : [this.currentAreaName];
        console.log("🚀 ~ tableNameList:", tableNameList);

        // 将多个表的行按水位进行求和聚合：Map<waterLevel, number[]>
        const grouped = new Map();
        tableNameList.forEach((name) => {
          const rows = (tables && tables.get(name)) || [];
          rows.forEach((row) => {
            const waterLevelKey = row[0];
            const values = row.slice(1).map((v) => Number(v) || 0);
            const acc = grouped.get(waterLevelKey);
            if (!acc) {
              grouped.set(waterLevelKey, values.slice());
            } else {
              for (let i = 0; i < values.length; i++) {
                acc[i] = (acc[i] || 0) + values[i];
              }
            }
          });
        });
        aggregatedMap = grouped;
      } else {
        aggregatedMap = getStatisticalData();
      }
      const keys = this.statisticalItems.map((i) => i.key);

      levelLabels.forEach((label) => {
        // 根据常量配置将 label 映射为聚合键：数值型用 value，一般如“校核洪水位”用 label
        const cfg = EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT.find((i) => i.label === label);
        const aggKey = (() => {
          if (!cfg) return label;
          // 使用一位小数的数值字符串作为键，如 198.4、199.0、199.5、200.0、200.6
          const n = Number(cfg.value);
          return Number.isFinite(n) ? n.toFixed(1) : String(cfg.value);
        })();
        const values = aggregatedMap && aggregatedMap.get(aggKey);
        const data = {};
        keys.forEach((key, idx) => {
          data[key] = values && values[idx] != null ? values[idx] : 0;
        });
        result[label] = data;
      });
      return result;
    },
    handleHousingCountClick(scope, waterLevelKey, key) {
      const cfg = EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT.find((i) => i.label === key) || {
        value: Infinity,
      };
      console.log("🚀 ~ cfg:", cfg);
      const value = scope.row[waterLevelKey];
      const rowName = scope.row.name;
      // 向父组件派发事件，传递当前水位列与该行数据值
      this.$emit("click-housing", { waterLevelKey, value, rowName, row: scope.row, cfg });
      // 可选：向全局总线广播，便于其他模块监听
      this.$bus &&
        this.$bus.emit("clickSubmergedCivilHousingCount", {
          waterLevelKey,
          value,
          rowName,
          cfg,
        });
      houseLayer.isActived = true;
      this.$bus.emit("addMapDetail", {
        ...houseLayer,
        props: {
          waterLevelKey: this.denormalizeKey(waterLevelKey),
          housesCount: value,
          currentAreaName: this.currentAreaName,
          cfg,
        },
      });
      // this.$bus.emit("addMapDetail", {
      //   value: "waterGcdLayer",
      //   label: "水深点位",
      //   flag: true,
      //   props: {
      //     waterLevelKey: this.denormalizeKey(waterLevelKey),
      //     housesCount: value,
      //     currentAreaName: this.currentAreaName,
      //     cfg,
      //   },
      // });

      // 发布水位类型事件
      this.$bus.emit("changeWaterLevelType", {
        waterLevelKey: this.denormalizeKey(waterLevelKey),
        value,
        rowName,
      });
    },
  },
  mounted() {
    this.mockData = this.buildMockData(this.selectedWaterLevelList);
    const areaNameList = MODEL_3DTILES_AREA_LIST.map((item) => item.name);
    this.$bus.on("mapLocate", (evt) => {
      const name = evt.data;
      if (areaNameList.includes(name)) {
        this.currentAreaName = name;
      } else {
        this.currentAreaName = "";
      }
      this.mockData = this.buildMockData(this.selectedWaterLevelList);
    });

    this.$bus.emit("addMapDetail", {
      ...houseLayer,
      props: {},
    });
  },
};
</script>

<style lang="scss" scoped>
.stat-container {
  padding: 10px;
}

::v-deep .el-table__row .el-table_2_column_4 .cell {
  text-wrap: wrap;
  font-weight: bold;
  word-break: break-all;
  text-align: center;
}

.cell-clickable {
  color: #409eff; /* Element UI 主色 */
  text-decoration: underline;
  cursor: pointer;
}
</style>
