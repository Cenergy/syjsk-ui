import eventBus from "@/utils/EventBus";

import BaseLayer from "./baseLayer";

class WaterLayer extends BaseLayer {
  constructor(options) {
    super(options);
    this.waterEntities = [];
    this.waterAnimationCallback = null;
  }

  async createWaterPrimitive(polygonHierarchy,height) {
    // 获取多边形的值，确保是正确的格式
    const hierarchy = polygonHierarchy.getValue ? polygonHierarchy.getValue() : polygonHierarchy;
    console.log("🚀 ~ WaterLayer ~ createWaterPrimitive ~ hierarchy:", hierarchy);
    
    // 获取多边形的边界点
    const positions = hierarchy.positions || hierarchy;
    
    // 对地形进行高度采样，获取平均高度
    let averageHeight = 0;
    if (positions && positions.length > 0) {
      try {
        const samplePositions = positions.slice(0, Math.min(positions.length, 10)); // 取前10个点进行采样
        const promise = Cesium.sampleTerrainMostDetailed(this.viewer.terrainProvider, samplePositions.map(pos => {
          const cartographic = Cesium.Cartographic.fromCartesian(pos);
          return cartographic;
        }));
        
        const sampledPositions = await promise;
        const totalHeight = sampledPositions.reduce((sum, pos) => sum + pos.height, 0);
        averageHeight = totalHeight / sampledPositions.length;
        
        // 稍微降低水面高度，让它看起来更自然
        averageHeight = Math.max(0, averageHeight - 2);
        console.log("🚀 ~ WaterLayer ~ createWaterPrimitive ~ averageHeight:", averageHeight);
      } catch (error) {
        console.warn("地形采样失败，使用默认高度:", error);
        averageHeight = 0;
      }
    }
    
    // 使用GeoJSON中的实际多边形坐标
    const actualPositions = positions;
    
    return new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: new Cesium.PolygonGeometry({
          polygonHierarchy: new Cesium.PolygonHierarchy(actualPositions),
          height: Math.max(0, averageHeight - 1), // 稍微低于地形高度
          extrudedHeight: Math.max(1, averageHeight + 1), // 确保有足够的厚度
          vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
        }),
      }),
      appearance: new Cesium.EllipsoidSurfaceAppearance({
        material: new Cesium.Material({
          fabric: {
            type: "Water",
            uniforms: {
              baseWaterColor: new Cesium.Color(0.2, 0.5, 1.0, 0.8),
              normalMap: "./cesium/Assets/Textures/waterNormals.jpg",
              frequency: 1000.0,
              animationSpeed: 0.01,
              amplitude: 1.0,
              specularIntensity: 0.5,
            },
          },
        }),
        translucent: true,
        renderState: {
          blending: Cesium.BlendingState.ALPHA_BLEND,
          depthTest: {
            enabled: true,
            func: Cesium.DepthFunction.LESS_OR_EQUAL,
          },
          depthMask: false,
        },
      }),
      show: true,
      allowPicking: false,
    });
  }

  async show() {
    const { viewer } = this;
    viewer.scene.globe.depthTestAgainstTerrain = false;
    // 如果已经加载过，则直接显示
    if (this.hasLoaded && this.waterEntities.length > 0) {
      this.waterEntities.forEach((entity) => (entity.show = true));
      return;
    }

    // 加载GeoJSON数据
    const geoJsonDataSource = await Cesium.GeoJsonDataSource.load(
      "/geodata/geojson/shangyoujiangshuiku.geojson",
      {
        stroke: Cesium.Color.BLUE.withAlpha(0.8),
        strokeWidth: 3,
        fill: Cesium.Color.BLUE.withAlpha(0.3),
        clampToGround: true,
        skipLevelOfDetail: true,
      }
    );

    // 添加水面材质
    geoJsonDataSource.entities.values.forEach(async (entity) => {
      if (entity.polygon) {
        let material = new Cesium.ColorMaterialProperty(
          Cesium.Color.SKYBLUE.withAlpha(0.8)
        );
        if (entity.name === "上犹江水库") {
          console.log("🚀 ~ WaterLayer ~ show ~ entity:", entity);
          
          // 创建水面效果
          const water = await this.createWaterPrimitive(entity.polygon.hierarchy);
          viewer.scene.primitives.add(water);
          
          // 隐藏原始多边形，避免重叠
          entity.polygon.show = false;
          
          // 为上犹江水库显示名称标签
          entity.label = new Cesium.LabelGraphics({
            text: entity.name,
            font: "18pt Microsoft YaHei, sans-serif",
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 3,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(0, 0),
            showBackground: true,
            backgroundColor: Cesium.Color.BLUE.withAlpha(0.8),
            backgroundPadding: new Cesium.Cartesian2(10, 6),
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            show: true,
            scale: 1.0,
          });
        } else {
          // 其他水体实体不显示名称标签
          entity.label = undefined;
        }
        // entity.polygon.material = material;
        // this.waterEntities.push(entity);
      }
    });

    viewer.dataSources.add(geoJsonDataSource);
    this.hasLoaded = true;
  }

  hide() {
    // 隐藏所有水体实体
    this.waterEntities.forEach((entity) => (entity.show = false));
  }
}

export default new WaterLayer();
