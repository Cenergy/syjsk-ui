<template>
</template>
<script>
import { getWaterLoggingPointBaseInfo } from "@/api/nljc/index.js"

export default {
    inject: ["setTitle"],
    props: {
        id: {
            type: [String, Number],
            default: ''
        }
    },
    data() {
        return {
            baseInfo: {}
        }
    },
    methods: {
        getBaseData() {
            getWaterLoggingPointBaseInfo(this.id)
            .then(res => {
                if (res.data.length === 0) {
                    return undefined
                }
                this.baseInfo = res.data[0]
                this.setTitle(this.baseInfo.name)
            })
        },
        reset() {
            this.baseInfo = {}
        }
    },
    watch: {
        id: {
            handler() {
                if (this.id) {
                    this.getBaseData()
                }
            },
            immediate: true
        }
    }
}
</script>
<style scoped></style>