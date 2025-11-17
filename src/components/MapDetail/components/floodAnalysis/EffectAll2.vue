<template>
  <div class="stat-container">
    <div class="block-table">
      <div class="block-header" :style="{ gridTemplateColumns: gridTemplateColumns }">
        <div v-for="(label, idx) in effectiveLabels" :key="label" class="header-cell">
          {{ waterLevelNames[idx] }}
        </div>
      </div>

      <div
        v-for="item in statisticalItems"
        :key="item.key"
        class="block-row"
        :style="{ gridTemplateColumns: gridTemplateColumns }"
      >
        <div v-for="label in effectiveLabels" :key="label" class="row-cell">
          <span class="row-cell-label">{{ item.name }}：</span>
          <span class="row-cell-value">
            {{ formatValue((mockData[label] && mockData[label][item.key]) || 0) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { getStatisticalData, tables } from "@/components/MapPopup/FloodStatistical/mockData";
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
    effectiveLabels() {
      const fallback = EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT.map((i) => i.label);
      const cur = this.selectedWaterLevelList || [];
      return cur.length ? cur : fallback;
    },
    waterLevelNames() {
      return this.effectiveLabels.map((label) => {
        const cfg = EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT.find((i) => i.label === label);
        return cfg ? cfg.name || cfg.label : label;
      });
    },
    gridTemplateColumns() {
      const count = this.effectiveLabels.length || 1;
      return `repeat(${count}, minmax(120px, 1fr))`;
    },
  },
  watch: {
    selectedWaterLevelList() {
      this.mockData = this.buildMockData(this.effectiveLabels);
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
    this.mockData = this.buildMockData(this.effectiveLabels);
  },
};
</script>

<style lang="scss" scoped>
.stat-container {
  padding: 10px;
  color: white;
  overflow-x: auto;
}

.block-table {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.block-header {
  display: grid;
  gap: 10px;
}

.header-cell {
  background: linear-gradient(90deg, #4a90e2, #357abd);
  color: white;
  padding: 10px 8px;
  font-size: 13px;
  font-weight: bold;
  text-align: center;
  border-right: 1px solid rgba(255, 255, 255, 0.3);
}

.block-row {
  display: grid;
  gap: 10px;
}

.row-cell {
  background: rgba(74, 144, 226, 0.08);
  border: 1px solid rgba(74, 144, 226, 0.6);
  border-radius: 6px;
  padding: 12px 8px;
  text-align: center;
  transition: all 0.3s ease;
  min-width: 120px;
}

.row-cell-label {
  color: #fff;
  margin-right: 6px;
  font-weight: 600;
}

.row-cell-value {
  color: #fff;
}

.row-cell:hover {
  background: rgba(74, 144, 226, 0.15);
  border-color: rgba(74, 144, 226, 0.4);
}
</style>
