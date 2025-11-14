<template>
  <div ref="chart" class="chart-container"></div>
</template>

<script>
import { mapGetters } from "vuex";
import { getStatisticalData,tables } from "./mockData";
import { constant } from "@/map";
const { EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT } = constant;
import * as echarts from 'echarts'

export default {
  name: "ChartShow",
  props: {
    areaName: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      chart: null,
      resizeHandler: null,
      sizeObserver: null,
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
    // 有效的水位标签：若未选择则回退为全部典型水位
    effectiveLabels() {
      const fallback = EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT.map((i) => i.label);
      const cur = this.selectedWaterLevelList || [];
      return cur.length ? cur : fallback;
    },
    // 展示名称：根据有效标签映射到 name
    waterLevelNames() {
      return this.effectiveLabels.map((label) => {
        const cfg = EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT.find((i) => i.label === label);
        return cfg ? cfg.name || cfg.label : label;
      });
    },
  },
  watch: {
    selectedWaterLevelList() {
      this.mockData = this.buildMockData(this.effectiveLabels);
      this.$nextTick(() => this.updateChart());
    },
    areaName() {
      this.mockData = this.buildMockData(this.effectiveLabels);
      this.$nextTick(() => this.updateChart());
    }
  },
  methods: {
    // el-table 的 prop 使用点号表示嵌套路径，
    // 为避免 '199.0' 被解析为嵌套字段，做安全转换
    normalizeKey(key) {
      return String(key).replace(/\./g, "_");
    },
    // 数值格式化：整数不带小数，非整数去尾零，最多保留 6 位
    formatValue(val) {
      const num = Number(val);
      if (!Number.isFinite(num)) return "-";
      if (Number.isInteger(num)) return String(Math.trunc(num));
      const s = num.toFixed(6).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
      return s;
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
    updateChart() {
      if (!this.chart && this.$refs.chart) {
        this.chart = echarts.init(this.$refs.chart);
        this.resizeHandler = () => this.chart && this.chart.resize();
        window.addEventListener('resize', this.resizeHandler);
        // 监听容器尺寸变化，保证在标签切换/布局变更时自适应
        if (window.ResizeObserver) {
          this.sizeObserver = new ResizeObserver(() => {
            if (this.chart) this.chart.resize();
          });
          this.sizeObserver.observe(this.$refs.chart);
        }
      }
      if (!this.chart) return;

      const isSingle = this.effectiveLabels.length === 1;
      let option;
      if (isSingle) {
        // 单水位：仅比较面积类指标（不含长度与数量）
        const label = this.effectiveLabels[0];
        const showName = this.waterLevelNames[0] || label;
        const row = this.mockData[label] || {};
        const pieData = [
          { name: '淹没面积(亩)', value: Number(row.inundationArea || 0) },
          { name: '淹没农用地面积（亩）', value: Number(row.submergedCivilLandArea || 0) },
          { name: '淹没耕地（亩）', value: Number(row.submergedArableLandArea || 0) }
        ].map(d => ({ ...d, value: Number.isFinite(d.value) ? d.value : 0 }));

        option = {
          backgroundColor: 'transparent',
          color: ['#73C0DE', '#91CC75', '#FAC858'],
          tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
          legend: {
            top: 10,
            textStyle: { color: '#fff' },
            data: pieData.map(d => d.name)
          },
          series: [
            {
              name: `${showName} 面积分布`,
              type: 'pie',
              radius: ['30%', '60%'],
              center: ['50%', '55%'],
              avoidLabelOverlap: true,
              label: { color: '#fff' },
              labelLine: { lineStyle: { color: 'rgba(255,255,255,0.6)' } },
              data: pieData
            }
          ]
        };
      } else {
        const categories = this.waterLevelNames;
        // 使用 mockData 中的数值序列（基于有效标签）
        const dataInundationArea = this.effectiveLabels.map((label) => {
          const row = this.mockData[label] || {};
          const v = Number(row.inundationArea || 0);
          return Number.isFinite(v) ? v : 0;
        });
        const dataSubmergedCivilLandArea = this.effectiveLabels.map((label) => {
          const row = this.mockData[label] || {};
          const v = Number(row.submergedCivilLandArea || 0);
          return Number.isFinite(v) ? v : 0;
        });
        const dataSubmergedArableLandArea = this.effectiveLabels.map((label) => {
          const row = this.mockData[label] || {};
          const v = Number(row.submergedArableLandArea || 0);
          return Number.isFinite(v) ? v : 0;
        });
        const dataAffectedRoadLength = this.effectiveLabels.map((label) => {
          const row = this.mockData[label] || {};
          const v = Number(row.affectedRoadLength || 0);
          return Number.isFinite(v) ? v : 0;
        });
        const dataSubmergedCivilHousingCount = this.effectiveLabels.map((label) => {
          const row = this.mockData[label] || {};
          const v = Number(row.submergedCivilHousingCount || 0);
          return Number.isFinite(v) ? v : 0;
        });

        option = {
          backgroundColor: 'transparent',
          tooltip: { trigger: 'axis' },
          legend: {
            data: ['淹没面积(亩)', '淹没农用地面积（亩）', '淹没耕地（亩）', '受影响道路长度(米)', '淹没民房数(栋)'],
            textStyle: { color: '#fff' }
          },
          grid: { left: 40, right: 40, top: 40, bottom: 40, containLabel: true },
          xAxis: {
            type: 'category',
            data: categories,
            axisLabel: { color: '#fff' },
            nameTextStyle: { color: '#fff' },
            axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } }
          },
          yAxis: [
            {
              type: 'value',
              name: '面积(亩)',
              splitLine: { show: true },
              axisLabel: { color: '#fff' },
              nameTextStyle: { color: '#fff' },
              axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } }
            },
            {
              type: 'value',
              name: '长度(米)',
              position: 'right',
              splitLine: { show: false },
              axisLabel: { color: '#fff' },
              nameTextStyle: { color: '#fff' },
              axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } }
            },
            {
              type: 'value',
              name: '数量(栋)',
              position: 'right',
              offset: 60,
              splitLine: { show: false },
              axisLabel: { color: '#fff' },
              nameTextStyle: { color: '#fff' },
              axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } }
            }
          ],
          series: [
            {
              name: '淹没面积(亩)',
              type: 'bar',
              data: dataInundationArea,
              itemStyle: { color: '#73C0DE' }
            },
            {
              name: '淹没农用地面积（亩）',
              type: 'bar',
              data: dataSubmergedCivilLandArea,
              itemStyle: { color: '#91CC75' }
            },
            {
              name: '淹没耕地（亩）',
              type: 'bar',
              data: dataSubmergedArableLandArea,
              itemStyle: { color: '#FAC858' }
            },
            {
              name: '受影响道路长度(米)',
              type: 'line',
              yAxisIndex: 1,
              smooth: true,
              data: dataAffectedRoadLength,
              itemStyle: { color: '#EE6666' }
            },
            {
              name: '淹没民房数(栋)',
              type: 'line',
              yAxisIndex: 2,
              smooth: true,
              data: dataSubmergedCivilHousingCount,
              itemStyle: { color: '#3BA272' }
            }
          ]
        };
      }
      this.chart.setOption(option, true);
      // 轻微延迟后再次 resize，适配 el-tabs 动画后的最终尺寸
      setTimeout(() => { if (this.chart) this.chart.resize(); }, 200);
    }
  },
  mounted() {
    this.mockData = this.buildMockData(this.effectiveLabels);
    this.$nextTick(() => {
      this.updateChart();
      // 初始时进行一次延迟 resize，避免在不可见容器中初始化导致宽度为0
      setTimeout(() => { if (this.chart) this.chart.resize(); }, 200);
    });
  },
  updated() {
    // 当所在的 Tab 切换为可见时，触发一次 resize 以适配容器尺寸
    this.$nextTick(() => {
      if (this.chart) {
        this.chart.resize();
        setTimeout(() => this.chart && this.chart.resize(), 200);
      }
    });
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose();
      this.chart = null;
    }
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
    if (this.sizeObserver) {
      try { this.sizeObserver.disconnect(); } catch (e) {}
      this.sizeObserver = null;
    }
  }
};
</script>

<style lang="scss" scoped>
.chart-container {
  width: 100%;
  height: 360px;
}
</style>
