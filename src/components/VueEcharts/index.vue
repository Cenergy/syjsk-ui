<template>
<div ref="chartRef" @resize="onResize"></div>
</template>
<script>
import * as echarts from 'echarts'

export default {
    props: {
        option: {
            type: Object,
            default() {
                return {}
            }
        }
    },
    data() {
        return {
            chartId: null
        }
    },
    methods: {
        getChart() {
            // if (window.chartPool === undefined) {
            //     chartPool = new Map()
            //     window.chartPool = chartPool
            // }
            const chartPool = window.chartPool
            const chartId = this.chartId
            return chartPool.get(chartId)
        },
        draw() {
            const chart = this.getChart()
            if(chart !== null) {
                chart.setOption(this.option)
            }
        },
        onResize() {
            const chart = this.getChart()
            if(chart !== null) {
                chart.resize()
            }
        }
    },
    watch: {
        option: {
            handler() {
                this.draw()
            },
            deep: true
        }
    },
    mounted() {
        if(window.chartPool === undefined) {
            window.chartPool = new Map()
        }
        const chartPool = window.chartPool
        const chart = echarts.init(this.$refs.chartRef)
        const chartId = chart.getId()
        this.chartId = chartId
        chartPool.set(chartId, chart)
        if(this.option) {
            this.draw()
        }
    },
    beforeDestroy() {
        const chart = this.getChart()
        const chartId = this.chartId
        chart.dispose()
        chartPool.delete(chartId)
    }
}
</script>
<style scoped>

</style>