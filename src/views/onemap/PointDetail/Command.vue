<template>
    <div style="flex: 1; ">
                     <div class="panelTitle">
                            <div class="line">
                            </div>
                            <span>指挥调度</span>
                        </div> 
        <DarkRadio v-model="activeTab" :items="radioItems" style="margin-bottom: 10px;" />
        <div v-if="activeTab === 'qxcl'">
            <LivePlayer :url="videoUrl" style="height: 300px; margin-bottom: 10px;" />
            <lightTable :columns="qxclColumns" :data="qxclList" @row-click="handleSwitchCar" />
        </div>
        <div v-else-if="activeTab === 'zsry'">
            <strong class="title">现场处置人员</strong>
            <lightTable :columns="czryCols" :data="czryList" />
            <strong class="title">一点一策专员</strong>
            <lightTable :columns="otherCols" :data="ydycList" />
            <strong class="title">街道三防</strong>
            <lightTable :columns="otherCols" :data="jdsfList" />
            <strong class="title">市交通运输局光明管理局</strong>
            <lightTable :columns="otherCols" :data="jtysjList" />
            <strong class="title">光明交警大队</strong>
            <lightTable :columns="otherCols" :data="jjddList" />
        </div>
        <div v-else-if="activeTab === 'fxsb'">
            <lightTable :columns="fxsbCols" :data="fxsbList" />
        </div>
        <div v-else style="color: #FFF;">
            <p>1.值守小组接暴雨预警信息后，提前对高位周边截水沟施、桥底格栅沟、过路倒虹吸进行检查，清理设施周边和垃圾</p>
            <p>2.提前打开雨水篦子进行助排，放置雨水篦防坠器</p>
            <p>3.预备小型抽排设施和三防泵车，在积水过深时进行抽排，排入龙大高速北侧排水沟自排或者小泵站检查井内由小泵站抽排</p>
            <p>4.对接街道三防人员，对过往人员和车辆进行交通疏导，必要时封锁道路。</p>
            <img src="/paper/公明街道办.png" style="width: 100%;" alt="">
            <img src="/paper/上村社区.jpg" style="width: 100%;" alt="">

        </div>
    </div>
</template>
<script>
import { distance, point } from "@turf/turf"

import { getWaterLoggingPointBaseInfo, findZbzsryList, findFxsbList, findVehicleVideoUrl } from "@/api/nljc/index"

import DarkRadio from "@/components/DarkRadio"
import lightTable from "@/components/lightTable"
import LivePlayer from "@/components/LivePlayer"

export default {
    props: {
        id: {
            type: String,
            default: ""
        }
    },
    components: {
        DarkRadio,
        lightTable,
        LivePlayer
    },
    data() {
        return {
            radioItems: [
                {
                    label: "抢修车辆",
                    value: "qxcl"
                },
                {
                    label: "值守人员",
                    value: "zsry"
                },
                {
                    label: "防汛设备",
                    value: "fxsb"
                },
                {
                    label: "处置预案",
                    value: "czya"
                }
            ],
            activeTab: "qxcl",
            videoUrl: "",
            // zsryList: []
            qxclColumns: [
                {
                    label: "车辆所在地址",
                    prop: "LOCATION",
                },
                {
                    label: "联系人(司机)",
                    prop: "driver",
                },
                {
                    label: "电话",
                    prop: "driver_phone",
                },
                {
                    label: "车牌",
                    prop: "carcode",
                },
                {
                    label: "距离(km)",
                    prop: "distance",
                }
            ],
            czryCols: [
                {
                    label: "姓名",
                    prop: "username"
                },
                {
                    label: "联系电话",
                    prop: "tel"
                },
                {
                    label: "电话呼叫",
                    prop: "telCall"
                }
                
            ],
            otherCols: [
                {
                    label: "姓名",
                    prop: "mc",
                },
                {
                    label: "联系电话",
                    prop: "lxdh",
                },
                 {
                    label: "电话呼叫",
                    prop: "telCall"
                }
            ],
            fxsbCols: [
                {
                    label: "物资名称",
                    prop: "plsbjwz"
                },
                {
                    label: "物资数量",
                    prop: "sl"
                },
            ],
            qxclList: [],
            czryList: [
               
             
            ],
            ydycList: [],
            jdsfList: [],
            jtysjList: [],
            jjddList: [],
            fxsbList: []
        }
    },
    methods: {
        getData() {
            // this.czryList.push({
            //     username:"郑**",
            //     tel:"138****2361",
            //     telCall:true,
            // })
            findZbzsryList(this.id)
                .then(res => {
                    this.czryList = res.czry;
                    for (let item of res.zsry) {
                        item.telCall = true;
                        if (item.ssdw === "一点一策专员") {
                            this.ydycList.push(item)
                        } else if (item.ssdw === "街道三防") {
                            this.jdsfList.push(item)
                        } else if (item.ssdw === "市交通运输局光明管理局") {
                            this.jtysjList.push(item)
                        } else if (item.ssdw === "光明交警大队") {
                            this.jjddList.push(item)
                        }
                    }
                })
            let poi = point([113.903545, 22.80307])
        },
        handleSwitchCar(row) {
            findVehicleVideoUrl(row.carcode, row.sources, row.device_id)
                .then((res) => {
                    this.videoUrl = res.data.url
                    // const seesionId = new URL(res.data.url).searchParams.get("JSESSIONID").toUpperCase()
                    // open(res.data.url)
                    // this.videoUrl = `ws://172.19.2.125:6604/3/3?AVType=1&jsession=${seesionId}&DevIDNO=${row.device_id}&Channel=0&Stream=1&ttxplayer=1&ttxver=1`

                })
        }
    },
    watch: {
        id: {
            handler() {
                if (this.id) {
                    this.getData()
                }
            },
            immediate: true
        }
    }
}
</script>
<style scoped>
.title {
    font-weight: bolder;
    margin: 10px 0;
    display: inline-block;
    color: #000;
}
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