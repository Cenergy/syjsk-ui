<template>
    <el-drawer :visible.sync="isOpen" :modal="false" :wrapper-closable="false" size="35vw" custom-class="dark-drawer"
        @close="handleClose">
        <template #title>
            <div style="border-left: 3px solid #6ba3fd; padding-left: 10px;">
                <strong style="color: #FFF;">{{ data.PRJID }}</strong>
            </div>
        </template>
        <div style="padding: 0 10px;">
            <el-descriptions :column="2" border class="dark-description">
                <el-descriptions-item label="项目编号">{{ data.Prj_No }}</el-descriptions-item>
                <el-descriptions-item label="项目名称">{{ data.Prj_Name }}</el-descriptions-item>
                <!-- <el-descriptions-item label="排水管道唯一编号">{{ data.Lno }}</el-descriptions-item> -->

                <!-- 管道级别信息 -->
                <!-- <el-descriptions-item label="管道级别">{{ data.Grade }}</el-descriptions-item> -->
                <el-descriptions-item label="管线种类">{{ data.Type }}</el-descriptions-item>
                <el-descriptions-item label="对象编码">{{ data.OBJECTID }}</el-descriptions-item>

                <!-- 起点信息 -->
                <el-descriptions-item label="起点管线点号">{{ data.SDH }}</el-descriptions-item>
                <el-descriptions-item label="起点管线埋深">{{ data.S_Deep }}</el-descriptions-item>
                <el-descriptions-item label="起点管内底标高">{{ data.In_Elev }}</el-descriptions-item>

                <!-- 终点信息 -->
                <el-descriptions-item label="终点管线点号">{{ data.E_Point }}</el-descriptions-item>
                <el-descriptions-item label="终点管线埋深">{{ data.E_Deep }}</el-descriptions-item>
                <el-descriptions-item label="终点管内底标高">{{ data.Out_Elev }}</el-descriptions-item>

                <!-- 分区信息 -->
                <el-descriptions-item label="所在污水分区">{{ data.SewageSystem_ID }}</el-descriptions-item>
                <el-descriptions-item label="所在雨水分区">{{ data.StormSystem_ID }}</el-descriptions-item>

                <!-- 特殊属性 -->
                <el-descriptions-item label="压力类型">{{ data.Pressure_Type }}</el-descriptions-item>
                <el-descriptions-item label="是否倒虹管">{{ data.Invert_Silphon }}</el-descriptions-item>
                <el-descriptions-item label="材质">{{ data.Material }}</el-descriptions-item>
            </el-descriptions>
        </div>
    </el-drawer>
</template>
<script>
import CircleRadioGroup from '@/components/CircleRadioGroup'

export default {
    props: {
        visible: {
            type: Boolean,
            default: false
        }
    },
    components: {
        CircleRadioGroup
    },
    data() {
        return {
            isOpen: false,
            data: {}
        }
    },
    methods: {
        onOpen(prop) {
            this.isOpen = true
            this.data = prop
            // this.id = id
            // this.$bus.emit("switchLeftCol", false)
        },
        handleClose() {
            this.data = {}
            // this.$bus.emit("switchLeftCol", true)
        }
    },
    watch: {
        visible(val) {
            this.isOpen = val
        }
    },
    created() {
        this.$bus.on("openPipeDetail", this.onOpen)
    },
    beforeDestroy() {
        this.$bus.off("openPipeDetail", this.onOpen)
    }
}
</script>
<style scoped></style>