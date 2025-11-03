<template>
  <dark-card title="第三道防线(水库水位)" style="height: 100%;width: 100%;">
    <template #icon>
      <img src="@/assets/icons/png/partTitleIcon.png" alt="" />
    </template> 
    <!-- 基本信息统计 -->
    <div class="basic-info-section">
      <div class="section-title">基本信息统计</div>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-label">淹没面积(km²)</div>
          <div class="stat-value">{{ basicInfo.rainArea }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">淹没民用地面积(万m²)</div>
          <div class="stat-value">{{ basicInfo.civilLandArea }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">淹没民房个数(个)</div>
          <div class="stat-value">{{ basicInfo.civilHouseCount }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">淹没耕地面积(公顷)</div>
          <div class="stat-value">{{ basicInfo.farmlandArea }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">受影响公路长度(km)</div>
          <div class="stat-value">{{ basicInfo.roadLength }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">受影响铁路长度(km)</div>
          <div class="stat-value">{{ basicInfo.railwayLength }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">受影响景点数(个)</div>
          <div class="stat-value">{{ basicInfo.scenicSpotCount }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">受影响人口(人)</div>
          <div class="stat-value">{{ basicInfo.affectedPopulation }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">受影响GDP(万元)</div>
          <div class="stat-value">{{ basicInfo.affectedGDP }}</div>
        </div>
      </div>
    </div>

    <!-- 分区淹没统计 -->
    <!-- <div class="district-rain-section">
      <div class="section-title">分区淹没统计</div>
      <div class="table-container">
        <table class="rain-table">
          <thead>
            <tr>
              <th>全称</th>
              <th>淹没面积(km²)</th>
              <th>淹没民用地(km²)</th>
              <th>淹没民房(km²)</th>
              <th>淹没耕地(km²)</th>
              <th>负责人</th>
              <th>联系电话</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in districtRainData" :key="index">
              <td>{{ item.fullName }}</td>
              <td>{{ item.rainArea }}</td>
              <td>{{ item.civilLand }}</td>
              <td>{{ item.civilHouse }}</td>
              <td>{{ item.farmland }}</td>
              <td>{{ item.manager }}</td>
              <td>{{ item.phone }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <!-- <Sksw
      :code="'dam001'"
      :RZ="125.5"
      :FXSW="130.0"
      :SSW="120.0"
      :BDGC="135.0"
      :JHHSW="132.0"
      :SJHHSW="131.0"
    /> -->
  </dark-card>
</template>
<script>
import Sksw from "./Sksw.vue";

export default {
  components: {
    Sksw,
  },
  data() {
    return {
      // 基本信息统计数据
      basicInfo: {
        rainArea: 42.03,
        civilLandArea: 686.44,
        civilHouseCount: 36159,
        farmlandArea: 195.21,
        roadLength: 477.88,
        railwayLength: 9.58,
        scenicSpotCount: 1440,
        affectedPopulation: 577533,
        affectedGDP: 5607480.75,
      },
      // 分区淹没统计数据
      districtRainData: [
        {
          fullName: "营前镇",
          rainArea: 42.03,
          civilLand: 20.03,
          civilHouse: 20.0,
          farmland: 195.21,
          manager: "张三",
          phone: "13800138001",
        },
        {
          fullName: "过埠镇",
          rainArea: 42.03,
          civilLand: 20.03,
          civilHouse: 20.0,
          farmland: 195.21,
          manager: "李四",
          phone: "13800138002",
        },
        {
          fullName: "水岩乡",
          rainArea: 42.03,
          civilLand: 20.03,
          civilHouse: 20.0,
          farmland: 195.21,
          manager: "王五",
          phone: "13800138003",
        },
      ],
    };
  },
  methods: {},
  mounted() {},
};
</script>
<style scoped>
.basic-info-section {
  margin-bottom: 20px;
}

.section-title {
  background: linear-gradient(90deg, #4a90e2, #357abd);
  color: white;
  padding: 8px 15px;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 15px;
  border-radius: 4px;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.stat-item {
  background: rgba(74, 144, 226, 0.08);
  border: 1px solid rgba(74, 144, 226, 0.2);
  border-radius: 6px;
  padding: 15px 10px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-item:hover {
  background: rgba(74, 144, 226, 0.15);
  border-color: rgba(74, 144, 226, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.2);
}

.stat-label {
  color: #666666;
  font-size: 13px;
  margin-bottom: 8px;
  line-height: 1.4;
  font-weight: 500;
}

.stat-value {
  color: #2c3e50;
  font-size: 20px;
  font-weight: bold;
  text-shadow: none;
}

.district-rain-section {
  margin-top: 20px;
}

.table-container {
  background: rgba(248, 249, 250, 0.8);
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(74, 144, 226, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.rain-table {
  width: 100%;
  border-collapse: collapse;
  color: #2c3e50;
}

.rain-table th {
  background: linear-gradient(90deg, #4a90e2, #357abd);
  color: white;
  padding: 12px 8px;
  font-size: 13px;
  font-weight: bold;
  text-align: center;
  border-right: 1px solid rgba(255, 255, 255, 0.3);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.rain-table th:last-child {
  border-right: none;
}

.rain-table td {
  padding: 10px 8px;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  border-bottom: 1px solid rgba(74, 144, 226, 0.15);
  border-right: 1px solid rgba(74, 144, 226, 0.15);
  color: #2c3e50;
  background: rgba(255, 255, 255, 0.6);
}

.rain-table td:last-child {
  border-right: none;
}

.rain-table tbody tr:hover {
  background: rgba(74, 144, 226, 0.1);
}

.rain-table tbody tr:hover td {
  background: rgba(74, 144, 226, 0.1);
}

.rain-table tbody tr:last-child td {
  border-bottom: none;
}
</style>
