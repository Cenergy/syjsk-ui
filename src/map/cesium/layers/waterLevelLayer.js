import { constant } from "@/map";
import BaseLayer from "./baseLayer";

const { EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT } = constant;

class WaterLevelLayer extends BaseLayer {
  constructor(options) {
    super(options);
    this.dataSources = new Map();
  }

  async add(id,zIndex=10) {
    if (this.dataSources.has(id)) {
      this.show(id);
      return;
    }

    const selectWaterLevelInfo = EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT.find(
      (item) => item.id === id
    );

    if (!selectWaterLevelInfo) {
      return;
    }

    try {
      const response = await fetch(
        `/datasets/effects/营前镇/${id}.geojson`
      );
      const geoJsonData = await response.json();

      const dataSource = await window.Cesium.GeoJsonDataSource.load(
        geoJsonData,
        {
          stroke: window.Cesium.Color.fromCssColorString(
            selectWaterLevelInfo.color
          ),
          fill: window.Cesium.Color.fromCssColorString(
            selectWaterLevelInfo.color
          ).withAlpha(0.2),
          strokeWidth: 10,
          clampToGround: true,
        }
      );

      dataSource.name = `water-level-${id}`;
      dataSource.zIndex = zIndex;
      await this.viewer.dataSources.add(dataSource);
      this.dataSources.set(id, dataSource);
      this.viewer.dataSources._dataSources.sort((a, b) => a.zIndex - b.zIndex);
    } catch (error) {
      console.error("加载影响范围线数据失败:", error);
    }
  }

  remove(id) {
    if (this.dataSources.has(id)) {
      const dataSource = this.dataSources.get(id);
      this.viewer.dataSources.remove(dataSource, true);
      this.dataSources.delete(id);
    }
  }

  removeAll() {
    for (const id of this.dataSources.keys()) {
      this.remove(id);
    }
  }

  show(id) {
    if (this.dataSources.has(id)) {
      const dataSource = this.dataSources.get(id);
      dataSource.show = true;
    }
  }

  hide(id) {
    if (this.dataSources.has(id)) {
      const dataSource = this.dataSources.get(id);
      dataSource.show = false;
    }
  }
}

export default new WaterLevelLayer();
