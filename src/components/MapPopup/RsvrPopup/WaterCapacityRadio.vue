<template>
  <div>
    <el-radio-group v-model="chartType" @change="changeChart" size="mini">
      <el-radio-button
      v-if="data.length"
      label="水位-库容"></el-radio-button>
      <el-radio-button
      v-if="xllData.length"
      label="水位-泄流量下泄"></el-radio-button>
      <el-radio-button
      v-if="xllData2.length"
      label="库容-面积"></el-radio-button>
    </el-radio-group>
    <div ref="chartRef" style="height: 300px;"></div>
  </div>
</template>

<script>
  import * as echarts from 'echarts'
  import { getLvCapaLine } from '@/api/map/reservoir'
  import { listTbSkXll } from '@/api/gmfx/tbSkXll'
  import { listArea } from '@/api/gmfx/area'

  let chart = null
  export default {
    inject: ['baseInfo'],
    data() {
      return {
        rz: null,
        dqkr: null,
        data: [],
        chartType: '水位-库容',
        xllData: [],
        xllData2: []
      }
    },
    methods: {
      changeChart(val) {
        if (val == '水位-库容') {
          this.draw()
          // this.getData()
        } else if(val == '水位-泄流量下泄'){
          // this.getSkxll()
          this.draw2()
        }else{
          this.draw3()
          // this.getSkarea()
        }
      },
      getSkxll() {
        let query = { bnstcd: this.baseInfo.code }
        listTbSkXll(query).then(res => {
          this.xllData = res.rows
          // this.draw2()
        })
      },
      getData() {
        const code = this.baseInfo.code
        getLvCapaLine(code)
          .then(res => {
            res.data.tpStgcrvSList.sort((a, b) => a.rscp - b.rscp)
            this.rz = res.data.rz
            this.dqkr = res.data.dqkr
            this.data = res.data.tpStgcrvSList
            this.draw()
          })
      },
      getSkarea() {
        let query = { bnstcd: this.baseInfo.code }
        listArea(query).then(res => {
          this.xllData2 = res.rows
          // this.draw3()
        })
      },
      draw() {
        const rz = this.rz
        const dqkr = this.dqkr
        const rzList = []
        const dqkrList = []
        const lvList = []
        let maxLv = Number.MIN_VALUE
        this.data.forEach((item, idx) => {
          if (idx == 0 || idx == this.data.length - 1) {
            rzList.push([item.rscp, rz])
          }
          maxLv = Math.max(maxLv, item.wtlv)
          lvList.push([item.rscp, item.wtlv])
        })
        dqkrList.push([dqkr, maxLv + 1])
        chart.resize()
        chart.setOption({
          grid: {
            containLabel: true,
            top: 40,
            left: 20,
            bottom: 20,
            right: 60
          },
          xAxis: {
            name: '库容\n(万m³)',
            type: 'value',
            min: (val) => Math.floor(val.min),
            max: (val) => Math.ceil(val.max),
            splitLine: {
              show: false
            }
          },
          yAxis: {
            name: '水位(m)',
            type: 'value',
            min: (val) => Math.floor(val.min - 1),
            max: (val) => Math.ceil(val.max + 1),
            splitLine: {
              show: false
            }
          },
          tooltip: {
            trigger: 'axis'
          },
          series: [
            {
              name: '水位',
              data: lvList,
              type: 'line',
              itemStyle: {
                opacity: 0
              },
              areaStyle: {}
            },
            {
              name: '当前水位',
              data: rzList,
              type: 'line',
              endLabel: {
                show: true,
                formatter: `当前水位:\n${this.rz}m`,
                textStyle: {
                  color: 'white'
                }
              },
              itemStyle: {
                opacity: 0
              }
            },
            {
              name: '当前库容',
              data: dqkrList,
              barWidth: 8,
              type: 'bar',
              barWidth: 2,
              label: {
                show: true,
                position: 'top',
                distance: 10,
                formatter: `当前库容:\n${this.dqkr}万m³`,
                textStyle: {
                  color: 'white'
                }
              }
            }
          ],
          textStyle: {
            color: 'white'
          }
        })
      },
      draw2() {
        const lvList = []
        let maxXll = Number.MIN_VALUE
        this.xllData.forEach((item) => {
          lvList.push([item.xll, item.rz])
          maxXll = Math.max(maxXll, item.xll)
        })
        chart.resize()
        chart.setOption({
          grid: {
            containLabel: true,
            top: 40,
            left: 20,
            bottom: 20,
            right: 60
          },
          xAxis: {
            name: '泄流量\n(m³/s)',
            type: 'value',
            min: (val) => Math.floor(val.min),
            max: (val) => Math.ceil(maxXll),
            splitLine: {
              show: false
            }
          },
          yAxis: {
            name: '水位(m)',
            type: 'value',
            min: (val) => Math.floor(val.min - 1),
            max: (val) => Math.ceil(val.max + 1),
            splitLine: {
              show: false
            }
          },
          tooltip: {
            trigger: 'axis'
          },
          series: [
            {
              name: '水位',
              data: lvList,
              type: 'line',
              itemStyle: {
                opacity: 0
              },
              areaStyle: {}
            },
          ],
          textStyle: {
            color: 'white'
          }
        })
      },
      draw3() {
        const lvList = []
        let maxXll = Number.MIN_VALUE
        this.xllData2.forEach((item) => {
          lvList.push([item.area, item.capacity])
          maxXll = Math.max(maxXll, item.area)
        })
        chart.resize()
        chart.setOption({
          grid: {
            containLabel: true,
            top: 40,
            left: 20,
            bottom: 20,
            right: 60
          },
          xAxis: {
            name: '库容\n(m³)',
            type: 'value',
            min: (val) => Math.floor(val.min),
            max: (val) => Math.ceil(maxXll),
            splitLine: {
              show: false
            }
          },
          yAxis: {
            name: '面积(m²)',
            type: 'value',
            min: (val) => Math.floor(val.min - 1),
            max: (val) => Math.ceil(val.max + 1),
            splitLine: {
              show: false
            }
          },
          tooltip: {
            trigger: 'axis'
          },
          series: [
            {
              name: '水位',
              data: lvList,
              type: 'line',
              itemStyle: {
                opacity: 0
              },
              areaStyle: {}
            },
          ],
          textStyle: {
            color: 'white'
          }
        })
      },
    },
    mounted() {
      chart = echarts.init(this.$refs.chartRef)
      this.getData()
      this.getSkxll()
      this.getSkarea()
    }
  }
</script>

<style scoped></style>
