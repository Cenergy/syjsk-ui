<template>
  <div  ref="rainMonitor" style="width: 100%;height: 100%;display: flex;flex-direction: column;">
    <el-row :gutter="10">
      <el-col :span="12">
        <div class="statstic">
          <div class="statstic-head">
            <div>过去1小时</div>
            <div>过去3小时</div>
          </div>
          <div class="statstic-body">
            <div style="border-right: 0.5px solid #0173de">{{ numFormat(last1H) }}mm</div>
            <div style="border-left: 0.5px solid #0173de">{{ numFormat(last3H) }}mm</div>
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="statstic">
          <div class="statstic-head">
            <div>未来1小时</div>
            <div>未来3小时</div>
          </div>
          <div class="statstic-body">
            <div style="border-right: 0.5px solid #0173de">
              {{ numFormat(forecast1h) }}mm
            </div>
            <div style="border-left: 0.5px solid #0173de">
              {{ numFormat(forecast3h) }}mm
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    <div ref="chartRef" style="width: 100%;flex: 1;"></div>
  </div>
</template>
<script>
import * as echarts from "echarts";

import { numFormat } from "@/utils/format";
import moment from "moment";

export default {
  components: {},
  data() {
    return {
      chart: null,
      dateTime: null,
      last3H: null,
      last1H: null,
      forecast1h: 0,
      forecast3h: 0,
      forecastData: [],
      isOpenDialog: false,
      isOpenDialog2: false,
    };
  },
  mounted() {
    const passOneHour = moment().subtract(1, "hours").format("YYYY-MM-DD HH:mm:ss");
    const passThreeHour = moment().subtract(3, "hours").format("YYYY-MM-DD HH:mm:ss");
    this.last1H = 0.6;
    this.last3H = 1.8;
    this.dateTime = moment().format("YYYY-MM-DD HH:mm:ss");
    
    // 先初始化图表
    this.chart = echarts.init(this.$refs.chartRef);
    
    // 使用ResizeObserver监听rainMonitor容器的尺寸变化
    this.resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (this.chart) {
          // 使用requestAnimationFrame确保DOM更新完成后再resize
          requestAnimationFrame(() => {
            this.chart.resize();
          });
        }
      }
    });
    
    // 开始观察rainMonitor容器
    this.resizeObserver.observe(this.$refs.rainMonitor);
    
    // 然后设置数据并绘制
    new Promise((resolve, reject) => {
      // Mock数据 - 24小时降雨预报数据（过去12小时 + 未来12小时）
      const now = moment();
      this.forecastData = [];
      
      for (let i = 0; i < 24; i++) {
        // 从过去12小时开始，到未来12小时结束
        const time = now.clone().add(i - 12, 'hours');
        let drp = 0;
        
        // 模拟降雨量变化
        if (i < 6) {
          // 过去时间段（前6小时）- 历史数据
          drp = 0.5 + Math.sin(i * 0.8) * 0.4;
        } else if (i < 12) {
          // 过去时间段（后6小时）- 历史数据
          drp = 0.8 + Math.cos((i - 6) * 0.6) * 0.6;
        } else if (i < 15) {
          // 未来时间段（前3小时）- 预测数据逐渐增加
          drp = 0.2 + (i - 12) * 0.3;
        } else if (i < 20) {
          // 未来时间段（中间5小时）- 预测数据有波动
          drp = 1.2 + Math.sin((i - 15) * 0.5) * 0.8;
        } else {
          // 未来时间段（后4小时）- 预测数据逐渐减少
          drp = Math.max(0, 1.5 - (i - 20) * 0.2);
        }
        
        this.forecastData.push({
          tm: time.format("YYYY-MM-DD HH:mm:ss"),
          drp: Math.round(drp * 10) / 10 // 保留一位小数
        });
      }
      
      console.log('预报数据（过去12小时+未来12小时）:', this.forecastData);
      resolve();
    }).then(() => {
      this.draw();
    });
  },
  beforeDestroy() {
    // 清理ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    // 销毁图表实例
    if (this.chart) {
      this.chart.dispose();
    }
  },
  methods: {
    numFormat,
    handleRadar() {
      this.$bus.emit("toRainGrid", { gid: 11312 });
    },
    draw() {
      const data = this.forecastData;
      console.log('开始绘制图表，数据长度:', data.length);
      
      if (!data || data.length === 0) {
        console.error('没有数据可以绘制');
        return;
      }
      
      if (!this.chart) {
        console.error('图表实例未初始化');
        return;
      }
      
      let sum = 0;
      const xAxisList = [];
      const barData = [];
      const currentTime = moment(); // 获取当前时间
      
      for (let idx = 0; idx < data.length; ++idx) {
        const item = data[idx];
        sum += item.drp;
        if (idx == 0) {
          this.forecast1h = sum;
        } else if (idx == 2) {
          this.forecast3h = sum;
        }
        xAxisList.push(item.tm);
        
        // 比较数据时间与当前时间，设置不同颜色
        const itemTime = moment(item.tm);
        const isPast = itemTime.isBefore(currentTime);
        
        barData.push({
          value: item.drp,
          itemStyle: {
            color: isPast ? {
              // 过去时间保持原来的蓝色渐变
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: "#24A4FF",
                },
                {
                  offset: 1,
                  color: "#24A4FF4D",
                },
              ],
            } : {
              // 未来时间使用绿色渐变
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: "#00C853",
                },
                {
                  offset: 1,
                  color: "#00C8534D",
                },
              ],
            }
          }
        });
      }
      
      console.log('X轴数据:', xAxisList.slice(0, 5)); // 只显示前5个
      console.log('柱状图数据:', barData.slice(0, 5)); // 只显示前5个
      console.log('未来1小时:', this.forecast1h, 'mm');
      console.log('未来3小时:', this.forecast3h, 'mm');
      
      this.chart.resize();
      const option = {
        // title: {
        //     text: `未来1小时降雨量<span class="yellow">${ forecast1h }mm</span>，3小时<span class="yellow">${ forecast3h }mm</span><br>12小时<span class="yellow">${ forecast12h }mm</span>，24小时<span class="yellow">${ forecast24h }mm`
        // },
        grid: {
          // containLabel: true,
          top: 40,
          right: 20,
          bottom: 40,
          left: 40,
        },
        tooltip: {
          formatter: function (params) {
            return "时间：" + params.name + "<br/>" + "降雨量：" + params.value + "mm";
          },
        },
        xAxis: {
          type: "category",
          data: xAxisList,
          axisLabel: {
            formatter: function (value) {
              return value.substr(11, 5) + "\n" + value.substr(5, 6);
            },
            fontSize: 14,
          },
        },
        yAxis: {
          name: "降雨量(mm)",
          type: "value",
          alignTicks: true,
          max: (val) => val.max * 1.2,
          axisLabel: {
            fontSize: 14,
          },
        },
        series: [
          {
            data: barData,
            type: "bar",
            barWidth: 15,
            // 移除全局color配置，因为现在每个数据项都有自己的itemStyle
          },
        ],
        textStyle: {
          color: "#C9E8FFCC",
          fontSize: 14,
        },
      };
      
      console.log('设置图表选项');
      this.chart.setOption(option);
    },
  },
};
</script>
<style lang="scss" scoped>
.statstic {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  color: white;
  border: 2px solid #0078ec;
  font-size: 1.0rem;

  // border-image-source: linear-gradient(90deg, rgba(20, 60, 97, 0) 0%, #2A7BC7 50%, rgba(20, 60, 97, 0) 100%);
  .statstic-head {
    display: flex;
    font-size: 1rem;
    justify-content: space-around;
    padding: 7px 10px;
    background: linear-gradient(
      90deg,
      rgba(0, 21, 39, 0) 0%,
      #0a4d8a 46.7%,
      #0a4e8c 47.4%,
      rgba(0, 21, 39, 0) 100%
    );
  }

  .statstic-body {
    padding: 7px 10px;
    font-size: 1.0rem;
    display: flex;
    justify-content: space-around;

    > div {
      flex: 1;
      text-align: center;
    }
  }
}
</style>
