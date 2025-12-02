import { constant } from "@/map";
import eventBus from "@/utils/EventBus";
import BaseLayer from "./baseLayer";

const { EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT, DEFAULT_WATER_LEVEL_COLOR } = constant;

class WaterLevelLayer extends BaseLayer {
  constructor(options) {
    super(options);
    this.dataSources = new Map();
    // 组装图例项：使用常量中的水位颜色配置
    const items = [
      ...EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT,
    ].map((item) => ({ label: item.label, color: item.color }));
    this.legend = {
      label: "水位影响范围图例",
      items,
    };
  }

  async add(options = {}) {
    console.log("🚀 ~ WaterLevelLayer ~ add ~ options:", options);
    const { id, zIndex = 100,height = 175 } = options;
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
      const response = await fetch(`/geodata/effects/${id}.geojson`);
      const geoJsonData = await response.json();

      const dataSource = await window.Cesium.GeoJsonDataSource.load(
        geoJsonData,
        {
          stroke: window.Cesium.Color.fromCssColorString(
            selectWaterLevelInfo.color
          ),
          fill: window.Cesium.Color.fromCssColorString(
            selectWaterLevelInfo.color
          ).withAlpha(selectWaterLevelInfo.alpha||0.3),
          strokeWidth: 10,
          clampToGround: true,
        }
      );
      const entities = dataSource.entities.values;
      entities.forEach(function (entity) {
        if (entity && entity.polygon) {
          entity.polygon.zIndex = zIndex; // 或者其他数字来调整层级
          // entity.polygon.height = height;
        }
      });

      dataSource.name = `water-level-${id}`;
      dataSource.zIndex = zIndex;
      await this.viewer.dataSources.add(dataSource);
      this.dataSources.set(id, dataSource);
      this.sortDataSourcesByZIndex();

      // 展示图例
      this.setLegend();
    } catch (error) {
      console.error("加载影响范围线数据失败:", error);
    }
  }

  remove(id) {
    if (this.dataSources.has(id)) {
      const dataSource = this.dataSources.get(id);
      this.viewer.dataSources.remove(dataSource, true);
      this.dataSources.delete(id);
      // 若全部移除则关闭图例
      if (this.dataSources.size === 0) {
        this.delLegend();
      }
    }
  }

  removeAll() {
    for (const id of this.dataSources.keys()) {
      this.remove(id);
    }
    // 兜底关闭图例
    this.delLegend();
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

  setLegend() {
    eventBus.emit("setLegend", {
      type: "waterLevel",
      data: this.legend,
    });
  }

  delLegend() {
    eventBus.emit("closeLegend", {
      type: "waterLevel",
      data: this.legend,
    });
  }
}

export default new WaterLevelLayer();
