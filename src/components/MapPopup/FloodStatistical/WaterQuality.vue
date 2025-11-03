<template>
  <div style="display: flex; flex-direction: column; align-items: center;">
    <el-form
      class="dark"
      inline
    >
      <el-form-item>
        <el-select v-model="wqstCode" placeholder="请选择测站">
          <el-option
            v-for="item in stationList"
            :key="item.wqstCode"
            :label="item.wqstName"
            :value="item.wqstCode">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-date-picker
          key="moonth"
          v-model="dtrange"
          type="monthrange"
          value-format="yyyy-MM"
          popper-class="dark"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button
          class="dark"
          @click="getData"
        >查询</el-button>
      </el-form-item>
    </el-form>
    <div
      ref="chartRef"
      style="width: 100%; height: 350px;"
    ></div>
    <el-table
      :data="curData"
      class="dark"
      border>
      <el-table-column
        align="center"
        label="站点名称"
        prop="stnm"></el-table-column>
      <el-table-column
        align="center"
        label="达标水质"
        prop="twqnm">
      </el-table-column>
      <el-table-column
        align="center"
        label="当前水质"
        prop="wqnm">
      </el-table-column>
      <el-table-column
        align="center"
        label="监测时间"
        prop="tm">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.tm, '{y}-{m}') }}</span>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin-top: 10px;">
      <el-pagination
        :current-page.sync="pageNum"
        :page-size="pageSize"
        class="dark"
        background
        layout="->, prev, pager, next"
        :total="data.length"
      >
      </el-pagination>
    </div>
  </div>
</template>
<script>
  import * as echarts from 'echarts'

  let chart = null
  export default {
    inject: ['getStcd'],
    data() {
      const GAP = 30 * 12 * 86400 * 1000
      const endTime = new Date()
      const beginTime = new Date(endTime - GAP)
      return {
        dtrange: [parseTime(beginTime, '{y}-{m}-{d}'), parseTime(endTime, '{y}-{m}-{d}')],
        type: '月',
        data: [],
        dataItem: 'nh3',
        pageNum: 1,
        pageSize: 5,
        stationList: [],
        queryParams:{
          wqstCateg: null,
          wqstBelong: null,
          usFl: 1,
        },
        wqstCode: null
      }
    },
    computed: {
      curData() {
        const pageNum = this.pageNum
        const pageSize = this.pageSize
        const startNum = (pageNum - 1) * pageSize
        const endNum = pageNum * pageSize
        return this.data.slice(startNum, endNum)
      }
    },
    methods: {
      getData(){
      
      },
      drawChart() {
        const xAxisList = []
        const levelList = []
        const levelNameList = []
        const warningList = []
        const warningNameList = []
        this.data.forEach(item => {
          xAxisList.push(parseTime(item.tm, '{y}-{m}'))
          levelList.push(item.wqcd)
          levelNameList.push(item.wqnm)
          warningList.push(item.twqcd)
          warningNameList.push(item.twqnm)

        })
        chart.resize()
        const option = {
          legend: {
            textStyle: {
              color: 'white'
            }
          },
          tooltip: {
            trigger: 'axis',
            formatter: function (params) {
              return '当前水质：' + levelNameList[params[0].dataIndex] + '<br>'
                + '达标水质：' + warningNameList[params[0].dataIndex]
            }
          },
          grid: {
            containLabel: true,
            top: 50,
            left: 20,
            right: 20,
            bottom: 50
          },
          dataZoom: {},
          xAxis: {
            type: 'category',
            data: xAxisList
          },
          yAxis: {
            min: 0, // 设置 y 轴的最小值
            max: 5, // 设置 y 轴的最大值
            interval: 1, // 设置 y 轴的间隔
          },
          series: [
            {
              name: '水质评价',
              data: levelList,
              type: 'bar',
              smooth: true,
              barWidth: 30
            },
            {
              name: '达标水质',
              color: 'green',
              data: warningList,
              type: 'line',
              smooth: true
            },
          ],
          textStyle: {
            color: 'white'
          }
        }
        chart.resize()
        chart.setOption(option)
      }
    },
    mounted() {
      chart = echarts.init(this.$refs.chartRef)
      this.queryParams.wqstBelong = this.getStcd()
      
    }
  }
</script>
<style scoped></style>
