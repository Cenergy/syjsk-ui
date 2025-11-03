<template>
    <div v-show="!noData" ref="chartWrapperRef" style="position: relative;">
        <!-- <span style="float: right;">日降雨量:{{ this.drp }}mm</span> -->
        <div
            ref="chartRef"
            :style="{ height }"
        ></div>
    </div>
    </template>
    <script>
    import * as echarts from 'echarts'
    import { listPipepressH,Pipepressdamlist } from "@/api/gmfx/pipepressH";
    
    export default {
        props: {
            dbcode: {
                type: String,
                required: true
            },
            dmmc: {
                type: String,
                required: true
            },
            date: {
                type: String,
                required: true
            },
            height: {
                type: String,
                default: '220px'
            },            
            textColor: {
                type: String,
                default: 'white'
            }
        },
        data() {
            return {
                chart: null,
                rz: null,
                drp: null,
                sygData: [],
                sySecData: [],
                psgData: {
                    x: 0,
                    y: 0
                },
                noData: false
            }
        },
        methods: {
            getData() {
                const target = this.$refs.chartWrapperRef
                const loadingInstance = this.$loading({
                    target,
                    background: 'transparent'
                });
                return Pipepressdamlist(this.dbcode, this.dmmc, this.date)
                    .then(res => {
                        this.rz = res.rz
                        // this.drp = res.drp
                        this.sygData = res.sygData
                        this.sySecData = res.dbxzData
                        this.psgData = res.psgData
                        this.draw()
                        this.$nextTick(() => { // 以服务的方式调用的 Loading 需要异步关闭
                            loadingInstance.close();
                        });
                    })
            },
            draw() {
                if(this.sySecData.length === 0
                    || this.sygData.length === 0
                ) {
                    this.noData = true
                    return undefined
                }
                this.chart.resize()
                // 断面数据
                const dmData = []
                // 管底高程
                const sygGdData = []
                // 渗压管水位
                const sygRzData = []
                // 管底到管口
                const sygGkData = []
                const textColor = this.textColor 
                let minY = 1000
                let maxX = 0
                let topY = 0
                let topX = 0
                this.sySecData.forEach((item, idx) => {
                    if(topY < item.y) {
                        topY = item.y
                        topX = item.x
                    }
                    maxX = Math.max(item.x, maxX)
                    minY = Math.min(item.y, minY)
                    dmData.push([item.x, item.y])
                })
                const jrxData = [
                    [0, this.rz],
                    [3000, this.rz]
                ]
                dmData.push(dmData[0])
                this.sygData.forEach(item => {
                    sygGdData.push([item.qdjl, item.gdgc])
                    jrxData.push([item.qdjl, parseFloat(item.z ?? item.gdgc).toFixed(2)])
                    sygRzData.push({
                        value: [item.qdjl, item.z],
                        label: {
                            formatter: item.stcd,
                        },
                        itemStyle: {
                            color: this.transparentBottom('#fff', (item.gdgc - minY) / item.gkgc)
                        }
                    })
                    sygGkData.push({
                        value: [item.qdjl, item.gkgc],
                        label: {
                            formatter: item.stcd,
                        },
                        itemStyle: {
                            color: this.transparentBottom('#fff', (item.gdgc - minY) / item.gkgc)
                        }
                    })
                })
                jrxData.push([this.psgData.x, parseFloat(this.psgData.y).toFixed(2)])
                const rzData = [
                    [0, this.rz],
                    [topX, this.rz]
                ]
                const option = {
                    animation: false,
                    title: {
                        text: `${this.dmmc}`,
                        left: 'center',
                        textStyle: {
                            color: textColor
                        }
                    },
                    grid: {
                        containLabel: true,
                        top: 40,
                        left: 0,
                        right: 10,
                        bottom: 0
                    },
                    tooltip: {},
                    xAxis: {
                        type: 'value',
                        max: maxX.toFixed(2),
                        min: 0,
                        splitLine: {
                            show: false
                        }
                    },
                    yAxis: {
                        name: "高程(m)",
                        type: 'value',
                        max: val => val.max,
                        min: minY.toFixed(2),
                        axisTick: {
                            show: true,
                            lineStyle: {
                                type: [10, 30],
                                dashOffset: 5
                            }
                        },
                        splitLine: {
                            show: false,
                        },
                        z: 10
                    },
                    series: [
                        {
                            name: "坝体",
                            data: dmData,
                            type: 'line',
                            color: '#fff',
                            itemStyle: {
                                opacity: 0
                            },
                            areaStyle: {
                                color: '#fff',
                                opacity: 1
                            },
                            silent: true,
                            z: 0
                        },
                        {
                            name: "水",
                            data: rzData,
                            type: 'line',
                            color: '#016098',
                            itemStyle: {
                                opacity: 0
                            },
                            endLabel: {
                                show: true,
                                offset: [-100, -10],
                                formatter: `水位:${this.rz}m`,
                                color: textColor
                            },
                            areaStyle: {
                                color: '#016098',
                                opacity: 0.5
                            },
                            silent: true,
                            z: 1
                        },
                        {
                            name: "测压管",
                            type: 'bar',
                            data: sygGkData,
                            barWidth: 5,
                            label: {
                                show: true,
                                position: 'top',
                                color: textColor
                            },
                            z: 2
                        },
                        {
                            barGap: '-110%',
                            name: "测压管水位",
                            type: 'bar',
                            data: sygRzData,
                            barWidth: 6,
                            z: 3
                        },
                        // {
                        //     barGap: '-110%',
                        //     name: "测压管高程",
                        //     type: 'bar',
                        //     data: sygGdData,
                        //     color: '#00000000',
                        //     barWidth: 7,
                        //     silent: true,
                        //     z: 4
                        // },
                        {
                            name: "浸润线",
                            data: jrxData,
                            type: 'line',
                            color: 'blue',
                            connectNulls: true,
                            lineStyle: {
                                type: 'dashed'
                            },
                            label: {
                                show: true,
                                color: '#000'
                            },
                            endLabel: {
                                show: true,
                                // offset: [-200, 0],
                                formatter: `浸润线`,
                                color: textColor
                            },
                            z: 5
                        },
                    ],
                    textStyle: {
                        color: textColor
                    }
                };
                this.chart.setOption(option)
            },
            transparentBottom(color, precent) {
                return {
                    type: 'linear',
                    x: 0,
                    y: 1,
                    x2: 0,
                    y2: 0,
                    colorStops: [
                        {
                            offset: 0, color: '#00000000'
                        },
                        {
                            offset: precent, color: '#00000000'
                        },
                        {
                            offset: precent + 0.01, color
                        },
                        {
                            offset: 1, color
                        }
                    ]
                }
            }
        },
        watch: {
            dmmc: {
                handler(value) {
                    if(value) {
                        this.getData()
                    }
                },
                immediate: true
            },
            date: {
                handler(value) {
                    if(value) {
                        this.getData()
                    }
                }
            },
        },
        mounted() {
            this.chart = echarts.init(this.$refs.chartRef)
        }
    }
    </script>
    <style scoped></style>