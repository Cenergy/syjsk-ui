<template>
    <dark-card title="降雨预测">
        <template #icon>
            <img src="@/assets/icons/png/partTitleIcon.png" alt="">
        </template>
        <VueEcharts :option="option" style="height: 350px;" />
    </dark-card>
</template>
<script>
import { findQxybyl } from "@/api/nljc/index.js"
import { numFormat } from "@/utils/format.js"

import VueEcharts from '@/components/VueEcharts'

export default {
    components: {
        VueEcharts
    },
    data() {
        return {
            sum3h: null,
            sum6h: null,
            sum12h: null,
            sum24h: null,
            xAxis: [],
            data: []
        }
    },
    computed: {
        option() {
            const xAxis = this.xAxis
            const data = this.data
            return {
                title: {
                    text: `未来3小时: {highlight|${numFormat(this.sum3h)}} mm, 6小时: {highlight|${numFormat(this.sum6h)}} mm\n12小时: {highlight|${numFormat(this.sum12h)}} mm, 24小时: {highlight|${numFormat(this.sum24h)}} mm`,
                    left: "center",
                    borderWidth: 1,
                    borderRadius: 8,
                    borderColor: '#87CEFA',
                    backgroundColor: 'rgba(169,169,169, 0.3)',
                    padding: [15, 20],
                    textStyle: {
                        fontSize: 13,
                        color: '#000',
                        rich: {
                            highlight: {
                                color: 'rgba(62, 200, 108, 1)',

                                fontSize: 16,
                            }
                        }
                    },
                },
                grid: {
                    containLabel: true,
                    left: 20,
                    right: 10,
                    bottom: 0,
                },
                tooltip: {
                    trigger: 'axis'
                },
                xAxis: {
                    type: 'category',
                    data: xAxis
                },
                yAxis: {
                    name: "mm",
                    type: 'value'
                },
                series: [
                    {
                        name: "降雨量",
                        data: data,
                        type: 'bar'
                    }
                ],
                textStyle: {
                    color: '#000'
                }
            }
        }
    },
    methods: {
        numFormat,
        getData() {
            this.sum3h = 0
            this.sum6h = 0
            this.sum12 = 0
            this.sum24h = 0
        }
    },
    mounted() {
        this.getData()
    }
}
</script>
<style scoped></style>