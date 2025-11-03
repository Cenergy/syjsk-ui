import eventBus from "@/utils/EventBus";
import BaseLayer from "./baseLayer";

/**
 * 区域边界图层类
 * 用于显示GeoJSON格式的区域边界数据
 */
class BoundaryLayer extends BaseLayer {
  constructor(options) {
    super(options);
    this.dataSource = null;
    this.entities = [];
    this.geoJsonUrl = options?.geoJsonUrl || "/datasets/geojson/fwx.geojson";
    this.config = {
      // 边界线样式配置
      stroke: {
        color: Cesium.Color.PURPLE,//紫色
        width: 8,//加粗
        alpha: 1
      },
      // 填充样式配置
      fill: {
        color: Cesium.Color.TRANSPARENT,
        alpha: 0.0
      },
      // 标签样式配置
      label: {
        font: "bold 24pt Microsoft YaHei",
        fillColor: Cesium.Color.BLACK,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 3,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        backgroundColor: Cesium.Color.fromCssColorString('rgba(255, 255, 255, 0.9)'),
        backgroundPadding: new Cesium.Cartesian2(12, 8),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        scaleByDistance: new Cesium.NearFarScalar(1000, 1.0, 50000, 0.5),
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      }
    };
  }

  /**
   * 强制应用边界线样式
   */
  applyBoundaryStyles() {
    if (!this.dataSource) return;

    const entities = this.dataSource.entities.values;
    entities.forEach(entity => {
      if (entity.polygon) {
        // 设置填充为透明
        entity.polygon.material = this.config.fill.color;
        // 禁用原始边界线，我们将使用polyline来创建粗边界线
        entity.polygon.outline = false;
        // 设置高度，使边界线显示在3D Tiles上方
        entity.polygon.height = 50; // 设置50米高度
        entity.polygon.extrudedHeight = 50; // 拉伸高度也设为50米
        // 禁用深度测试，确保边界线始终可见
        entity.polygon.disableDepthTestDistance = Number.POSITIVE_INFINITY;
        // 设置高度参考为相对地面
        entity.polygon.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
        
        // 创建粗边界线 - 使用polyline实体
        this.createThickBoundaryLine(entity);
      }
    });
  }

  /**
   * 为polygon实体创建粗边界线
   */
  createThickBoundaryLine(polygonEntity) {
    if (!polygonEntity.polygon || !polygonEntity.polygon.hierarchy) return;

    const hierarchy = polygonEntity.polygon.hierarchy.getValue();
    if (!hierarchy || !hierarchy.positions) return;

    // 获取polygon的边界点
    const positions = hierarchy.positions;
    
    // 创建闭合的边界线（添加第一个点到末尾形成闭合）
    const boundaryPositions = [...positions, positions[0]];
    
    // 使用原始位置，让Cesium自动贴地并略微提升
    const groundPositions = boundaryPositions.map(position => {
      const cartographic = Cesium.Cartographic.fromCartesian(position);
      return Cesium.Cartesian3.fromRadians(
        cartographic.longitude,
        cartographic.latitude,
        cartographic.height + 5 // 只提升5米，贴着地形或3D Tiles略微高一点
      );
    });

    // 创建polyline实体用于显示粗边界线
    const boundaryLineEntity = this.dataSource.entities.add({
      name: `${polygonEntity.name || 'boundary'}_line`,
      polyline: {
        positions: groundPositions,
        width: this.config.stroke.width, // 使用配置的宽度
        material: this.config.stroke.color, // 使用配置的颜色
        clampToGround: true, // 启用贴地模式
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 贴着地面
        disableDepthTestDistance: Number.POSITIVE_INFINITY, // 确保始终可见
        zIndex: 1000, // 设置较高的z-index确保在上层显示
        // 添加更多深度控制属性
        classificationType: Cesium.ClassificationType.BOTH, // 在地形和3D Tiles上都显示
        depthFailMaterial: this.config.stroke.color, // 深度测试失败时也显示相同颜色
        arcType: Cesium.ArcType.GEODESIC // 使用测地线弧类型
      }
    });

    // 将边界线实体关联到原polygon实体，便于管理
    if (!polygonEntity.boundaryLines) {
      polygonEntity.boundaryLines = [];
    }
    polygonEntity.boundaryLines.push(boundaryLineEntity);
  }

  /**
   * 显示区域边界图层
   */
  async show(options = {}) {
    if (this.dataSource) {
      this.dataSource.show = true;
      return;
    }

    try {
      // 创建数据源
      this.dataSource = new Cesium.GeoJsonDataSource();
      
      // 加载GeoJSON数据
      await this.dataSource.load(this.geoJsonUrl, {
        stroke: this.config.stroke.color,
        strokeWidth: this.config.stroke.width,
        fill: this.config.fill.color,
        clampToGround: false // 改为false，允许设置高度
      });

      // 添加到地图
      this.viewer.dataSources.add(this.dataSource);

      // 强制应用边界线样式
      this.applyBoundaryStyles();

      // 为每个区域添加标签
      // this.addLabelsToFeatures();

      this._hasLoaded = true;
      console.log("区域边界图层加载成功");
    } catch (error) {
      console.error("区域边界图层加载失败:", error);
    }
  }

  /**
   * 为GeoJSON要素添加标签
   */
  addLabelsToFeatures() {
    const entities = this.dataSource.entities.values;
    
    entities.forEach(entity => {
      // 获取RefName属性
      const refName = entity.properties?.RefName?.getValue();
      if (!refName) return;

      // 计算多边形中心点
      const center = this.calculatePolygonCenter(entity);
      if (!center) return;

      // 将中心点提升到合适的高度
      const cartographic = Cesium.Cartographic.fromCartesian(center);
      const elevatedPosition = Cesium.Cartesian3.fromRadians(
        cartographic.longitude,
        cartographic.latitude,
        cartographic.height + 60 // 标签高度比边界线高10米
      );

      // 创建标签实体
      const labelEntity = this.dataSource.entities.add({
        position: elevatedPosition,
        label: {
          text: refName,
          font: this.config.label.font,
          fillColor: this.config.label.fillColor,
          outlineColor: this.config.label.outlineColor,
          outlineWidth: this.config.label.outlineWidth,
          style: this.config.label.style,
          backgroundColor: this.config.label.backgroundColor,
          backgroundPadding: this.config.label.backgroundPadding,
          heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
          scaleByDistance: this.config.label.scaleByDistance,
          disableDepthTestDistance: this.config.label.disableDepthTestDistance,
          pixelOffset: new Cesium.Cartesian2(0, -20)
        }
      });

      this.entities.push(labelEntity);
    });
  }

  /**
   * 计算多边形的中心点
   * @param {Cesium.Entity} entity 多边形实体
   * @returns {Cesium.Cartesian3} 中心点坐标
   */
  calculatePolygonCenter(entity) {
    try {
      // 获取多边形的坐标
      const hierarchy = entity.polygon?.hierarchy?.getValue();
      if (!hierarchy) return null;

      let positions = [];
      
      // 处理不同类型的坐标层次结构
      if (hierarchy instanceof Cesium.PolygonHierarchy) {
        positions = hierarchy.positions;
      } else if (Array.isArray(hierarchy)) {
        positions = hierarchy;
      }

      if (positions.length === 0) return null;

      // 计算所有点的平均位置
      let totalX = 0, totalY = 0, totalZ = 0;
      positions.forEach(position => {
        totalX += position.x;
        totalY += position.y;
        totalZ += position.z;
      });

      const centerX = totalX / positions.length;
      const centerY = totalY / positions.length;
      const centerZ = totalZ / positions.length;

      return new Cesium.Cartesian3(centerX, centerY, centerZ);
    } catch (error) {
      console.error("计算多边形中心点失败:", error);
      return null;
    }
  }

  /**
   * 隐藏区域边界图层
   */
  hide() {
    if (this.dataSource) {
      this.dataSource.show = false;
    }
  }

  /**
   * 飞行到指定区域
   * @param {String} refName 区域名称
   */
  flyToRegion(refName) {
    if (!this.dataSource) return;

    const entities = this.dataSource.entities.values;
    const targetEntity = entities.find(entity => 
      entity.properties?.RefName?.getValue() === refName
    );

    if (targetEntity) {
      this.viewer.flyTo(targetEntity, {
        duration: 2.0,
        offset: new Cesium.HeadingPitchRange(0, -Math.PI / 4, 5000)
      });
    }
  }

  /**
   * 获取所有区域信息
   * @returns {Array} 区域信息数组
   */
  getAllRegions() {
    if (!this.dataSource) return [];

    const entities = this.dataSource.entities.values;
    return entities
      .filter(entity => entity.properties?.RefName)
      .map(entity => ({
        refName: entity.properties.RefName.getValue(),
        objectId: entity.properties.OBJECTID?.getValue(),
        entity: entity
      }));
  }

  /**
   * 更新边界样式
   * @param {Object} styleConfig 样式配置
   */
  updateStyle(styleConfig) {
    if (!this.dataSource) return;

    // 更新配置
    Object.assign(this.config, styleConfig);

    // 应用新样式到所有实体
    const entities = this.dataSource.entities.values;
    entities.forEach(entity => {
      if (entity.polygon) {
        entity.polygon.material = this.config.fill.color;
        entity.polygon.outline = true;
        entity.polygon.outlineColor = this.config.stroke.color;
        entity.polygon.outlineWidth = this.config.stroke.width;
      }
    });
  }

  /**
   * 检查图层是否显示
   * @returns {Boolean} 是否显示
   */
  isShown() {
    return this.dataSource ? this.dataSource.show : false;
  }

  /**
   * 销毁图层
   */
  destroy() {
    if (this.dataSource) {
      this.viewer.dataSources.remove(this.dataSource);
      this.dataSource = null;
    }
    this.entities = [];
    this._hasLoaded = false;
  }
}

export default new BoundaryLayer();