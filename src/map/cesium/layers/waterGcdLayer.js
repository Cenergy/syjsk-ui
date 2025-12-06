import BaseLayer from "./baseLayer";

class WaterGcdLayer extends BaseLayer {
  constructor(options = {}) {
    super(options);
    this.dataSource = null;
    this.entities = [];
    this.isVisible = false;
    this.gcdUrl = "/datasets/geojson/gcd.geojson";
  }

  async show(options = {}) {
    const { viewer } = this;
    if (!viewer) return;

    // 若已加载过，直接显示
    if (this.hasLoaded && this.entities.length > 0) {
      this.entities.forEach((entity) => (entity.show = true));
      this.isVisible = true;
      return;
    }

    try {
      // 加载GeoJSON点数据
      const ds = await Cesium.GeoJsonDataSource.load(this.gcdUrl, {
        clampToGround: true,
        markerSize: 12,
        markerColor: Cesium.Color.CYAN,
        stroke: Cesium.Color.CYAN,
        strokeWidth: 1,
        fill: Cesium.Color.CYAN.withAlpha(0.15),
        skipLevelOfDetail: true,
      });

      this.dataSource = ds;
      viewer.dataSources.add(ds);

      const entities = ds.entities.values;
      // 样式化点与标签
      entities.forEach((entity) => {
        if (!entity.position) return;
        const props = entity.properties || {};
        const refName = props.RefName && props.RefName.getValue ? props.RefName.getValue() : "";
        const heightVal = props.height && props.height.getValue ? props.height.getValue() : (props.Elevation && props.Elevation.getValue ? props.Elevation.getValue() : undefined);

        // 点样式
        entity.point = new Cesium.PointGraphics({
          pixelSize: 10,
          color: Cesium.Color.CYAN.withAlpha(0.95),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        });

        // 标签样式
        entity.label = new Cesium.LabelGraphics({
        //   text: heightVal !== undefined ? `${refName || ""} (${heightVal}m)` : `${refName || ""}`,
          text: heightVal+"m",
          font: "14pt Microsoft YaHei, sans-serif",
          fillColor: Cesium.Color.BLACK,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          showBackground: true,
          backgroundColor: Cesium.Color.WHITE.withAlpha(0.9),
          backgroundPadding: new Cesium.Cartesian2(10, 6),
          pixelOffset: new Cesium.Cartesian2(0, -24),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scaleByDistance: new Cesium.NearFarScalar(1000, 1.0, 50000, 0.4),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 40000),
        });

        this.entities.push(entity);
      });

      this.isVisible = true;
      this.hasLoaded = true;
      console.log("水利高程控制点图层加载并显示成功");
    } catch (error) {
      console.error("加载高程控制点图层失败:", error);
    }
  }

  hide() {
    if (!this.entities.length) return;
    this.entities.forEach((entity) => (entity.show = false));
    this.isVisible = false;
  }

  flyToAll() {
    if (this.dataSource && this.viewer) {
      this.viewer.flyTo(this.dataSource);
    }
  }

  destroy() {
    try {
      if (this.dataSource && this.viewer) {
        this.viewer.dataSources.remove(this.dataSource);
      }
      this.dataSource = null;
      this.entities = [];
      this.isVisible = false;
      this.hasLoaded = false;
      console.log("水利高程控制点图层已销毁");
    } catch (error) {
      console.error("销毁水利高程控制点图层失败:", error);
    }
  }
}

export default new WaterGcdLayer();