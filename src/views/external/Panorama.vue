<template>
    <div class="container">
        <div style="width: 65vw; height: 100%; position: relative;">
            <Panarama ref="PanaRef" :scenes="scenes" style="width: 100%; height: 100%;" />
            <div style="position: absolute; bottom: 0; left: 0; width: 100%; font-size: 20px; color: yellow;">
                <div>当前水深：{{ numFormat(rz) }}m</div>
                <div>未来1小时预测水深：-m</div>
                <div style="float: right;">
                    <el-button style="background-color: rgb(53, 99, 158);color: #FFF;" @click="handleChange(0)">0mm</el-button>
                    <el-button style="background-color: rgb(53, 99, 158);color: #FFF;" @click="handleChange(30)">1小时30mm</el-button>
                    <el-button style="background-color: rgb(53, 99, 158);color: #FFF;" @click="handleChange(60)">1小时60mm</el-button>
                    <el-button style="background-color: rgb(53, 99, 158);color: #FFF;" @click="handleChange(100)">1小时100mm</el-button>
                </div>
            </div>
        </div>
        <el-drawer  :visible="true" :modal="false" :wrapper-closable="false" :show-close="false" size="35vw"
            custom-class="dark-drawer">
            <template #title>
                <div style="border-left: 3px solid #6ba3fd; background-color: rgb(53, 99, 158);padding-left: 10px;">
                    <strong style="color: #FFF;">龙大高速桥底</strong>
                </div>
            </template>
            <div style="padding: 0 10px;">
                <el-row style="margin-bottom: 10px;">
                    <el-col :span="12" style="text-align: center;">
                        <strong style="color: #FFF;">降雨监测</strong>
                    </el-col>
                    <el-col :span="12" style="text-align: center;">
                        <strong style="color: #FFF;">水位监测</strong>
                    </el-col>
                </el-row>
                <el-descriptions :column="2" class="dark-description" border>
                    <el-descriptions-item label="过去1小时降雨量(mm)">{{ numFormat(rainInfo.gq1h) }}</el-descriptions-item>
                    <el-descriptions-item label="当前水深(m)">{{ numFormat(rz) }}</el-descriptions-item>
                    <el-descriptions-item label="未来1小时降雨量(mm)">{{ numFormat(rainInfo.wl60) }}</el-descriptions-item>
                    <el-descriptions-item label="未来1小时预测水深(m)">-</el-descriptions-item>
                </el-descriptions>
                <VueEcharts :option="option" style="height: 300px;" />
                <LivePlayer :url="cameraUrl" style="height: 400px; margin: 10px 0;" />
            </div>
        </el-drawer>
    </div>
</template>
<script>
import dayjs from "dayjs"

import { findRzList, findRainInfo, findVideoUrl, videoCheck } from "@/api/nljc/index"
import { numFormat } from "@/utils/format";

import Panarama from "@/components/Panorama";
import LivePlayer from '@/components/LivePlayer';


export default {
    components: {
        Panarama,
        LivePlayer
    },
    data() {
        return {
            rz: 0,
            rainInfo: {
                gq1h: null,
                wl60: null
            },
            videoSessionId: "",
            cameraUrl: "",
            option: {
                title: {
                    text: "实时水深",
                    top: 20,
                    left: "center",
                    textStyle: {
                        color: '#fff'
                    }
                },
                grid: {
                    right: 20,
                    bottom: 30,
                },
                tooltip: {
                    trigger: 'axis'
                },
                xAxis: {
                    type: 'category',
                    data: []
                },
                yAxis: {
                    name: "m",
                    type: 'value',
                    max: 1.5
                },
                series: [
                    {
                        name: '实时水深',
                        data: [],
                        type: 'line',
                        smooth: true
                    }
                ],
                textStyle: {
                    color: '#fff'
                }
            },
            scenes: {
                poi1: {
                    hfov: 80,
                    yaw: -20,
                    panorama: "/qjt/poi1.jpg",
                    hotSpots: [
                        {
                            pitch: 1,
                            yaw: -35,
                            type: "scene",
                            text: "前往桥底",
                            sceneId: "poi2"
                        },
                    ]
                },
                poi2: {
                    yaw: 90,
                    panorama: "/qjt/poi2.jpg",
                    hotSpots: [
                        {
                            pitch: 2,
                            yaw: 55,
                            type: "scene",
                            text: "前进",
                            sceneId: "poi3"
                        },
                        {
                            pitch: -1,
                            yaw: 200,
                            type: "scene",
                            text: "后退",
                            sceneId: "poi1"
                        },
                    ]
                },
                poi3: {
                    panorama: "/qjt/poi3.jpg",
                    hotSpots: [
                        // {
                        //     yaw: 180,
                        //     type: "scene",
                        //     text: "返回",
                        //     sceneId: "poi1"
                        // },
                        {
                            yaw: -43,
                            type: "scene",
                            text: "返回桥洞内",
                            sceneId: "poi2"
                        },
                    ]
                }
            }
        }
    },
    mounted() {
        this.getData()
    },
    methods: {
        handleChange(val) {
            console.log(val);
            
               if (val == 0) {
                this.scenes.poi1.panorama = "/qjt/poi1.jpg"
                this.scenes.poi2.panorama = "/qjt/poi2.jpg"
                this.scenes.poi3.panorama = "/qjt/poi3.jpg"
            } else {
                this.scenes.poi1.panorama = `/qjt/poi1_${val}mm.jpg`
                this.scenes.poi2.panorama = `/qjt/poi2_${val}mm.jpg`
                this.scenes.poi3.panorama = `/qjt/poi3_${val}mm.jpg`
            }
            this.$nextTick(() => {
                this.$refs.PanaRef.init()
            })
        },
        numFormat,
        getData() {
            const beginTime = dayjs().subtract(1, 'days').format('YYYY-MM-DD HH:mm:00')
            const endTime = dayjs().format('YYYY-MM-DD HH:mm:00')
            findRzList(this.stcd, beginTime, endTime).then(res => {
                this.option.xAxis.data = []
                this.option.series[0].data = []
                res.data.forEach(({ tm, rz }) => {
                    this.option.xAxis.data.push(tm)
                    this.option.series[0].data.push(rz)
                })
                this.rz = res.data[res.data.length - 1].rz
            })
            findRainInfo(beginTime, endTime)
                .then((res) => {
                    this.rainInfo.gq1h = res.gq1h
                    this.rainInfo.wl60 = res.wl60
                })
            findVideoUrl("44031150001310203001")
                .then((res) => {
                    console.log(res)
                    this.videoSessionId = res.data.sessionid
                    this.cameraUrl = res.data.flvUrl
                    this.heart()
                })
        },
        heart() {
            this.timer = setInterval(() => {
                videoCheck(this.videoSessionId)
            }, 10000)
        }
    }
}
</script>
<style scoped>
.container {
    display: flex;
    width: 100%;
    height: 100%;
}


::v-deep .el-drawer{
    background-color: rgb(53, 99, 158) !important;
    /* #el-drawer__title{
        background-color: rgb(53, 99, 158)!important;
    }
    .el-drawer__body{
        background-color: rgb(53, 99, 158);
    }
    .el-drawer__header{
         background-color: rgb(53, 99, 158);
    } */
      
}
::v-deep .el-descriptions{
.el-descriptions-item__cell{
    background: rgb(58, 106, 162);
    color: #FFF;
    border: 1px solid rgba(255, 255, 255, 0.2);
    .el-descriptions-item__content{
         background-color: rgb(53, 99, 158);
    }
}
}
</style>