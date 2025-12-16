<template>
  <div class="description">
    <p>总结：{{ descriptionText }}</p>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { tables } from "@/components/MapPopup/FloodStatistical/mockData";
import { constant } from "@/map";
const {
  EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT,
  MODEL_3DTILES_AREA_LIST,
  getAreaNameFromChildren,
} = constant;

export default {
  name: "FloodSummary",
  props: {
    areaName: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      currentAreaName: "",
    };
  },
  computed: {
    ...mapGetters(["selectedWaterLevelList"]),
    descriptionText() {
      const effectiveAreaName = this.areaName || this.currentAreaName;
      const labels = (this.selectedWaterLevelList && this.selectedWaterLevelList.length)
        ? this.selectedWaterLevelList
        : EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT.map((i) => i.label);

      const pickMaxCfg = () => {
        const cfgList = labels
          .map((label) => EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT.find((i) => i.label === label))
          .filter(Boolean);
        if (cfgList.length === 0) {
          return EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT
            .slice()
            .sort((a, b) => Number(b.value) - Number(a.value))[0];
        }
        return cfgList.slice().sort((a, b) => Number(b.value) - Number(a.value))[0];
      };

      const cfg = pickMaxCfg();
      const targetLabel = cfg ? cfg.label : labels[0];
      const aggKey = (() => {
        if (!cfg) return targetLabel;
        const n = Number(cfg.value);
        return Number.isFinite(n) ? n.toFixed(1) : String(cfg.value);
      })();

      let totalRoad = 0;
      let totalHouses = 0;
      let totalArea = 0;
      let totalArable = 0;
      const breakdown = [];

      if (effectiveAreaName) {
        const childNames = getAreaNameFromChildren(effectiveAreaName) || [];
        const tableNameList = childNames.length ? childNames : [effectiveAreaName];
        tableNameList.forEach((name) => {
          const rows = (tables && tables.get(name)) || [];
          const row = rows.find((r) => String(r[0]) === String(aggKey));
          if (!row) return;
          const road = Number(row[1]) || 0;
          const houses = Number(row[2]) || 0;
          const area = Number(row[3]) || 0;
          const arable = Number(row[5]) || 0;
          totalRoad += road;
          totalHouses += houses;
          totalArea += area;
          totalArable += arable;
          breakdown.push(`${name}${houses}栋`);
        });
        const breakdownText = breakdown.length ? `（分村：${breakdown.join("，")}）` : "";
        const levelText = (cfg && cfg.name) ? cfg.name : `${aggKey}米`;
        return `当前水位：${levelText}，影响民房${this.formatValue(totalHouses)}栋${breakdownText}，影响范围${this.formatValue(totalArea)}亩，影响耕地${this.formatValue(totalArable)}亩`;
      }

      const areas = MODEL_3DTILES_AREA_LIST || [];
      if (!areas.length) return "暂无数据";
      areas.forEach((area) => {
        const childNames = (area.children || []).map((c) => c.name);
        if (!childNames.length) return;
        const labelName = childNames.find((n) => /[镇乡]$/.test(n)) || area.name;
        let sumRoad = 0;
        let sumHouses = 0;
        let sumArea = 0;
        let sumArable = 0;
        childNames.forEach((name) => {
          const rows = (tables && tables.get(name)) || [];
          const row = rows.find((r) => String(r[0]) === String(aggKey));
          if (!row) return;
          sumRoad += Number(row[1]) || 0;
          sumHouses += Number(row[2]) || 0;
          sumArea += Number(row[3]) || 0;
          sumArable += Number(row[5]) || 0;
        });
        totalRoad += sumRoad;
        totalHouses += sumHouses;
        totalArea += sumArea;
        totalArable += sumArable;
        breakdown.push(`${labelName}${sumHouses}栋`);
      });
      const breakdownText = breakdown.length ? `（分乡镇：${breakdown.join("，")}）` : "";
      const levelText = (cfg && cfg.name) ? cfg.name : `${aggKey}米`;
      return `当前水位：${levelText}，影响民房${this.formatValue(totalHouses)}栋${breakdownText}，影响范围${this.formatValue(totalArea)}亩，影响耕地${this.formatValue(totalArable)}亩`;
    },
  },
  methods: {
    formatValue(val) {
      const num = Number(val);
      if (!Number.isFinite(num)) return "-";
      if (Number.isInteger(num)) return String(Math.trunc(num));
      return parseFloat(num.toFixed(2)).toString();
    },
  },
  mounted() {
    const areas = MODEL_3DTILES_AREA_LIST || [];
    const areaNameList = areas.map((item) => item.name);
    if (this.$bus && typeof this.$bus.on === "function") {
      this.$bus.on("mapLocate", (evt) => {
        const name = evt && evt.data;
        if (areaNameList.includes(name)) {
          this.currentAreaName = name;
        } else {
          this.currentAreaName = "";
        }
      });
    }
  },
};
</script>

<style scoped>
.description {
  margin-top: 8px;
  color: #fff;
}
</style>