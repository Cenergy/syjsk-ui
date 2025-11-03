<template>
  <el-descriptions title="三个责任人" :column="1" border class="dark">
    <template slot="extra">
      <el-button type="primary" size="mini">发送短信</el-button>
    </template>
    <el-descriptions-item label="行政责任人">{{ data.XZRFZR }}</el-descriptions-item>
    <el-descriptions-item label="行政责任人职务">{{ data.XZRFZRZW }}</el-descriptions-item>
    <el-descriptions-item label="行政责任人电话">{{ data.XZRFZRDH }}</el-descriptions-item>
    <el-descriptions-item label="技术负责人">{{ data.JSFZR }}</el-descriptions-item>
    <el-descriptions-item label="技术负责人职务">{{ data.JSFZRZW }}</el-descriptions-item>
    <el-descriptions-item label="技术负责人电话">{{ data.JSFZRDH }}</el-descriptions-item>
    <el-descriptions-item label="巡查负责人">{{ data.XCZRR }}</el-descriptions-item>
    <el-descriptions-item label="巡查负责人职务">{{ data.XCZRRZW }}</el-descriptions-item>
    <el-descriptions-item label="巡查负责人电话">{{ data.XCZRRDH }}</el-descriptions-item>
  </el-descriptions>
</template>
<script>
export default {
  data() {
    return {
      data: {}
    };
  },
  mounted() {
    console.log("🚀 ~ mounted ~ mounted:", this.data);
  }
};
</script>
<style scoped></style>
