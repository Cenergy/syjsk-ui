<template>
    <el-dialog :visible.sync="isOpen" :modal="false" :wrapper-closable="false" :close-on-click-modal="false"
        width="80vw" @close="handleClose" custom-class="point-detail-dialog"
        destroy-on-close>
        <template #title>
            <div style="border-left: 3px solid #6ba3fd; padding-left: 10px;">
                <strong style="color: #000;    color: rgb(0, 0, 0);
    font-size: 23px;">{{ title }}</strong>
            </div>
        </template>
        <div class="dialogContainer">
            <div class="leftPart">
                <span style="font-size: 20px;font-weight: 600;">数字孪生</span>
                <LivePlayer v-if="isShowLeft === 'LivePlayer'" :url="cameraUrl" style="height: 100%; margin: 10px 0;" />
                <Panorama v-else-if="isShowLeft === 'Panorama'" :scenes="scenes" style="height: 100%; margin: 10px 0;" />
                <div class="metaData">
                    <span>地点：{{ "莲塘龙大高速桥底" }}</span>
                    <!-- <span>监测时间{{ "" }}</span> -->
                    <span>当前水深：{{ "0cm" }}</span>
                    <span>未来一小时水深：{{ "0cm" }}</span>
                    <span>未来三小时水深：{{ "0cm" }}</span>
                    <!-- <span>采集时间：{{ "2025-06-19 10:00:00" }}</span> -->
                </div>
                <div class="btnlist">
                    <el-button v-for="item of leftPartList" :key="item.value"
                        :style="{ 'background-color': isShowLeft == item.value ? 'rgba(39,149,210,1)' : '', 'color': isShowLeft == item.value ? '#FFF' : '' }"
                        @click="handleLeftBtnClick(item)">{{
                            item.label }}</el-button>
                </div>
            </div>
            <div class="rightPart" id="rightPart">
                <div style="position: sticky; top: 0; left: 0; margin-right: 5px;">
                    <CircleRadioGroup v-model="currentTabName" :options="tabList" direction="vertical"
                        @handleTabChange="handleTabChange" />
                </div>
                <div class="content">
                    <div id="base" style="flex: 1;" ref="Base">
                        <div class="panelTitle">
                            <div class="line">
                            </div>
                            <span style="">基本信息</span>
                        </div>
                        <el-descriptions :column="2" :labelStyle="{ width: '100px' }" border>
                            <el-descriptions-item label="所属街道">{{ baseInfo.jd }}</el-descriptions-item>
                            <el-descriptions-item label="所属社区">{{ baseInfo.sssq }}</el-descriptions-item>
                            <el-descriptions-item label="位置">{{ baseInfo.xcbmmc }}</el-descriptions-item>
                            <el-descriptions-item label="排水公司联系人电话">{{ baseInfo.lxr }}-{{ baseInfo.lxdh
                                }}</el-descriptions-item>
                            <el-descriptions-item label="积水原因" :span="2">
                                {{ baseInfo.jsys }}
                            </el-descriptions-item>
                            <el-descriptions-item label="降雨阈值" :span="2">{{ baseInfo.jyyz }}</el-descriptions-item>
                            <el-descriptions-item label="防御指引" :span="2">
                                <div v-for="line of splitLine(baseInfo.fyzy)" :kye="line">{{ line }}</div>
                            </el-descriptions-item>
                            <el-descriptions-item label="预置力量" :span="2">
                                <div v-for="line of splitLine(baseInfo.czya, ';')" :kye="line">{{ line }}</div>
                            </el-descriptions-item>
                        </el-descriptions>

                    </div>
                    <!-- <div style="width: 100%;height: 1px;background: #ccc;margin: 20px 0;"></div> -->
                     <el-divider></el-divider>
                    <Monitor id="monitor" ref="Monitor" :id="id" />
                    <el-divider></el-divider>
                    <!-- <div style="width: 100%;height: 1px;background: #ccc;margin: 20px 0;"></div> -->
                    <Forecast ref="Forecast" :id="id" />
                    <el-divider></el-divider>
                    <!-- <div style="width: 100%;height: 1px;background: #ccc;margin: 20px 0;"></div> -->
                    <Command ref="Command" :id="id" />
                </div>
            </div>

            <!-- <component :is="currentTabName" :id="id" /> -->
        </div>

    </el-dialog>
</template>
<script>
// import Base from './Base.vue'
import LivePlayer from '@/components/LivePlayer'
import Monitor from './Monitor/index.vue'
import Forecast from './Forecast.vue'
import Command from './Command.vue'
import Panorama from '@/components/Panorama'
import CircleRadioGroup from '@/components/CircleRadioGroup'

import { getWaterLoggingPointBaseInfo, findVideoUrl, videoCheck } from "@/api/nljc/index.js"

export default {
    props: {
        visible: {
            type: Boolean,
            default: false
        }
    },
    components: {
        Monitor,
        Forecast,
        Command,
        CircleRadioGroup,
        LivePlayer,
        Panorama
    },
    data() {
        return {
            isOpen: this.visible,
            id: null,
            currentTabName: "Base",
            cameraUrl: "",
            timer: null,
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
            },
            tabList: [
                {
                    label: "基本信息",
                    value: "Base"
                },
                {
                    label: "实时监测",
                    value: "Monitor"
                },
                {
                    label: "预报预警",
                    value: "Forecast"
                },
                {
                    label: "指挥调度",
                    value: "Command"
                }
            ],
            isShowLeft: "LivePlayer",
            leftPartList: [
                {
                    label: "监控视频",
                    value: "LivePlayer"
                },
                {
                    label: "实景",
                    value: "Panorama"
                },
                {
                    label: "BIM",
                    value: "BIM"
                },
            ], // 左侧列表
            title: "莲塘龙大高速桥底",
            baseInfo: {},
            observer: null,
        }
    },
    methods: {
        debounce(func, wait) {
            let timeout;
            return function (...args) {
                const context = this;
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    func.apply(context, args);
                }, wait);
            };
        },
        handleTabChange(tabValue) {
            // this.currentTabName = tabValue;
            switch (tabValue) {
                case 'Base':
                    this.$refs.Base.scrollIntoView({ behavior: 'smooth' });
                    break;
                case 'Monitor':
                    this.$refs.Monitor.$el.scrollIntoView({ behavior: 'smooth' });
                    break;
                case 'Forecast':
                    this.$refs.Forecast.$el.scrollIntoView({ behavior: 'smooth' });
                    break;
                case 'Command':
                    this.$refs.Command.$el.scrollIntoView({ behavior: 'smooth' });
                    break;
            }
        },
        handleLeftBtnClick(item) {
            this.isShowLeft = item.value
        },
        setTitle(title) {
            this.title = title
        },
        onOpenJDLDetail(id) {
            this.isOpen = true
            this.id = 462
            
            getWaterLoggingPointBaseInfo(this.id)
                .then(res => {
                    if (res.data.length === 0) {
                        return undefined
                    }
                    this.baseInfo = res.data[0]
                    this.setTitle(this.baseInfo.name)
                })
            findVideoUrl("44031150001310203001")
                .then((res) => {
                    console.log(res)
                    this.cameraUrl = res.data.flvUrl
                    this.heart()
                })

            this.$nextTick(() => {
                this.observer.observe(this.$refs.Base);
                this.observer.observe(this.$refs.Monitor.$el);
                this.observer.observe(this.$refs.Forecast.$el);
                this.observer.observe(this.$refs.Command.$el);
            })
            // this.$bus.emit("switchLeftCol", false)
        },
        heart() {
            this.timer = setInterval(() => {
                videoCheck("44031150001310203001")
            }, 10000)
        },
        splitLine(ctn, delimiter = '；') {
            if (!ctn) {
                return []
            }
            return ctn.split(delimiter)
        },
        handleClose() {
            this.$bus.emit("switchLeftCol", true)
        },
        handleChangePano(lv) {
            this.scenes.poi1.panorama = `/qjt/poi1${lv}.jpg`
        }
    },
    provide() {
        // const setTitle = this.setTitle
        return {
            setTitle: this.setTitle
        }
    },
    watch: {
        visible(val) {
            this.isOpen = val
        }
    },
    created() {
        this.$bus.on("openJLDDetail", this.onOpenJDLDetail)
        this.$bus.on("changePano", this.handleChangePano)
        this.observer = new IntersectionObserver(this.debounce((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (this.$refs.Command.$el == entry.target) {
                        this.currentTabName = "Command"
                    } else if (this.$refs.Monitor.$el == entry.target) {
                        this.currentTabName = "Monitor"
                    } else if (this.$refs.Forecast.$el == entry.target) {
                        this.currentTabName = "Forecast"
                    } else if (this.$refs.Base == entry.target) {
                        this.currentTabName = "Base"
                    }
                }
            })
        }, 200), {
            root: document.querySelector('#rightPart .content'),
            threshold: 1
        })
    },
    // updated() {
    //     this.$nextTick(() => {
    //         this.observer = new IntersectionObserver(this.debounce((entries) => {
    //             entries.forEach(entry => {
    //                 if (entry.isIntersecting) {
    //                     if (this.$refs.Command.$el == entry.target) {
    //                         this.currentTabName = "Command"
    //                     } else if (this.$refs.Monitor.$el == entry.target) {
    //                         this.currentTabName = "Monitor"
    //                     } else if (this.$refs.Forecast.$el == entry.target) {
    //                         this.currentTabName = "Forecast"
    //                     } else if (this.$refs.Base == entry.target) {
    //                         this.currentTabName = "Base"
    //                     }
    //                 }
    //             })
    //         }, 200), {
    //             root: document.getElementById('rightPart'),
    //             threshold: 1, // 当100%的元素进入视口时触发
    //             rootMargin: '0px'
    //         })
    //         this.observer.observe(this.$refs.Base);
    //         this.observer.observe(this.$refs.Monitor.$el);
    //         this.observer.observe(this.$refs.Forecast.$el);
    //         this.observer.observe(this.$refs.Command.$el);
    //     })
    // },
    beforeDestroy() {
        this.$bus.off("openJLDDetail", this.onOpenJDLDetail)
        clearInterval(this.timer)
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}
</script>
<style scoped>
::v-deep .el-dialog__body {
    padding: 0px 20px 30px 20px !important;
}

.dialogContainer {
    height: 70vh;
    overflow: hidden;
    display: flex;

    .leftPart {
        width: 45%;
        overflow: hidden;
        display: flex;
        flex-direction: column;

        .btnlist {
            z-index: 999;
            z-index: 999;
            position: relative;
            bottom: 5vh;
            right: 3vw;
            display: flex;
            justify-content: flex-end;

            .el-button {
                background: rgb(64, 64, 70);
                color: #FFF;
            }
        }

        .metaData {
            position: absolute;
            top: 10vh;
            font-size: 18px;
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
            left: 10vw;
            -webkit-box-orient: vertical;
            -webkit-box-direction: normal;
            -ms-flex-direction: column;
            flex-direction: column;
            width: 280px;
            background: rgb(243 187 78 / 80%);
            padding: 5px 19px;
            color: #000;
            font-weight: 600;
            border-radius: 5px;
        }
    }

    .rightPart {
        display: flex;
        align-items: start;
        padding: 0px 10px;
        width: 55%;
        height: 100%;
        overflow-y: scroll;

        .content {
            width: 100%;
            scroll-behavior: smooth;

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
        }
    }
}

/* .point-detail-dialog {
    ::v-deep .el-dialog.import-dialog {
        height: auto;
        max-height: 80vh;
        overflow-y: auto;
    }
    ::v-deep .el-dialog__body {
        max-height: 70vh !important;
    }

} */
</style>