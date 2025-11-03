<template>
    <div style="flex: 1; color: #000; padding: 10px 0;">

        <div class="panelTitle">
            <div class="line">
            </div>
            <span>实时监测</span>
        </div>
        <el-descriptions :column="2" class="dark-description" border>
            <el-descriptions-item label="过去1小时降雨量(mm)">{{ numFormat(rainInfo.gq1h) }}</el-descriptions-item>
            <el-descriptions-item label="当前水位(m)">{{ numFormat(rz) }}</el-descriptions-item>
            <el-descriptions-item label="未来1小时降雨量(mm)">{{ numFormat(rainInfo.wl60) }}</el-descriptions-item>
            <el-descriptions-item label="未来1小时预测水位(m)">-</el-descriptions-item>
        </el-descriptions>
        <VueEcharts :option="option" style="height: 300px;" />
        <LivePlayer :url="cameraUrl" style="height: 500px; margin: 10px 0;" />
        <Panorama :scenes="scenes" style="height: 300px;" />
        <!-- <iframe src="https://www.720yun.com/vr/0b9jtrsvsm9" frameborder="0" style="width: 100%; height: 300px;"></iframe> -->
        <!-- <img src="@/assets/images/cim-demo.jpg" alt="" style="width: 100%;"> -->
    </div>
</template>
<script>
import dayjs from "dayjs"

import { findRzList, findRainInfo } from "@/api/nljc/index"
import { numFormat } from "@/utils/format"

import Panorama from '@/components/Panorama'
import LivePlayer from '@/components/LivePlayer'
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
        LivePlayer
    },
    data() {
        return {
            stcd: "10000000036",
            rainInfo: {
                gq1h: null,
                wl60: null
            },
            rz: null,
            cameraUrl: "",
            option: {
                title: {
                    text: "实时水位",
                    left: "center",
                    textStyle: {
                        color: '#fff'
                    }
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
                    color: '#fff'
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
            })
            findRainInfo(beginTime, endTime)
                .then((res) => {
                    this.rainInfo.gq1h = res.gq1h
                    this.rainInfo.wl60 = res.wl60
                })
        }
    },
    created() {
        this.getData()
    }
}
</script>
<style scoped>
.panelTitle {
    display: flex;
    align-items: center;
    padding: 5px 3px;
    margin: 10px 0;
    background: rgba(24, 144, 255, 0.2);
    font-size: 25px;
    font-weight: 600;

    .line {
        width: 3px;
        height: 22px;
        margin-right: 7px;
        border-radius: 10px;
        background: #1890ff;
    }
}
</style>