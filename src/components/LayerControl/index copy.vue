<template>
    <div class="panelContainer">
        <ul>
            <li @click="changeLayerSelect('firstGuideLine', 10)">第一道防线(云中雨)</li>
            <li @click="changeLayerSelect('secondGuideLine', 80)">第二道防线(落地雨)</li>
            <li @click="changeLayerSelect('thirdGuideLine', 140)">第三道防线(水位水文)</li>
            <li @click="changeLayerSelect('floodRisk', 210)">洪涝风险</li>
            <li @click="changeLayerSelect('videoMonitor', 240)">视频监控</li>
            <li @click="changeLayerSelect('extraLayer', 280)">更多图层</li>
        </ul>
        <div class="layerSelect" ref="layerSelect">
            <template v-for="(items, groupName) in layerGroup">
                <el-checkbox v-show="whoShowsLayerSelect === groupName" v-for="item in items" :key="item.label"
                    :label="item.label" :value="item.value" v-model="item.flag"
                    @change="handleLayerSelect($event, item)" style="margin: 0 10px;">
                    {{ item.label }}
                </el-checkbox></template>
        </div>
    </div>
</template>

<script>
export default {
    name: 'layerControl',
    components: {},
    props: {},
    data() {
        return {
            whoShowsLayerSelect: '',
            layerGroup: {
                firstGuideLine: [
                    {
                        value: 'radarImage',
                        label: "雷达图像",
                        flag: false,
                    },
                    {
                        value: 'rainfallForecast',
                        label: "降雨预报",
                        flag: false,
                    },
                    {
                        value: 'typhoonTrack',
                        label: "台风路径",
                        flag: false,
                    },
                    {
                        value: 'cloudImage',
                        label: "卫星云图",
                        flag: false,
                    },
                ],
                secondGuideLine: [
                    {
                        value: 'rainMonitor',
                        label: "降雨监测",
                        flag: false,
                    },
                    // {
                    //     value: 'thunder',
                    //     label: "闪电定位",
                    //     flag: false,
                    // },

                ],
                thirdGuideLine: [
                    {
                        value: 'waterLogging',
                        label: "积涝点水位",
                        flag: true,
                    },
                ],
                floodRisk: [
                    {
                        value: 'floodRisk',
                        label: "洪涝风险",
                        flag: false,
                    },
                ],
                videoMonitor: [
                    {
                        value: 'videoMonitor',
                        label: "视频监控",
                        flag: false,
                    },
                ],
                extraLayer: [
                    {
                        value: 'pipe',
                        label: "管网数据",
                        flag: true,
                    },
                    {
                        value: 'tilesetModel',
                        label: "CIM平台",
                        flag: false,
                    },
                    {
                        value: 'tilesetModelAccuracy',
                        label: "高精度倾斜摄影",
                        flag: false,
                    },
                    {
                        value: 'vehicle',
                        label: '车辆定位',
                        flag: true,
                    },
                    {
                        value: 'floodAnalysis',
                        label: "淹没分析",
                        flag: true,
                    }
                ]
            }
        }
    },
    watch: {},
    computed: {

    },
    created() { },
    mounted() { },
    methods: {
        changeLayerSelect(val, top) {
            if (this.whoShowsLayerSelect == val) {
                this.whoShowsLayerSelect = '';
            } else {
                this.whoShowsLayerSelect = val;
                this.$refs.layerSelect.style.top = top ? top + 'px' : '0px';
            }
        },
        handleLayerSelect(isSelected, data) {
            console.log(isSelected, data);
            if (isSelected) {
                this.$bus.emit("addMapLayer", {
                    val: data.value,
                    label: data.label
                });
                this.$bus.emit("addMapDetail", {
                    value: data.value,
                    label: data.label
                });
            } else {
                this.$bus.emit("removeMapLayer", {
                    val: data.value,
                    label: data.label
                });
                this.$bus.emit("removeMapDetail", data.value);
            }

        },
    }
}
</script>
<style lang="scss" scoped>
.panelContainer {
    position: absolute;
    z-index: 100;
    // top: 10px;
    // left: 10px;

    ul {
        list-style: none;
        margin: 0;
        padding: 0;
        width: 100px;
        text-align: center;
        // border: 1px solid rgba(45, 137, 194, 0.8);
        // background: #FFF;
           background: rgba(29, 55, 60, 0.65);
        color:#FFF;
        border-radius: 10px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: center;

        li {
            margin: 2px 0;
            padding: 10px;
            // font-weight: 600;
            user-select: none;

            &:hover {
                background: rgba(45, 137, 194, 0.8);
                cursor: pointer;
            }
        }
    }

    .layerSelect {
        position: absolute;
        top: 0;
        left: 102px;
       background: rgba(0, 0, 0, 0.5);
        color:#FFF;
        display: flex;
        height: 40px;
        justify-content: space-around;
        align-items: center;

        ::v-deep .el-checkbox__label {
            color: #FFF !important;
        }
    }
}
</style>