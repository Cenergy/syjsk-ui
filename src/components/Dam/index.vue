<template>
    <div class="dam-wrapper">
        <div class="dam-scale"></div>
        <div
            ref="damRef"
            class="dam"
        ></div>
        <div class="dam-wall"></div>
    </div>
</template>
<script>
import * as echarts from 'echarts'

let chart = null
export default {
    props: {
        lines: {
            type: Array,
            default: () => []
        },
        value: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {

        }
    },
    watch: {
        value: {
            handler() {
                this.$nextTick(this.draw)
            },
            immediate: true,
            deep: true
        },
        lines: {
            handler() {
                this.$nextTick(this.draw)
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
        draw() {
            console.log(this.lines)
            const value = this.value
            const maxtop = Math.max(...this.lines.map(item => item.value)) + 2; 
            const series = this.lines.map(item => ({
                name: item.label,
                data: [[0, item.value], [100, item.value]],
                endLabel: {
                    show: true,
                    color: item.color,
                    formatter: item.top !== undefined && item.top < 0 ? `▼ ${item.label}:${item.value}m` : `▲ ${item.label}:${item.value}m`,
                    border: false,
                    distance: 0,
                    offset: [item.left, item.top !== undefined ? item.top : 10]
                },
                color: item.color,
                type: 'line'
            }))
            series.push({
                name: "当前水位",
                type: 'line',
                data: [[0, value], [100, value]],
                areaStyle: {},
                color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                        offset: 0, color: '#cbf0ff' // 0% 处的颜色
                    }, {
                        offset: 1, color: '#69aee9' // 100% 处的颜色
                    }],
                },
                endLabel: {
                    show: true,
                    color: 'white',
                    offset: [-220, -10],
                    formatter: `▼ 当前水位:${value}m`,
                }
            })
            const option = {
                grid: {
                    top: 10,
                    bottom: 0,
                    left: 20,
                    right: 20
                },
                xAxis: {
                    type: 'value',
                    show: false,
                },
                yAxis: {
                    type: 'value',
                    axisLabel: {
                        margin: 1,
                        inside: true,
                        fontSize: 16
                    },
                    axisTick: {
                        show: false,
                    },
                    axisLine: {
                        show: false,
                    },
                    splitLine: {
                        show: false,
                    },
                    max: Math.ceil(maxtop),
                    min: (value - 2).toFixed(2)
                },
                textStyle: {
                    fontSize: 15,
                    color: 'white'
                },
                series
            }
            // console.log(JSON.stringify(option))
            chart.resize()
            chart.setOption(option)
        }
    },
    mounted() {
        chart = echarts.init(this.$refs.damRef)
        // this.draw()
    }
}
</script>
<style scoped>
.dam-wrapper {
    position: relative;
    display: flex;
    align-items: flex-end;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.dam-scale {
    position: absolute;
    top: 0;
    left: 0;
    width: 20px;
    height: 100%;
    background-image: url(../../assets/map/scale.png);
}

.dam {
    width: 100%;
    height: 100%;
}

.dam-wall {
    position: absolute;
    top: 0;
    right: 0;
    width: 120px;
    height: 100%;
    background-image: url(../../assets/map/dam.png);
    background-size: 100% 100%;
}
</style>