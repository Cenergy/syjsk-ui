<template>
    <div style="max-height: 500px; overflow: auto;">
        <el-descriptions
        :column="2"
        border
        class="dark">
            <el-descriptions-item label="水库编码">{{ baseInfo.stcd }}</el-descriptions-item>
            <el-descriptions-item label="水库名称">{{ baseInfo.skmc }}</el-descriptions-item>
            <el-descriptions-item label="水库地址">{{ baseInfo.szdd }}</el-descriptions-item>
            <el-descriptions-item label="所属街道">{{ baseInfo.ssjd }}</el-descriptions-item>
            <el-descriptions-item label="所属社区名称">{{ baseInfo.sssqmn }}</el-descriptions-item>
            <el-descriptions-item label="管理机构">{{ baseInfo.gldw }}</el-descriptions-item>
            <el-descriptions-item label="行政区域">{{ baseInfo.ssq }}</el-descriptions-item>
            <el-descriptions-item label="所属流域">{{ baseInfo.ssly }}</el-descriptions-item>
            <el-descriptions-item label="下泄河道">{{ baseInfo.xxsx }}</el-descriptions-item>
            <el-descriptions-item label="影响社区">{{ baseInfo.yxqy }}</el-descriptions-item>
            <el-descriptions-item label="下泄前河道水位(m)">{{ baseInfo.xxsxsw }}</el-descriptions-item>
            <el-descriptions-item label="下泄后河道水位(m)">{{ baseInfo.xxsxsw }}</el-descriptions-item>
            <el-descriptions-item label="水库简介">{{ baseInfo.skgk }}</el-descriptions-item>
            <el-descriptions-item label="建成时间">{{ baseInfo.jcrq }}</el-descriptions-item>
            <el-descriptions-item label="水库目前功能">{{ baseInfo.skgn }}</el-descriptions-item>
            <el-descriptions-item label="集雨面积(km²)">{{ baseInfo.jymj }}</el-descriptions-item>
            <el-descriptions-item label="校核洪水位(m)">{{ baseInfo.jhhsw }}</el-descriptions-item>
            <el-descriptions-item label="设计洪水位(m)">{{ baseInfo.sjhhsw }}</el-descriptions-item>
            <el-descriptions-item label="正常蓄水位(m)">{{ baseInfo.zcxsw }}</el-descriptions-item>
            <el-descriptions-item label="防汛水位(m)">{{ baseInfo.fxsw }}</el-descriptions-item>
            <el-descriptions-item label="死水位(m)">{{ baseInfo.ssw }}</el-descriptions-item>
            <el-descriptions-item label="总库容(万m³)">{{ baseInfo.zkr }}</el-descriptions-item>
            <el-descriptions-item label="正常库容(万m³)">{{ baseInfo.zckr }}</el-descriptions-item>
            <el-descriptions-item label="调洪库容(万m³)">{{ baseInfo.thkr }}</el-descriptions-item>
            <el-descriptions-item label="兴利库容(万m³)">{{ baseInfo.xlkr }}</el-descriptions-item>
            <el-descriptions-item label="死库容(万m³)">{{ baseInfo.skr }}</el-descriptions-item>
            <el-descriptions-item label="是否降级">{{ baseInfo.sfjj }}</el-descriptions-item>
            <el-descriptions-item label="径流系数">{{ baseInfo.jlxs }}</el-descriptions-item>
            <el-descriptions-item label="库径比">{{ baseInfo.kjb }}</el-descriptions-item>
            <el-descriptions-item label="库容系数">{{ baseInfo.krxs }}</el-descriptions-item>
            <el-descriptions-item label="水库等级">{{ baseInfo.skdj }}</el-descriptions-item>
            <el-descriptions-item label="工程等级">{{ baseInfo.gcdj }}</el-descriptions-item>
            <el-descriptions-item label="最大建筑物级别">{{ baseInfo.jzjb }}</el-descriptions-item>
            <el-descriptions-item label="最大坝高(米)">{{ baseInfo.zdbg }}</el-descriptions-item>
            <el-descriptions-item label="坝长(米)">{{ baseInfo.skbc }}</el-descriptions-item>
            <el-descriptions-item label="坝宽(米)">{{ baseInfo.skbk }}</el-descriptions-item>
            <el-descriptions-item label="排洪下游水系">{{ baseInfo.xxsx }}</el-descriptions-item>
            <el-descriptions-item label="正常蓄水位水域面积(km²)">{{ baseInfo.zcxsmj }}</el-descriptions-item>
            <el-descriptions-item label="防浪墙顶高程">{{ baseInfo.flqgc }}</el-descriptions-item>
            <el-descriptions-item label="溢洪道净宽">{{ baseInfo.yhdjk }}</el-descriptions-item>
            <el-descriptions-item label="校核洪水频率溢洪道最大泄量(m³/s)">{{ baseInfo.jhhsplxhl }}</el-descriptions-item>
            <el-descriptions-item label="大坝类型">{{ baseInfo.skdblx }}</el-descriptions-item>
            <el-descriptions-item label="水库大坝注册登记号">{{ baseInfo.skdbdkh }}</el-descriptions-item>
            <el-descriptions-item label="最近一次安全鉴定时间">{{ baseInfo.zjaqjdsj }}</el-descriptions-item>
            <el-descriptions-item label="备注">{{ baseInfo.rm }}</el-descriptions-item>
            <el-descriptions-item label="水库-河道示意图">{{ baseInfo.skgk }}</el-descriptions-item>
        </el-descriptions>
    </div>
</template>
<script>
export default {
  inject: ["baseInfo"],
};
</script>
<style scoped></style>
