<template>
  <div class="stat-container">
    <el-table :data="tableData" style="width: 100%" height="500" border>
      <el-table-column prop="name" label="典型水位" width="115"></el-table-column>
      <el-table-column
        v-for="(value, key) in mockData"
        :key="key"
        :prop="normalizeKey(key)"
        :label="key"
      >
      <!-- 设置第一列的宽度 -->
      <template slot-scope="scope">
        {{ formatValue(scope.row[normalizeKey(key)]) }}
      </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { getStatisticalData,tables } from "./mockData";
import { constant } from "@/map";
const { EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT } = constant;

export default {
  name: "EffectAll",
  props: {
    areaName: {
      type: String,
      default: "",
    },
  },
  data() {
    return {

      statisticalItems: [
        { key: "affectedRoadLength", name: "淹没公路（米）" },
        { key: "submergedCivilHousingCount", name: "淹没民房数(栋)" },
        { key: "inundationArea", name: "淹没面积(亩)" },
        { key: "submergedCivilLandArea", name: "淹没农用地面积（亩）" },
        { key: "submergedArableLandArea", name: "淹没耕地（亩）" },
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
  },
  methods: {
    // el-table 的 prop 使用点号表示嵌套路径，
    // 为避免 '199.0' 被解析为嵌套字段，做安全转换
    normalizeKey(key) {
      return String(key).replace(/\./g, "_");
    },
    // 数值格式化：整数不带小数，非整数保留两位小数
    formatValue(val) {
      const num = Number(val);
      if (!Number.isFinite(num)) return "-";
      if (Number.isInteger(num)) return String(Math.trunc(num));
      // 非整数：最多保留 6 位小数，去掉末尾的 0 和可能多余的小数点
      return parseFloat(num.toFixed(6)).toString();;
    },
    buildMockData(levelLabels) {
      const result = {};
      // 使用聚合统计数据（按水位分组求和）
      // 假如this.areaName有值，则统计这个areaName的值
       let aggregatedMap;
      if (this.areaName) {
        const areaRows = (tables && tables.get(this.areaName)) || [];
        // 转换为 Map<waterLevel, number[]> 以与聚合模式一致
        aggregatedMap = new Map(
          areaRows.map((row) => [row[0], row.slice(1)])
        );
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
  },
  mounted() {
    this.mockData = this.buildMockData(this.selectedWaterLevelList);
  },
};
</script>

<style lang="scss" scoped>
.stat-container {
  padding: 10px;
}

::v-deep .el-table__row .el-table_2_column_4 .cell{
  text-wrap: wrap;
  font-weight: bold;
  word-break: break-all; 
  text-align: center;
}
</style>
