<template>
  <div id="damContent">
    <div class="dam-scale"></div>
    <div ref="damRef" class="dam-chart"></div>
    <div class="dam-wall"></div>
    <div ref="labelRef" class="chart-labels"></div>
  </div>
</template>

<script>
import * as echarts from "echarts";

export default {
  name: "Sksw",
  props: {
    code: {
      type: String,
      default: "",
    },
    FXSW: {
      type: [String, Number],
      default: "",
    },
    JHHSW: {
      type: [String, Number],
      default: "",
    },
    SJHHSW: {
      type: [String, Number],
      default: "",
    },
    YHDGC: {
      type: [String, Number],
      default: "",
    },
    SSW: {
      type: [String, Number],
      default: "",
    },
    BDGC: {
      type: [String, Number],
      default: "",
    },
    HDGC: {
      type: [String, Number],
      default: "",
    },
    RZ: {
      type: [String, Number],
      default: "",
    },
    YCSW1: {
      type: [String, Number],
      default: "",
    },
    YCSW2: {
      type: [String, Number],
      default: "",
    },
    YDGC: {
      type: [String, Number],
      default: "",
    },
    ZCSW: {
      type: [String, Number],
      default: "",
    },
  },
  data() {
    return {
      currentWaterLevel: 0,
      waterLines: [],
      hasData: false,
      chart: null,
      labelChart: null,
    };
  },
  watch: {
    currentWaterLevel: {
      handler() {
        this.$nextTick(this.drawChart);
      },
      immediate: true,
    },
    waterLines: {
      handler() {
        this.$nextTick(this.drawChart);
      },
      immediate: true,
      deep: true,
    },
  },
  mounted() {
    if (this.code) {
      this.initChart();
      this.loadWaterData();
      // 添加窗口大小变化监听
      window.addEventListener("resize", this.handleResize);
    }
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
    if (this.chart) {
      this.chart.dispose();
      this.chart = null;
    }
    if (this.labelChart) {
      this.labelChart.dispose();
      this.labelChart = null;
    }
  },
  methods: {
    initChart() {
      if (this.$refs.damRef) {
        this.chart = echarts.init(this.$refs.damRef);
      }
      if (this.$refs.labelRef) {
        this.labelChart = echarts.init(this.$refs.labelRef);
      }
    },

    handleResize() {
      if (this.chart) this.chart.resize();
      if (this.labelChart) this.labelChart.resize();
    },

    formatString(value, isNumber) {
      if (value == null || value === "") return isNumber ? 0 : "";
      return isNumber ? parseFloat(value) || 0 : value.toString();
    },

    loadWaterData() {
      // 使用props传入的水位数据
      const m_watSatArr = {
        FXSW: this.formatString(this.FXSW, true) || "",
        JHHSW: this.formatString(this.JHHSW, true) || "",
        SJHHSW: this.formatString(this.SJHHSW, true) || "",
        YHDGC: this.formatString(this.YHDGC, true) || "",
        SSW: this.formatString(this.SSW, true) || "",
        BDGC: this.formatString(this.BDGC, true) || "",
        HDGC: this.formatString(this.HDGC, true) || "",
        RZ: this.formatString(this.RZ, true) || "",
        YCSW1: this.formatString(this.YCSW1, true) || "",
        YCSW2: this.formatString(this.YCSW2, true) || "",
        YDGC: this.formatString(this.YDGC, true) || "",
        ZCSW: this.formatString(this.ZCSW, true) || "",
      };

      this.processWaterData(m_watSatArr);
    },

    processWaterData(m_watSatArr) {
      const data = m_watSatArr || {};

      // 设置当前水位
      this.currentWaterLevel = this.formatString(data.RZ, true);

      // 水位线配置
      const waterLineConfigs = [
        { key: "FXSW", label: "汛限水位", color: "#ffff00", left: 100, top: 10 },
        { key: "BDGC", label: "坝顶高程", color: "#ffff00", left: 100, top: -10 },
        { key: "ZCSW", label: "正常蓄水位", color: "#a1a9e9ff", left: 200, top: 10 },
        { key: "JHHSW", label: "校核洪水位", color: "#ff0000", left: -200, top: -10 },
        { key: "SJHHSW", label: "设计洪水位", color: "#ffa500", left: 200, top: -10 },
        { key: "SSW", label: "死水位", color: "#008000", left: 100, top: -10 },
        {
          key: "YCSW1",
          label: "未来1小时",
          color: "#fff",
          left: -200,
          top: 10,
          lineStyle: { type: "dashed" },
        },
        {
          key: "YCSW2",
          label: "未来3小时",
          color: "#fff",
          left: -200,
          top: -10,
          lineStyle: { type: "dashed" },
        },
      ];

      // 处理YHDGC和YDGC的显示逻辑
      const yhdgcValue = this.formatString(data.YHDGC, true);
      const ydgcValue = this.formatString(data.YDGC, true);

      if (yhdgcValue > 0 && ydgcValue > 0) {
        if (yhdgcValue === ydgcValue) {
          // 如果YHDGC和YDGC值相同，只显示YDGC
          waterLineConfigs.push({
            key: "YDGC",
            label: "堰顶高程",
            color: "#ffa500",
            left: 100,
            top: 10,
          });
        } else {
          // 如果值不同，都显示
          waterLineConfigs.push({
            key: "YHDGC",
            label: "溢洪道高程",
            color: "#ffa500",
            left: 100,
            top: 10,
          });
          waterLineConfigs.push({
            key: "YDGC",
            label: "堰顶高程",
            color: "#ffa500",
            left: 100,
            top: 10,
          });
        }
      } else if (yhdgcValue > 0) {
        waterLineConfigs.push({
          key: "YHDGC",
          label: "溢洪道高程",
          color: "#ffa500",
          left: 100,
          top: 10,
        });
      } else if (ydgcValue > 0) {
        waterLineConfigs.push({
          key: "YDGC",
          label: "堰顶高程",
          color: "#ffa500",
          left: 100,
          top: 10,
        });
      }

      // 构建水位线数据
      this.waterLines = waterLineConfigs
        .map((config) => {
          const value = this.formatString(data[config.key], true);
          return value > 0 ? { ...config, value } : null;
        })
        .filter(Boolean);

      this.hasData = this.currentWaterLevel > 0 || this.waterLines.length > 0;
    },

    drawChart() {
      if (!this.chart || !this.hasData || !this.labelChart) return;

      const value = this.currentWaterLevel;
      const allValues = [value, ...this.waterLines.map((item) => item.value)].filter(
        (v) => v > 0
      );
      const maxValue = Math.max(...allValues) + 1;
      const minValue = Math.min(...allValues) - 1;

      // 公共配置
      const commonConfig = {
        grid: { top: 0, bottom: 0, left: 21, right: 0 },
        xAxis: { type: "value", show: false },
        yAxis: {
          type: "value",
          max: Math.ceil(maxValue) + 0.3,
          min: Math.floor(minValue) - 1,
          position: "left",
        },
      };

      // 创建系列数据的辅助函数
      const createLineSeries = (item) => {
        const topOffset = item.top || 0;
        const triangleIcon = topOffset >= 0 ? "▲" : "▼";
        return {
          name: item.label,
          data: [
            [0, item.value],
            [100, item.value],
          ],
          type: "line",
          lineStyle: {
            color: item.color,
            width: 2,
            type: (item.lineStyle && item.lineStyle.type) || "solid",
          },
          label: {
            show: true,
            position: "end",
            formatter: `${triangleIcon} ${item.label}: ${item.value}m`,
            color: item.color,
            fontSize: 14,
            fontWeight: "bold",
            offset: [item.left || 0, topOffset],
          },
          emphasis: {
            lineStyle: {
              width: 6,
              shadowBlur: 5,
              shadowColor: item.color,
            },
          },
        };
      };

      // 构建系列数据
      const areaSeries = [];
      const lineSeries = this.waterLines.map(createLineSeries);
      const labelSeries = [];

      // 添加当前水位
      if (value > 0) {
        const currentWaterData = [
          [0, value],
          [100, value],
        ];

        areaSeries.push({
          name: "当前水位_area",
          type: "line",
          data: currentWaterData,
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 1, color: "#cbf0ff" },
                { offset: 0, color: "#69aee9" },
              ],
            },
          },
          color: "transparent",
          lineStyle: { width: 0 },
        });

        lineSeries.push({
          name: "当前水位_line",
          type: "line",
          data: currentWaterData,
          color: "#69aee9",
          lineStyle: { width: 3 },
          emphasis: {
            lineStyle: {
              width: 6,
              shadowBlur: 5,
              shadowColor: "#69aee9",
            },
          },
        });

        const currentWaterTopOffset = 10;
        const currentWaterTriangleIcon = currentWaterTopOffset >= 0 ? "▲" : "▼";
        labelSeries.push({
          name: "当前水位",
          type: "line",
          data: currentWaterData,
          color: "transparent",
          lineStyle: { width: 0 },
          label: {
            show: true,
            position: "end",
            color: "white",
            formatter: `${currentWaterTriangleIcon} 当前水位: ${value}m`,
            offset: [20, currentWaterTopOffset],
            fontSize: 16,
            fontWeight: "bold",
            z: 999,
          },
        });
      }

      // 设置图表选项
      this.chart.setOption(
        {
          ...commonConfig,
          yAxis: {
            ...commonConfig.yAxis,
            axisLabel: { show: false },
            axisTick: { show: false },
            axisLine: { show: false },
            splitLine: { show: false },
          },
          series: areaSeries,
        },
        true
      );

      this.labelChart.setOption(
        {
          ...commonConfig,
          tooltip: {
            trigger: "item",
            formatter: (params) => `${params.seriesName}: ${params.value[1]}m`,
          },
          yAxis: {
            ...commonConfig.yAxis,
            axisLabel: {
              margin: 10,
              inside: true,
              fontSize: 12,
              color: "#fff",
              formatter: "{value}m",
            },
            axisTick: {
              show: true,
              length: 6,
              lineStyle: { color: "#fff" },
              inside: true,
            },
            axisLine: { show: true, lineStyle: { color: "#fff" } },
            splitLine: { show: false },
          },
          series: [...lineSeries, ...labelSeries],
        },
        true
      );
    },
  },
};
</script>

<style scoped>
#damContent {
  width: 100%;
  height: 100%;
  min-width: 50px;
  background: #3b030dff;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  border: 1px solid #7fa6c7;
  box-sizing: border-box;
  overflow: hidden;
}

.dam-scale {
  position: absolute;
  top: 0;
  left: 0;
  width: 20px;
  height: 100%;
  background-image: url(../../assets/images/scale.png);
  z-index: 2;
}

.dam-chart {
  width: 100%;
  height: 100%;
  z-index: 1;
  position: relative;
}

.dam-wall {
  position: absolute;
  top: 0;
  right: 0;
  width: 120px;
  height: 100%;
  background-image: url(../../assets/images/dam2.png);
  background-size: 100% 100%;
  z-index: 2;
}

/* 添加新样式用于控制图表文字层级 */
.chart-labels {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  pointer-events: auto;
}
</style>
