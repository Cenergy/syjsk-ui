<template>
    <div class="dark-dashboard-progress-wrap">
        <el-progress
            :width="size"
            :format="formatter"
            :stroke-width="strokeWidth"
            :percentage="precent"
            type="dashboard"
            stroke-linecap="butt"
            text-color="white"
            define-back-color="#4A84BE60"
        ></el-progress>
        <div class="dark-dashboard-progress-subtext">
        <slot>
            {{ subtext }}
        </slot>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        value: {
            type: Number,
            default: 0
        },
        total: {
            type: Number,
            default: 0
        },
        format: {
            type: String,
            default: "{value}"
        },
        size: {
            type: Number,
            default: 120
        },
        strokeWidth: {
            type: Number,
            default: 20
        },
        subtext: {
            type: String,
            default: ''
        }
    },
    computed: {
        precent() {
            if(this.total === 0) {
                return 0
            }
            return this.value / this.total * 100
        }
    },
    methods: {
        formatter() {
            return `${this.value}/${this.total}`
            // return this.format.replace('{value}', this.percentage)
        }
    }
}
</script>
<style scoped>
.dark-dashboard-progress-wrap {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.dark-dashboard-progress-subtext {
    position: absolute;
    font-size: 12px;
    bottom: 0px;
}
</style>