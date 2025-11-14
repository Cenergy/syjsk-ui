<template>
  <div class="stat-container">
    <el-table :data="tableData" style="width: 100%" height="580" border>
      <el-table-column prop="name" label="典型水位"></el-table-column>
      <el-table-column
        v-for="(value, key) in mockData"
        :key="key"
        :prop="key"
        :label="key"
      ></el-table-column>
    </el-table>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { genDataInfo,data } from "./mockData";
import { constant } from "@/map";
const { EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT, MODEL_3DTILES_INFO_LIST } = constant;

export default {
  name: "EffectAll",
  watch: {
    selectedWaterLevelList(newValue, oldValue) {
      const newMockData = {};
      newValue.forEach((item) => {
        console.log("🚀 ~ item:", item);
        const effectWaterLevel = EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT.find(
          (i) => i.label === item
        );
        newMockData[item] = genDataInfo(effectWaterLevel.id);
      });
      console.log("🚀 ~ newMockData:", newMockData);
      this.mockData = newMockData;
      this.$forceUpdate();
    },
  },
  data() {
    return {
      statisticalItems: [
        { key: "inundationArea", name: "淹没面积(km²)" },
        { key: "submergedCivilLandArea", name: "淹没民用地面积(万m²)" },
        { key: "submergedCivilHousingCount", name: "淹没民房个数(个)" },
        { key: "submergedArableLandArea", name: "淹没耕地面积(公顷)" },
        { key: "affectedRoadLength", name: "受影响公路长度(km)" },
        { key: "affectedRailwayLength", name: "受影响铁路长度(km)" },
        { key: "affectedScenicSpotCount", name: "受影响景点数(个)" },
        { key: "affectedPopulation", name: "受影响人口(人)" },
        { key: "affectedGDP", name: "受影响GDP(万元)" },
      ],
      mockData: {},
      selectList: [],
    };
  },
  computed: {
    ...mapGetters(["selectedWaterLevelList"]),
    tableData() {
      return this.statisticalItems.map((item) => {
        const effectWaterLevel = EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT.find(
          (i) => i.label === item
        );
        const row = { name: item.name };
        for (const condition in this.mockData) {
          row[condition] = this.mockData[condition][item.key];
        }
        return row;
      });
    },
  },
  mounted() {
    // this.$bus.on("waterLevelChanged", (value) => {
    const newMockData = {};
    this.selectedWaterLevelList.forEach((item) => {
      const effectWaterLevel = EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT.find(
        (i) => i.label === item
      );
      newMockData[item] = genDataInfo(effectWaterLevel.id);
    });
    this.mockData = newMockData;
    this.$forceUpdate();
    console.log("🚀 ~ this.mockData:", this.mockData);
    // });
  },
};
</script>

<style lang="scss" scoped>
.stat-container {
  padding: 10px;
}
</style>
