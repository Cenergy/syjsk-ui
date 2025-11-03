<template>
    <div style="flex: 1;">
                    <div class="panelTitle">
                            <div class="line">
                            </div>
                            <span>预报预警</span>
                        </div>
        <el-form label-position="left" >
            <el-row :gutter="10">
                <el-col :span="14">
                    <el-form-item label="计算方法">
                        <el-radio-group v-model="form.method">
                            <el-radio label="1">暴雨强度公式法</el-radio>
                            <el-radio label="2">SCS模型法</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-col>
                <el-col :span="10">
                    <el-form-item>
                        <el-button type="primary" @click="handleCalc">计算</el-button>
                        <el-button type="primary" @click="handleShowPano">数字孪生实景</el-button>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row :gutter="10">
                <el-col :span="12">
                    <el-form-item label="预报降雨量(mm)">
                        <el-input v-model="form.rain"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="预报降雨时长(h)">
                        <!-- <el-input v-model="form.hh"></el-input> -->
                        	<el-select clearable v-model="form.hh"  style="width:100%">
					<el-option  value="1">1小时</el-option>
                    <el-option  value="3">3小时</el-option>
                    <el-option  value="6">6小时</el-option>
				</el-select>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
        <el-descriptions :column="2" class="dark-description" border style="width: 100%;">
            <el-descriptions-item label="积水量(m³)" :span="2">{{ data.drp }}</el-descriptions-item>
        </el-descriptions>
        <VueEcharts :option="chartOption" style="height: 300px;" />
        <div v-if="isShowPano" style="position: fixed; top: 0; left: 0; width: 65vw; height: 100%;" >
            <Panorama :scenes="scenes" />
            <div style="position: absolute; top: 0; left: 0; width: 100%; text-align: center; color: yellow;">
                <h2>数字孪生实景</h2>
            </div>
            <div style="position: absolute; bottom: 0; left: 0; color: yellow; font-size: 20px;">
                <div>当前水位（m）：{{ numFormat(0.02) }}</div>
                <div>未来1小时预测水位（m）：</div>
            </div>
        </div>
    </div>
</template>
<script>
import { calcJsInfo, getJsData } from "@/api/nljc/calc"

import { numFormat } from "@/utils/format"
import VueEcharts from "@/components/VueEcharts"
import Panorama from '@/components/Panorama'

export default {
    components: {
        Panorama,
        VueEcharts
    },
    data() {
        return {
            form: {
                method: "2",
                rain: null,
                hh: null
            },
            data: {},
            ymfw: {},
            isShowPano: false,
            chartOption: {
                title: {
                    text: "过去24小时水雨情信息",
                    top: 10,
                    left: "center",
                    textStyle: {
                        color: '#000'
                    }
                },
                xAxis: {
                    type: 'category',
                    data: []
                },
                yAxis: [
                    {
                        name: "m",
                        type: 'value',
                        max: 1.5
                    },
                    {
                        name: "mm",
                        type: 'value',
                        inverse: true
                    },
                ],
                tooltip: {
                    trigger: 'axis'
                },
                series: [
                    {
                        name: "水位",
                        data: [],
                        type: 'line',
                    },
                    {
                        name: "降雨量",
                        data: [],
                        type: 'bar',
                        yAxisIndex: 1
                    },
                ],
                textStyle: {
                    color: '#000'
                }
            },
            scenes: {
                poi1: {
                    panorama: "/qjt/poi1_60mm.jpg",
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
            getJsData(this.id)
                .then(res => {
                    for (let idx = 0; idx < res.rz24List.length; ++idx) {
                        const { tm, rz } = res.rz24List[idx]
                        const { drp } = res.drp24List[idx]
                        this.chartOption.xAxis.data.push(tm)
                        this.chartOption.series[0].data.push(rz)
                        this.chartOption.series[1].data.push(drp)
                    // if (res.gq1h > 15 && res.gq1h <= 30) {
                    //     rainLv = "_30mm"
                    // } else if (res.gq1h > 30 && res.gq1h <= 60) {
                    //     rainLv = "_60mm"
                    // } else if (res.gq1h > 60) {
                    //     rainLv = "_100mm"
                    // }
                    // this.scenes.poi1.panorama = `/qjt/poi1${rainLv}.jpg`
                    }
                })
        },
        handleCalc() {      
            calcJsInfo(this.form.method,
                this.form.rain,
                this.form.hh)
                .then(res => {
                    this.data = res.data
                    // this.isShowPano = true
                    this.handleShowPano()
                    const { drp } = res.data
                    if (drp < 0.22) {
                        this.$bus.emit("changePano", "")
                    } else if (drp < 1.89) {
                        this.$bus.emit("changePano", "_30mm")
                    } else if (drp < 16.97) {
                        this.$bus.emit("changePano", "_60mm")
                    } else if (drp < 104.28) {
                        this.$bus.emit("changePano", "_100mm")
                    }
                })
        },
        handleShowPano() {
            this.isShowPano = !this.isShowPano
            // if (this.isShowPano) {
            //     this.$bus.emit("removePsfq")
            // } else {
            //     this.$bus.emit("addPsfq", {
            //         drainageArea: 0,
            //         depth: 0,
            //         drainageZoneArea: 0,
            //         capacity: 0,
            //     })
            // }
        },
    },
    mounted() {
        this.$bus.emit("addPsfq", {
            drainageArea: 0,
            depth: 0,
            drainageZoneArea: 0,
            capacity: 0,
        })
        this.getData()
    },
    beforeDestroy() {
        this.$bus.emit("removePsfq")
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