import { constant } from "@/map";
import BaseLayer from "./baseLayer";

const { EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT, DEFAULT_WATER_LEVEL_COLOR } = constant;

class WaterLevelLayer extends BaseLayer {
  constructor(options) {
    super(options);
    this.dataSources = new Map();
  }

  async add(id, zIndex = 100) {
    if (this.dataSources.has(id)) {
      this.show(id);
      return;
    }

    const selectWaterLevelInfo = [DEFAULT_WATER_LEVEL_COLOR, ...EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT].find(
      (item) => item.id === id
    );

    if (!selectWaterLevelInfo) {
      return;
    }

    try {
      const response = await fetch(`/datasets/effects/${id}.geojson`);
      const geoJsonData = await response.json();

      const dataSource = await window.Cesium.GeoJsonDataSource.load(
        geoJsonData,
        {
          stroke: window.Cesium.Color.fromCssColorString(
            selectWaterLevelInfo.color
          ),
          fill: window.Cesium.Color.fromCssColorString(
            selectWaterLevelInfo.color
          ).withAlpha(0.8),
          strokeWidth: 10,
          clampToGround: true,
        }
      );
      const entities = dataSource.entities.values;
      entities.forEach(function (entity) {
        if (entity && entity.polygon) {
          entity.polygon.zIndex = zIndex; // 或者其他数字来调整层级
        }
      });

      dataSource.name = `water-level-${id}`;
      dataSource.zIndex = zIndex;
      await this.viewer.dataSources.add(dataSource);
      this.dataSources.set(id, dataSource);
      this.sortDataSourcesByZIndex();
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

  sortDataSourcesByZIndex() {
    const sortedDataSources = Array.from(this.dataSources.values()).sort(
      (a, b) => (a.zIndex || 0) - (b.zIndex || 0)
    );
    sortedDataSources.forEach((dataSource) => {
      this.viewer.dataSources.raiseToTop(dataSource);
    });
  }
}

export default new WaterLevelLayer();
