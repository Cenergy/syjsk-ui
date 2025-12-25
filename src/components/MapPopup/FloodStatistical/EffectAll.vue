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
import FloodSummary from "@/components/MapDetail/components/common/FloodSummary";
import { constant } from "@/map";
const { EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT, MODEL_3DTILES_AREA_LIST, getAreaNameFromChildren } = constant;

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

      statisticalItems: [
        { key: "affectedRoadLength", name: "淹没公路（米）" },
        { key: "submergedCivilHousingCount", name: "淹没民房数(栋)" },
        { key: "inundationArea", name: "淹没面积(亩)" },
        { key: "submergedCivilLandArea", name: "淹没农用地面积（亩）" },
        { key: "submergedArableLandArea", name: "淹没耕地（亩）" },
        { key: "affectedPopulation", name: "影响人口（人）" },
      ],
      mockData: {},
    };
  },
  computed: {
    ...mapGetters(["selectedWaterLevelList"]),
    // 汇总描述文案
    descriptionText() {
      // 选择多个水位时：取“最大水位”作为描述依据
      const labels = (this.selectedWaterLevelList && this.selectedWaterLevelList.length)
        ? this.selectedWaterLevelList
        : EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT.map((i) => i.label);

      const pickMaxCfg = () => {
        const cfgList = labels
          .map((label) => EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT.find((i) => i.label === label))
          .filter(Boolean);
        if (cfgList.length === 0) {
          // 回退为所有典型水位中最大值
          return EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT
            .slice()
            .sort((a, b) => Number(b.value) - Number(a.value))[0];
        }
        // 在选中水位中找最大值
        return cfgList.slice().sort((a, b) => Number(b.value) - Number(a.value))[0];
      };

      const cfg = pickMaxCfg();
      const targetLabel = cfg ? cfg.label : labels[0];
      const aggKey = (() => {
        if (!cfg) return targetLabel;
        const n = Number(cfg.value);
        return Number.isFinite(n) ? n.toFixed(1) : String(cfg.value);
      })();

      // 计算总值与分组值（基于目标水位）
      let totalRoad = 0;
      let totalHouses = 0;
      let totalArea = 0;
      let totalArable = 0;
      const breakdown = [];

      if (this.areaName) {
        // 有具体父区域：按其子级（村/镇）逐个取行并累加
        const childNames = getAreaNameFromChildren(this.areaName) || [];
        if (!childNames.length) return "暂无数据";
        childNames.forEach((name) => {
          const rows = (tables && tables.get(name)) || [];
          const row = rows.find((r) => String(r[0]) === String(aggKey));
          if (!row) return;
          const road = Number(row[1]) || 0;
          const houses = Number(row[2]) || 0;
          const area = Number(row[3]) || 0;
          const arable = Number(row[5]) || 0;
          totalRoad += road;
          totalHouses += houses;
          totalArea += area;
          totalArable += arable;
          breakdown.push(`${name}${houses}栋`);
        });
        const breakdownText = breakdown.length ? `（分村：${breakdown.join("，")}）` : "";
        return `影响民房${this.formatValue(totalHouses)}栋${breakdownText}，影响范围${this.formatValue(totalArea)}亩，影响耕地${this.formatValue(totalArable)}亩`;
      }

      // 无具体区域：按父区域聚合其所有子级（镇+村），并以“镇/乡”名称作为分组标签
      const areas = MODEL_3DTILES_AREA_LIST || [];
      if (!areas.length) return "暂无数据";
      areas.forEach((area) => {
        const childNames = (area.children || []).map((c) => c.name);
        if (!childNames.length) return;
        // 展示标签优先取子级中以“镇/乡”结尾的名称
        const labelName = childNames.find((n) => /[镇乡]$/.test(n)) || area.name;
        let sumRoad = 0;
        let sumHouses = 0;
        let sumArea = 0;
        let sumArable = 0;
        childNames.forEach((name) => {
          const rows = (tables && tables.get(name)) || [];
          const row = rows.find((r) => String(r[0]) === String(aggKey));
          if (!row) return;
          sumRoad += Number(row[1]) || 0;
          sumHouses += Number(row[2]) || 0;
          sumArea += Number(row[3]) || 0;
          sumArable += Number(row[5]) || 0;
        });
        totalRoad += sumRoad;
        totalHouses += sumHouses;
        totalArea += sumArea;
        totalArable += sumArable;
        breakdown.push(`${labelName}${sumHouses}栋`);
      });
      const breakdownText = breakdown.length ? `（分乡镇：${breakdown.join("，")}）` : "";
      return `影响民房${this.formatValue(totalHouses)}栋${breakdownText}，影响范围${this.formatValue(totalArea)}亩，影响耕地${this.formatValue(totalArable)}亩`;
    },
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
      return parseFloat(num.toFixed(2)).toString();;
    },
    buildMockData(levelLabels) {
      const result = {};
      // 使用聚合统计数据（按水位分组求和）
      // 假如 this.areaName 有值，则统计该区域或其 children 的值
      let aggregatedMap;
      if (this.areaName) {
        // 现在多个值合成一个：以该示例的多表名为准
        const tableNameList = getAreaNameFromChildren(this.areaName); // L88 示例

        // 将多个表的行按水位进行求和聚合：Map<waterLevel, number[]>
        const grouped = new Map();
        tableNameList.forEach((name) => {
          const rows = (tables && tables.get(name)) || [];
          rows.forEach((row) => {
            const waterLevelKey = row[0];
            const values = row.slice(1).map((v) => Number(v) || 0);
            const acc = grouped.get(waterLevelKey);
            if (!acc) {
              // 初始化为当前值的拷贝
              grouped.set(waterLevelKey, values.slice());
            } else {
              // 逐项累加
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
