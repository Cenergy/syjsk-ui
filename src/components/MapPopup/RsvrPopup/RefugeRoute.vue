<template>
    <el-row>
        <el-col :span="12">
            <el-descriptions
                border
                :column="1"
                :label-style="{ width: `150px` }"
                size="medium"
                class="dark"
            >
                <el-descriptions-item label="所属水库">{{ baseInfo.skmc }}</el-descriptions-item>
                <el-descriptions-item label="转移路线 1"></el-descriptions-item>
                <el-descriptions-item label="转移安置点"></el-descriptions-item>
            </el-descriptions>
        </el-col>
        <el-col :span="12">
            <el-image
            :src="routeSrc"></el-image>
        </el-col>
    </el-row>
</template>
<script>
export default {
    inject: [
        "getStcd",
        "baseInfo"
    ],
    data() {
        return {

        }
    },
    computed: {
        routeSrc() {
            const stcd = this.getStcd()
            return `/map/images/ShuiKuYanMo/ZongLanTu/${stcd}.png`
        }
    }
}
</script>
<style scoped></style>