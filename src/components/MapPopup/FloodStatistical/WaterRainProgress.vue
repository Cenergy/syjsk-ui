<template>
    <div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3>水库水雨情</h3>
            <!-- <el-select
                v-model="tp"
                class="dark"
                popper-class="dark"
                style="margin-right: 15px;"
            >
                <el-option
                    label="逐分"
                    value="1"
                ></el-option>
                <el-option
                    label="逐时"
                    value="2"
                ></el-option>
            </el-select> -->
            <el-date-picker
                v-model="dtrange"
                popper-class="dark"
                class="dark"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="yyyy-MM-dd HH:mm:ss"
                value-format="yyyy-MM-dd HH:mm:ss"
                style="flex: 1; margin: 0px 15px;"
            ></el-date-picker>
            <el-button
                class="dark"
                icon="el-icon-search"
                @click="getData"
            >查询</el-button>
        </div>
        <div style="text-align: center;">
            <span style="margin-right: 20px">最近1小时雨量:{{ data.drp1Hour }}mm</span>
            <span style="margin-right: 20px">最近3小时雨量:{{ data.drp3Hour }}mm</span>
            <span style="margin-right: 20px">最近6小时雨量:{{ data.drp6Hour }}mm</span>
            <span style="margin-right: 20px">当日雨量:{{ data.drpToday }}mm</span>
            <span style="margin-right: 20px">昨日雨量:{{ data.drpYesterday }}mm</span>
        </div>
        <div
            ref="chartRef"
            style="width: 100%; height: 500px;"
        ></div>
        <el-table
            :data="curData"
            class="dark"
            border
            size="small"
        >
            <el-table-column
                align="center"
                label="序号"
                type="index"
            ></el-table-column>
            <el-table-column
                align="center"
                label="时间"
                prop="tm"
            ></el-table-column>
            <el-table-column
                align="center"
                label="水位(m)"
                prop="rz"
            ></el-table-column>
            <el-table-column
                align="center"
                label="雨量(mm)"
                prop="drp"
            ></el-table-column>
        </el-table>
        <div style="margin-top: 10px;">
            <el-pagination
                :current-page.sync="pageNum"
                :page-size="pageSize"
                class="dark"
                background
                layout="->, prev, pager, next"
                :total="data.dataList.length"
            >
            </el-pagination>
        </div>
        <!--        <div style="margin-left: 20px;">-->
        <!--            <div>累计降雨:{{ totalRain.toFixed(2) }}mm</div>-->
        <!--            <div>水位增量:{{ maxDiffRz.toFixed(2) }}米</div>-->
        <!--        </div>-->
    </div>
</template>
<script>
import * as echarts from 'echarts';
import { getRsvrSzHChart } from "@/api/map/reservoir";
import { parseTime } from "@/utils/ruoyi"

let chart = null
export default {
    inject: [
        "getStcd",
        "baseInfo"
    ],
    data() {
        const endTime = new Date()
        const beginTime = new Date(endTime - 86400 * 1000)
        return {
            data: {
                contain: null,
                dataList: [],
                maxWater: null,
                maxWaterTime: "",
                minWater: null,
                minWaterTime: "",
                warningStage: null,
                drp1Hour: 0,
                drp3Hour: 0,
                drp6Hour: 0,
                drpToday: 0,
                drpYesterday: 0
            },
            tableData: [],
            pageNum: 1,
            pageSize: 10,
            tp: '1',
            loaded: false,
            dtrange: [parseTime(beginTime), parseTime(endTime)],
            totalRain: 0,
            maxDiffRz: 0
        };
    },
    computed: {
        curData() {
            const pageNum = this.pageNum
            const pageSize = this.pageSize
            const startNum = (pageNum - 1) * pageSize
            const endNum = pageNum * pageSize
            return this.tableData.slice(startNum, endNum)
        }
    },
    methods: {
        getData() {
            const stcd = this.getStcd()
            const [beginDate, endDate] = this.dtrange;
            getRsvrSzHChart(stcd, beginDate, endDate)
                .then(res => {
                    this.data = res.data || {}
                    this.tableData = res.data.dataList.reverse()
                    this.draw()
                })
        },
        draw() {
            const xAxisList = []
            const rzList = []
            const dsList = []
            const fxswList = []
            let maxRz = 0
            this.totalRain = 0
            this.data.dataList.forEach(item => {
                maxRz = Math.max(maxRz, item.rz)
                if (item.ds) {
                    this.totalRain += parseFloat(item.ds)
                }
                fxswList.push(this.data.warningStage)
                xAxisList.push(item.tm)
                rzList.push(item.rz)
                dsList.push(item.drp)
            })
            this.maxDiffRz = maxRz - (rzList[0] ?? 0)
            const option = {
                grid: {
                    top: 30,
                    bottom: 50,
                    left: 40,
                    right: 40,
                    containLabel: true
                },
                legend: {
                    textStyle: {
                        color: "#fff"
                    }
                },
                tooltip: {
                    trigger: 'axis'
                },
                xAxis: {
                    type: 'category',
                    data: xAxisList
                },
                yAxis: [
                    {
                        name: "水位(m)",
                        type: 'value',
                        min: val => Math.floor(val.min - 1),
                        splitLine: {
                            show: true,
                            lineStyle: {
                                color: 'rgba(255, 255, 255, 0.1)' // 设置网格线颜色和透明度
                            }
                        }
                    },
                    {
                        name: "降雨量(mm)",
                        nameLocation: 'start',
                        type: 'value',
                        max: val => {
                            const top = Math.ceil(val.max + 1);
                            const max = Math.ceil(top / 5) * 5;
                            // return Math.max(top, 20)
                            return max
                        },
                        inverse: false,
                        splitLine: {
                            show: true,
                            lineStyle: {
                                color: 'rgba(255, 255, 255, 0.1)' // 设置网格线颜色和透明度
                            }
                        }
                    }
                ],
                dataZoom: {},
                color: ["#1e90ff", "red", "#57b674"],
                series: [
                    {
                        name: '实时水位',
                        data: rzList,
                        type: 'line'
                    },
                    {
                        name: '警戒水位',
                        data: fxswList,
                        type: 'line'
                    },
                    {
                        name: '降雨量',
                        data: dsList,
                        type: 'bar',
                        barWidth: 20,
                        yAxisIndex: 1
                    },
                ],
                textStyle: {
                    color: "#fff"
                }
            };
            chart.setOption(option)
        }
    },
    mounted() {
        chart = echarts.init(this.$refs.chartRef)
        this.getData()
    }
};
</script>
<style scoped></style>
