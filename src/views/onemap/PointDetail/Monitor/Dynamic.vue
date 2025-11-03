<template>
    <div>
        <el-row style="margin-bottom: 10px;">
            <el-col :span="12" style="text-align: center;">
                <strong style="color: #000;">降雨监测</strong>
            </el-col>
            <el-col :span="12" style="text-align: center;">
                <strong style="color: #000;">水位监测</strong>
            </el-col>
        </el-row>
        <el-descriptions
        :column="2"
        
        border>
            <el-descriptions-item label="过去1小时降雨量(mm)">{{ numFormat(rainInfo.gq1h) }}</el-descriptions-item>
            <el-descriptions-item label="当前水位(m)">{{ numFormat(rz) }}</el-descriptions-item>
            <el-descriptions-item label="未来1小时降雨量(mm)">{{ numFormat(rainInfo.wl60) }}</el-descriptions-item>
            <el-descriptions-item label="未来1小时预测水位(m)">-</el-descriptions-item>
        </el-descriptions>
        <VueEcharts :option="option" style="height: 200px;" />
        <!-- <LivePlayer :url="cameraUrl" style="height: 400px; margin: 10px 0;" /> -->
        <!-- <Panorama :scenes="scenes" style="height: 300px;" /> -->
    </div>
</template>
<script>

import dayjs from "dayjs"

import { findRzList, findRainInfo, findVideoUrl, videoCheck } from "@/api/nljc/index"
import { numFormat } from "@/utils/format"

import Panorama from '@/components/Panorama'
// import LivePlayer from '@/components/LivePlayer'
import VueEcharts from '@/components/VueEcharts'

export default {
    props: {
        id: {
            type: [String, Number],
            default: ""
        }
    },
    components: {
        Panorama,
        VueEcharts,
        // LivePlayer
    },
    data() {
        return {
            stcd: "10000000036",
            isShowPano: true,
            rainInfo: {
                gq1h: null,
                wl60: null
            },
            rz: null,
            cameraUrl: "",
            videoSessionId: null,
            timer: null,
            option: {
                title: {
                    text: "实时水位",
                    top: 20,
                    left: "center",
                    textStyle: {
                        color: '#000'
                    }
                },
                grid: {
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
                        name: '实时水位',
                        data: [],
                        type: 'line',
                        smooth: true
                    }
                ],
                textStyle: {
                    color: '#000'
                }
            },
            scenes: {
                poi1: {
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
    methods: {
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
                    let rainLv = ""
                    this.rainInfo.gq1h = res.gq1h
                    this.rainInfo.wl60 = res.wl60
                    if (res.gq1h > 15 && res.gq1h <= 30) {
                        rainLv = "_30mm"
                    } else if (res.gq1h > 30 && res.gq1h <= 60) {
                        rainLv = "_60mm"
                    } else if (res.gq1h > 60) {
                        rainLv = "_100mm"
                    }
                    this.scenes.poi1.panorama = `/qjt/poi1${rainLv}.jpg`
                })
            // findVideoUrl("44031150001310203001")
            //     .then((res) => {
            //         console.log(res)
            //         this.videoSessionId = res.data.sessionid
            //         this.cameraUrl = res.data.flvUrl
            //         this.heart()
            //     })
        },
        heart() {
            this.timer = setInterval(() => {
                videoCheck(this.videoSessionId)
            }, 10000)
        },
        onChangePano(isShow) {
            this.isShowPano = isShow
        }
    },
    watch: {
        "rainInfo.gq1h"() { 
            
        }
    },
    created() {
        this.getData()
        this.$bus.on("changePano", this.onChangePano)
    },
    beforeDestroy() {
        this.$bus.off("changePano", this.onChangePano)
        clearInterval(this.timer)
    }
}
</script>
<style scoped>
    
</style>