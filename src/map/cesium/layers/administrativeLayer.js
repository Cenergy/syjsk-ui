import eventBus from "@/utils/EventBus";
import BaseLayer from "./baseLayer";

class AdministrativeLayer extends BaseLayer {
  constructor(options) {
    super(options);
    this.countyEntities = []; // 县级实体
    this.townshipEntities = []; // 乡镇级实体
    this.showCountyLevel = true; // 是否显示县级
    this.showTownshipLevel = true; // 是否显示乡镇级
  }

  async show() {
    const { viewer } = this;

    // 如果已经加载过，则直接显示
    if (this.hasLoaded && (this.countyEntities.length > 0 || this.townshipEntities.length > 0)) {
      this.countyEntities.forEach((entity) => (entity.show = this.showCountyLevel));
      this.townshipEntities.forEach((entity) => (entity.show = this.showTownshipLevel));
      return;
    }

    // 加载县级数据
    if (this.showCountyLevel) {
      await this.loadCountyData(viewer);
    }

    // 加载乡镇级数据
    if (this.showTownshipLevel) {
      await this.loadTownshipData(viewer);
    }

    this.hasLoaded = true;
  }

  async loadCountyData(viewer) {
    try {
      // 加载县级GeoJSON数据
      const countyDataSource = await Cesium.GeoJsonDataSource.load(
        "/geodata/geojson/shangyou.geojson",
        {
          stroke: Cesium.Color.ORANGE.withAlpha(1.0),
          strokeWidth: 10,
          fill: Cesium.Color.ORANGE.withAlpha(0.15),
          clampToGround: true,
          skipLevelOfDetail: true,
        }
      );

      // 处理县级实体
      countyDataSource.entities.values.forEach((entity) => {
        console.log("🚀 ~ AdministrativeLayer ~ loadCountyData ~ entity:", entity);
        if (entity.polygon) {
          // 设置县级样式 - 使用橙色系，更醒目
          entity.polygon.material = new Cesium.ColorMaterialProperty(
            Cesium.Color.ORANGE.withAlpha(0.15)
          );
          entity.polygon.outline = true;
          entity.polygon.outlineColor = Cesium.Color.ORANGE.withAlpha(1.0);
          entity.polygon.outlineWidth = 15;
          entity.polygon.height = 0;
          entity.polygon.extrudedHeight = 0;

          // 添加县级标签 - 更大更醒目
          if (entity.properties && entity.properties.县) {
            const countyName = entity.properties.县.getValue();
            entity.label = new Cesium.LabelGraphics({
              text: countyName,
              font: "20pt Microsoft YaHei, sans-serif",
              fillColor: Cesium.Color.ORANGE,
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 4,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              pixelOffset: new Cesium.Cartesian2(0, 0),
              showBackground: true,
              backgroundColor: Cesium.Color.BLACK.withAlpha(0.8),
              backgroundPadding: new Cesium.Cartesian2(12, 8),
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: Cesium.VerticalOrigin.CENTER,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              show: true,
              scale: 1.1
            });
          }

          this.countyEntities.push(entity);
        }
      });

      viewer.dataSources.add(countyDataSource);
    } catch (error) {
      console.error("加载县级数据失败:", error);
    }
  }

  async loadTownshipData(viewer) {
    try {
      // 加载乡镇级GeoJSON数据
      const townshipDataSource = await Cesium.GeoJsonDataSource.load(
        "/geodata/geojson/shangyouxiangzhen.geojson",
        {
          stroke: Cesium.Color.CYAN.withAlpha(0.8),
          strokeWidth: 2,
          fill: Cesium.Color.CYAN.withAlpha(0.08),
          clampToGround: true,
          skipLevelOfDetail: true,
        }
      );

      // 处理乡镇级实体
      townshipDataSource.entities.values.forEach((entity) => {
        if (entity.polygon) {
          // 设置乡镇级样式 - 使用青色系，与县级区分
          entity.polygon.material = new Cesium.ColorMaterialProperty(
            Cesium.Color.CYAN.withAlpha(0.08)
          );
          entity.polygon.outline = true;
          entity.polygon.outlineColor = Cesium.Color.CYAN.withAlpha(0.8);
          entity.polygon.outlineWidth = 2;
          entity.polygon.height = 0;
          entity.polygon.extrudedHeight = 0;

          // 添加乡镇级标签 - 稍小一些，与县级区分
          if (entity.properties && entity.properties.乡) {
            const townshipName = entity.properties.乡.getValue();
            entity.label = new Cesium.LabelGraphics({
              text: townshipName,
              font: "14pt Microsoft YaHei, sans-serif",
              fillColor: Cesium.Color.CYAN,
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 2,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              pixelOffset: new Cesium.Cartesian2(0, 0),
              showBackground: true,
              backgroundColor: Cesium.Color.BLACK.withAlpha(0.6),
              backgroundPadding: new Cesium.Cartesian2(8, 4),
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: Cesium.VerticalOrigin.CENTER,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              show: true,
              scale: 0.9
            });
          }

          this.townshipEntities.push(entity);
        }
      });

      viewer.dataSources.add(townshipDataSource);
    } catch (error) {
      console.error("加载乡镇级数据失败:", error);
    }
  }

  hide() {
    // 隐藏所有行政区划实体
    this.countyEntities.forEach((entity) => (entity.show = false));
    this.townshipEntities.forEach((entity) => (entity.show = false));
  }

  // 控制县级显示/隐藏
  setCountyVisible(visible) {
    this.showCountyLevel = visible;
    this.countyEntities.forEach((entity) => (entity.show = visible));
  }

  // 控制乡镇级显示/隐藏
  setTownshipVisible(visible) {
    this.showTownshipLevel = visible;
    this.townshipEntities.forEach((entity) => (entity.show = visible));
  }

  // 获取图层信息
  getLayerInfo() {
    return {
      name: "行政区划图层",
      countyCount: this.countyEntities.length,
      townshipCount: this.townshipEntities.length,
      showCountyLevel: this.showCountyLevel,
      showTownshipLevel: this.showTownshipLevel
    };
  }
}

export default new AdministrativeLayer();