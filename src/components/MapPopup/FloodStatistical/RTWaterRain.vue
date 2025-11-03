<template>
    <div>
        <el-row :gutter="10">
            <el-col :span="12">
                <div style="max-height: 400px; overflow: auto;">
                    <el-descriptions border :column="2" class="dark">
                        <el-descriptions-item label="当前水位">{{ data.rz }}m</el-descriptions-item>
                        <el-descriptions-item label="当前库容">{{ data.dqkr }}万m³</el-descriptions-item>
                        <el-descriptions-item label="监测时间" span="2">{{ data.dt }}</el-descriptions-item>
                        <el-descriptions-item label="预测水位(未来1小时)" span="2">{{ data.future1HourRz }}m</el-descriptions-item>
                        <el-descriptions-item label="预测降雨(未来1小时)" span="2">{{ data.future1HourRain }}mm</el-descriptions-item>
                        <el-descriptions-item label="预测水位(未来3小时)" span="2">{{ data.future3HourRz }}m</el-descriptions-item>
                        <el-descriptions-item label="预测降雨(未来3小时)" span="2">{{ data.future3HourRain }}mm</el-descriptions-item>
                        <el-descriptions-item label="预测降雨(mm)" span="2">
                            <div style="display: flex;">
                                <el-input v-model="drp" class="dark"></el-input>
                                <el-button :loading="loading" type="dark" @click="handleCalc">计算</el-button>
                            </div>
                        </el-descriptions-item>
                        <el-descriptions-item label="预测水位" span="2">{{ data.futureRz }}m</el-descriptions-item>
                        <el-descriptions-item label="汛限水位" span="2">{{ data.fxsw }}m</el-descriptions-item>
                        <el-descriptions-item label="设计洪水位" span="2">{{ data.sjhhsw }}m</el-descriptions-item>
                        <el-descriptions-item label="水位状态" span="2">
                            <span :style="{ color: isOver ? 'yellow' : '' }">{{ data.flag }}</span>
                        </el-descriptions-item>
                        <el-descriptions-item label="距汛限水位" span="2">{{ data.outRz }}m</el-descriptions-item>
                        <el-descriptions-item label="距设计洪水位" span="2">{{ data.outSjhhsw }}m</el-descriptions-item>
                        <el-descriptions-item label="校核洪水位" span="2">{{ data.jhhsw }}m</el-descriptions-item>
                        <el-descriptions-item label="死水位" span="2">{{ data.ssw }}m</el-descriptions-item>
                        <el-descriptions-item label="总库容" span="2">{{ data.zkr }}万m³</el-descriptions-item>
                        <el-descriptions-item label="溢洪道型式" span="2">{{ data.yhdxs }}</el-descriptions-item>
                        <el-descriptions-item label="溢洪道堰顶高程" span="2">{{ data.fxsw }}m</el-descriptions-item>
                    </el-descriptions>
                </div>
            </el-col>
            <el-col :span="12">
                <Dam
                    :key="updateKey" 
                    :value="data.rz"
                    :lines="lines"
                    style="width: 100%; height: 400px;"
                />
            </el-col>
        </el-row>
        <!-- <EmergencyResGuide lx="水库" /> -->
    </div>
</template>

<script>
import DarkRadio from '@/components/DarkRadio';
import Dam from '@/components/Dam';
import EmergencyResGuide from '@/components/EmergencyResGuide';

import { getRtWaterRainInfo, calculateRsvrRz } from "@/api/map/reservoir";
import { numFormat } from "@/utils/format"

export default {
    components: {
        DarkRadio,
        Dam,
        EmergencyResGuide
    },
    inject: ['getStcd'],
    data() {
        return {
            loading: false,
            drp: '',
            updateKey: 0,  // 新增的 data 属性
            futureRz:0,
            data: {
                "code": "",
                "skmc": "",
                "jymj": 0,
                "jhhsw": 0,
                "sjhhsw": 0,
                "zcxsw": 0,
                "fxsw": 0,
                "ssw": 0,
                "zkr": 0,
                "zckr": 0,
                "thkr": 0,
                "xlkr": 0,
                "skr": 0,
                "yhdxs": null,
                "future1HourRz": 0,
                "future1HourRain": 0,
                "future3HourRz": 0,
                "future3HourRain": 0,
                "future6HourRz": 0,
                "future6HourRain": 0,
                "futureRz": 0,
                "flag": "",
                "rz": 0,
                "dqkr": 0,
                "outRz": 0,
                "outSjhhsw": 0,
                "dt": ""                
            }
        };
    },
    computed: {
        isOver() {
            return this.data.outRz < 0
        },
        lines() {
            return [
                {
                    value: this.data.jhhsw,
                    label: '校核洪水位',
                    left: -430,
                    top: -10,
                    color: '#fff100'
                },
                {
                    value: this.data.sjhhsw,
                    label: '设计洪水位',
                    left: -430,
                    color: '#008cd6'
                },
                {
                    value: this.data.fxsw,
                    label: '汛限水位',
                    left: -430,
                    color: '#e60013'
                },
                {
                    value: this.data.ssw,
                    label: '死水位',
                    left: -430,
                    color: '#008000'
                },
                {
                    value: this.futureRz,
                    label: '预测水位',
                    left: -330,
                    color: '#2EA043'
                },
            ]
        },
    },
    methods: {
        getData() {
            const stcd = this.getStcd()
            getRtWaterRainInfo(stcd)
                .then(res => {
                    this.data = res.data
                    this.data.futureRz = 0
                })
        },
        handleCalc() {
            const stcd = this.getStcd()
            const drp = this.drp
            if (stcd && drp) {
                this.loading = true
                calculateRsvrRz(stcd, drp)
                    .then(res => {
                        this.$set(this.data, 'futureRz', res.data.futureRz)
                        this.updateKey += 1;  // 更新 key
                    })
                    .finally(() => {
                        this.futureRz = this.data.futureRz
                        this.loading = false
                    })
            }
        },
        numFormat(num, p) {
            return numFormat(num, p)
        }
    },
    mounted() {
        this.getData();
    }
};
</script>

<style scoped></style>
