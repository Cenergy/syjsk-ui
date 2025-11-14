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
    this.viewer.scene.globe.depthTestAgainstTerrain = true;

    try {
      const response = await fetch(
        `/datasets/effects/${id}.geojson`
      );
      const geoJsonData = await response.json();

      const dataSource = await window.Cesium.GeoJsonDataSource.load(geoJsonData, {
        stroke: window.Cesium.Color.fromCssColorString(
          selectWaterLevelInfo.color
        ),
        fill: window.Cesium.Color.fromCssColorString(
          selectWaterLevelInfo.color
        ).withAlpha(0.2),
        strokeWidth: 10,
      });

      dataSource.name = `water-level-${id}`;
      dataSource.zIndex = zIndex;
      await this.viewer.dataSources.add(dataSource);

      // 确保贴地
      const entities = dataSource.entities.values;
      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        if (entity.polygon) {
          const polygonHierarchy = entity.polygon.hierarchy.getValue();
          const color = window.Cesium.Color.fromCssColorString(
            selectWaterLevelInfo.color
          );

          // --- Create Fill Primitive ---
          const fillGeometry = new window.Cesium.PolygonGeometry({
            polygonHierarchy: polygonHierarchy,
            perPositionHeight: false,
          });
          const fillInstance = new window.Cesium.GeometryInstance({
            geometry: fillGeometry,
            attributes: {
              color: window.Cesium.ColorGeometryInstanceAttribute.fromColor(
                color.withAlpha(0.2)
              ),
            },
          });
          const fillPrimitive = new window.Cesium.GroundPrimitive({
            geometryInstances: [fillInstance],
            appearance: new window.Cesium.PerInstanceColorAppearance({
              translucent: true,
              flat: true,
            }),
          });
          this.viewer.scene.primitives.add(fillPrimitive);
          this.dataSources.set(`${id}-fill-primitive`, fillPrimitive);

          // --- Create Stroke Primitive ---
          const strokeGeometry = new window.Cesium.GroundPolylineGeometry({
            positions: polygonHierarchy.positions,
            width: 2,
          });
          const strokeInstance = new window.Cesium.GeometryInstance({
            geometry: strokeGeometry,
            attributes: {
              color: window.Cesium.ColorGeometryInstanceAttribute.fromColor(color),
            },
          });
          const strokePrimitive = new window.Cesium.GroundPolylinePrimitive({
            geometryInstances: [strokeInstance],
            appearance: new window.Cesium.PolylineColorAppearance(),
          });
          this.viewer.scene.primitives.add(strokePrimitive);
          this.dataSources.set(`${id}-stroke-primitive`, strokePrimitive);

          // Hide the original entity
          entity.show = false;
        }
        if (entity.polyline) {
          entity.polyline.clampToGround = true;
        }
      }

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
    const fillKey = `${id}-fill-primitive`;
    if (this.dataSources.has(fillKey)) {
      const primitive = this.dataSources.get(fillKey);
      this.viewer.scene.primitives.remove(primitive);
      this.dataSources.delete(fillKey);
    }
    const strokeKey = `${id}-stroke-primitive`;
    if (this.dataSources.has(strokeKey)) {
      const primitive = this.dataSources.get(strokeKey);
      this.viewer.scene.primitives.remove(primitive);
      this.dataSources.delete(strokeKey);
    }
  }

  removeAll() {
    const ids = new Set(
      [...this.dataSources.keys()].map((k) =>
        k.replace("-fill-primitive", "").replace("-stroke-primitive", "")
      )
    );
    for (const id of ids) {
      this.remove(id);
    }
  }

  show(id) {
    if (this.dataSources.has(id)) {
      this.dataSources.get(id).show = true;
    }
    const fillKey = `${id}-fill-primitive`;
    if (this.dataSources.has(fillKey)) {
      this.dataSources.get(fillKey).show = true;
    }
    const strokeKey = `${id}-stroke-primitive`;
    if (this.dataSources.has(strokeKey)) {
      this.dataSources.get(strokeKey).show = true;
    }
  }

  hide(id) {
    if (this.dataSources.has(id)) {
      this.dataSources.get(id).show = false;
    }
    const fillKey = `${id}-fill-primitive`;
    if (this.dataSources.has(fillKey)) {
      this.dataSources.get(fillKey).show = false;
    }
    const strokeKey = `${id}-stroke-primitive`;
    if (this.dataSources.has(strokeKey)) {
      this.dataSources.get(strokeKey).show = false;
    }
  }
}

export default new WaterLevelLayer();
