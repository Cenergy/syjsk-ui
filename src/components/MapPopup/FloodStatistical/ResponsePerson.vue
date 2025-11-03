<template>
  <el-descriptions title="三个责任人" :column="3" border class="dark">
    <template slot="extra">
      <el-button type="primary" size="mini">发送短信</el-button>
    </template>
     <el-descriptions-item :span="3">
      <el-row>
        <el-col :span="6"><strong>姓名</strong></el-col>
        <el-col :span="10"><strong>职务</strong></el-col>
        <el-col :span="8"><strong>电话</strong></el-col>
      </el-row>

    </el-descriptions-item>
    <!-- 行政责任人 -->
    <el-descriptions-item label="行政责任人" :span="3">
      <el-row>
        <el-col :span="6">{{ baseInfo.xzrfzr }}</el-col>
        <el-col :span="10">{{ baseInfo.xzrfzrzw }}</el-col>
        <el-col :span="8">{{ baseInfo.xzrfzrdh }}</el-col>
      </el-row>
    </el-descriptions-item>
    <!-- 技术负责人 -->
    <el-descriptions-item label="技术负责人" :span="3">
      <el-row>
        <el-col :span="6">{{ baseInfo.jsfzr }}</el-col>
        <el-col :span="10" style="max-width: 75%; word-wrap: break-word;">{{ baseInfo.jsfzrzw }}</el-col>
        <el-col :span="8">{{ baseInfo.jsfzrdh }}</el-col>
      </el-row>
    </el-descriptions-item>
    <!-- 巡查负责人 -->
    <el-descriptions-item label="巡查负责人" :span="3">
      <el-row>
        <el-col :span="6">{{ baseInfo.xczrr }}</el-col>
        <el-col :span="10">{{ baseInfo.xczrrzw }}</el-col>
        <el-col :span="8">{{ baseInfo.xczrrdh }}</el-col>
      </el-row>
    </el-descriptions-item>
  </el-descriptions>
</template>

<script>
export default {
  inject: ["baseInfo"],
  data() {
    return {

    }
  }
};
</script>

<style scoped>
</style>
