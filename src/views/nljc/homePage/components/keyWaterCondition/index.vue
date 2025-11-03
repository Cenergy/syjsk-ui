<template>
  <DarkCard title="关键雨情" style="">
    <template #icon>
      <img src="@/assets/icons/png/water.png" alt="">
    </template>
    <template #extra>
      <el-button type="primary" style="width: 100px;
    height: 29px;
    line-height: 10px;">视频轮巡</el-button>
      <el-button type="primary" style="width: 100px;
    height: 29px;
    line-height: 10px;">短信发送</el-button>
    </template>
    <div style="display: flex; justify-content: space-between; padding: 10px 0;">
      <div>
        <el-progress type="dashboard" :percentage="10" :stroke-width="15" color="#2e6598" stroke-linecap="square"
          text-color="#FFF" define-back-color="#FFFFFF10"></el-progress>
        <div style="text-align: center;">水库</div>
      </div>
      <div>
        <el-progress type="dashboard" :percentage="10" :stroke-width="15" color="#2e6598" stroke-linecap="square"
          text-color="#FFF" define-back-color="#FFFFFF10"></el-progress>
        <div style="text-align: center;">河道</div>
      </div>
      <div>
        <el-progress type="dashboard" :percentage="10" :stroke-width="15" color="#2e6598" stroke-linecap="square"
          text-color="#FFF" define-back-color="#FFFFFF10"></el-progress>
        <div style="text-align: center;">积涝点</div>
      </div>
    </div>
  </DarkCard>
</template>

<script>
export default {
  name: 'keyWaterCondition',
  components: {},
  props: {},
  data() {
    return {
    }
  },
  watch: {},
  computed: {},
  created() { },
  mounted() { },
  methods: {},
}
</script>
<style lang="scss" scoped></style>