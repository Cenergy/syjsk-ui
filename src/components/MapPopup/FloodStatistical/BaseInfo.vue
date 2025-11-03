<template>
  <el-row>
    <el-col :span="24">
      <el-descriptions
        border
        :column="1"
        :label-style="{ width: `150px` }"
        size="medium"
        class="dark"
      >
        <el-descriptions-item label="水库名称">{{ resInfo.skmc }}</el-descriptions-item>
        <el-descriptions-item label="水库简介">{{ resInfo.skgk }}</el-descriptions-item>
        <el-descriptions-item label="水库特征">
        <div>
          <img :src="cover" style="width: 100%; height: auto;" alt="水库特征" />
        </div>
        </el-descriptions-item>
      </el-descriptions>
    </el-col>
  </el-row>
</template>
<script>
export default {
  inject: ["baseInfo"],
  computed: {
    cover() {
      return require("@/assets/map/res.png");
    },
  },
  data() {
    return {
      resInfo: {
        skmc: "上犹江水库",
        skgk: "上犹江水库位于江西省赣州市上犹县与崇义县交界处陡水镇，是“一五”计划期间156项重点工程之一的大(二)型水库，属以发电为主，兼有防洪、灌溉、航运等功能的综合水利枢纽。水库控制流域面积2750平方公里，总库容8.22亿立方米，正常蓄水位198.4米，坝型为混凝土重力坝，坝高67.5米，是我国首座坝内式厂房水电站。工程于1955年3月动工，1957年11月首台机组投产发电，初始装机容量6万千瓦，后扩容至7.2万千瓦，年均发电量2.9亿度。",
      },
    };
  },
  methods: {},
  created() {},
};
</script>
<style scoped></style>
