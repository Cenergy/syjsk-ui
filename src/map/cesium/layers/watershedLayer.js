import eventBus from "@/utils/EventBus";
import BaseLayer from "./baseLayer";

class WatershedLayer extends BaseLayer {
  constructor(options) {
    super(options);
    this.watershedEntities = []; // 流域实体
    this.dataSource = null; // 数据源
  }

  async show() {
    const { viewer } = this;
    console.log("🚀 ~ WatershedLayer ~ show ~ viewer:", viewer);

    // 如果已经加载过，则直接显示
    if (this.hasLoaded && this.watershedEntities.length > 0) {
      this.watershedEntities.forEach((entity) => (entity.show = true));
      return;
    }

    // 加载流域数据
    await this.loadWatershedData(viewer);
    this.hasLoaded = true;
  }

  async loadWatershedData(viewer) {
    try {
      // 加载流域GeoJSON数据
      const watershedDataSource = await Cesium.GeoJsonDataSource.load(
        "/datasets/geojson/liuyu.geojson",
        {
          stroke: Cesium.Color.BLUE.withAlpha(0.8),
          strokeWidth: 3,
          fill: Cesium.Color.BLUE.withAlpha(0.2),
          clampToGround: true,
          skipLevelOfDetail: true,
        }
      );

      this.dataSource = watershedDataSource;
      viewer.dataSources.add(watershedDataSource);
      this.watershedEntities = watershedDataSource.entities.values;
    } catch (error) {
      console.error("加载流域数据失败:", error);
      eventBus.$emit('watershedLayerError', error);
    }
  }

  hide() {
    // 隐藏所有流域实体
    this.watershedEntities.forEach((entity) => (entity.show = false));
  }
  // 设置流域样式
  setStyle(options = {}) {
    const {
      fillColor = Cesium.Color.BLUE.withAlpha(0.2),
      outlineColor = Cesium.Color.BLUE.withAlpha(0.8),
      outlineWidth = 3
    } = options;

    this.watershedEntities.forEach((entity) => {
      if (entity.polygon) {
        entity.polygon.material = new Cesium.ColorMaterialProperty(fillColor);
        entity.polygon.outlineColor = outlineColor;
        entity.polygon.outlineWidth = outlineWidth;
      }
    });
  }

  // 飞行到流域范围
  flyToWatershed() {
    if (this.dataSource && this.viewer) {
      this.viewer.flyTo(this.dataSource);
    }
  }

  // 获取图层信息
  getLayerInfo() {
    return {
      name: "流域图层",
      entityCount: this.watershedEntities.length,
      hasLoaded: this.hasLoaded,
      dataSource: this.dataSource
    };
  }

  // 销毁图层
  destroy() {
    if (this.dataSource && this.viewer) {
      this.viewer.dataSources.remove(this.dataSource);
    }
    this.watershedEntities = [];
    this.dataSource = null;
    this.hasLoaded = false;
  }
}

export default new WatershedLayer();