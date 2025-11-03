import eventBus from "@/utils/EventBus";
import BaseLayer from "./baseLayer";

/**
 * 河流图层类
 * 用于显示GeoJSON格式的河流数据
 */
class RiverLayer extends BaseLayer {
  constructor(options) {
    super(options);
    this.dataSource = null;
    this.entities = [];
    this.geoJsonUrl = options?.geoJsonUrl || "/datasets/geojson/sx1.geojson";
    this.config = {
      // 河流线样式配置
      stroke: {
        color: Cesium.Color.fromCssColorString("#5ed3eb"), // 蓝色河流
        width: 0,
        alpha: 0.7
      },
      // 填充样式配置（如果河流是面要素）
      fill: {
        color: Cesium.Color.fromCssColorString("#5ed3eb"),
        alpha: 0.7
      },
      // 贴地面显示
      clampToGround: true,
      // 层级控制配置
      zoomLevel: {
        minZoom: 10, // 最小显示层级，小于此层级时隐藏
        maxZoom: 20, // 最大显示层级，大于此层级时隐藏
        enabled: true // 是否启用层级控制
      }
    };
    
    // 缩放监听器
    this.zoomListener = null;
    // 当前是否因层级而隐藏
    this.hiddenByZoom = false;
  }

  /**
   * 初始化图层
   * @param {Object} viewer - Cesium viewer实例
   */
  init(viewer) {
    this.viewer = viewer;
    
    // 添加缩放级别监听器
    if (this.config.zoomLevel.enabled) {
      this.setupZoomListener();
    }
  }

  /**
   * 显示河流图层
   */
  async show(options = {}) {
    if (this.dataSource) {
      this.dataSource.show = true;
      // 重置层级隐藏状态，因为这是手动显示
      this.hiddenByZoom = false;
      // 检查当前层级是否应该显示
      if (this.config.zoomLevel.enabled) {
        this.checkZoomLevel();
      }
      return;
    }

    try {
      // 创建数据源
      this.dataSource = new Cesium.GeoJsonDataSource();
      
      // 加载GeoJSON数据 - 使用最简单的贴地配置
      await this.dataSource.load(this.geoJsonUrl, {
        stroke: this.config.stroke.color.withAlpha(this.config.stroke.alpha),
        strokeWidth: this.config.stroke.width,
        fill: this.config.fill.color.withAlpha(this.config.fill.alpha),
        clampToGround: true // 只使用这一个贴地参数
      });

      // 设置数据源名称
      this.dataSource.name = "riverLayer";

      // 添加到地图
      this.viewer.dataSources.add(this.dataSource);

      // 应用河流样式
      this.applyRiverStyles();

      this._hasLoaded = true;
      console.log("河流图层加载成功");
      
      // 检查当前层级是否应该显示 
      if (this.config.zoomLevel.enabled) {
        this.checkZoomLevel();
      }
      
      // 发送事件通知
      eventBus.$emit("riverLayer:shown", {
        dataSource: this.dataSource
      });
    } catch (error) {
      console.error("河流图层加载失败:", error);
      eventBus.$emit("riverLayer:error", error);
    }
  }

  /**
   * 应用河流样式
   */
  applyRiverStyles() {
    if (!this.dataSource) return;

    const entities = this.dataSource.entities.values;
    entities.forEach((entity) => {
      // 处理线要素（河流中心线）
      if (entity.polyline) {
        entity.polyline.material = this.config.stroke.color.withAlpha(this.config.stroke.alpha);
        entity.polyline.width = this.config.stroke.width;
        
        // 最关键的贴地设置 - 只使用这两个属性
        entity.polyline.clampToGround = true;
        entity.polyline.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
        
        // 移除可能冲突的属性，只保留必要的
        entity.polyline.arcType = Cesium.ArcType.GEODESIC;
        
        // 不要手动设置positions的高度，让Cesium自动处理贴地
      }

      // 处理面要素（河流水面）
      if (entity.polygon) {
        entity.polygon.material = this.config.fill.color.withAlpha(this.config.fill.alpha);
        entity.polygon.outline = true;
        entity.polygon.outlineColor = this.config.stroke.color.withAlpha(this.config.stroke.alpha);
        entity.polygon.outlineWidth = this.config.stroke.width;
        
        // 最关键的贴地设置
        entity.polygon.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
        entity.polygon.extrudedHeight = 0;
        
        // 不要手动设置hierarchy的高度，让Cesium自动处理贴地
      }

      // 设置实体属性
      entity.show = true;
    });

    this.entities = entities;
  }

  /**
   * 隐藏河流图层
   */
  hide() {
    if (this.dataSource) {
      this.dataSource.show = false;
    }
    // 重置层级隐藏状态，因为这是手动隐藏
    this.hiddenByZoom = false;
  }

  /**
   * 移除河流图层
   */
  remove() {
    if (this.dataSource && this.viewer) {
      this.viewer.dataSources.remove(this.dataSource);
      this.dataSource = null;
    }
    this.entities = [];
    this._hasLoaded = false;
  }

  /**
   * 飞行到河流范围
   */
  flyToRiver() {
    if (this.dataSource && this.viewer) {
      this.viewer.flyTo(this.dataSource, {
        duration: 2.0
      });
    }
  }

  /**
   * 设置河流颜色
   * @param {Cesium.Color} color - 新的颜色
   */
  setRiverColor(color) {
    this.config.stroke.color = color;
    this.config.fill.color = color;
    this.applyRiverStyles();
  }

  /**
   * 设置河流透明度
   * @param {Number} alpha - 透明度值 (0-1)
   */
  setRiverAlpha(alpha) {
    this.config.stroke.alpha = alpha;
    this.config.fill.alpha = alpha * 0.5; // 填充透明度稍低
    this.applyRiverStyles();
  }

  /**
   * 对河流进行地形采样，确保贴地显示
   * 这个方法会异步采样地形高度并更新河流位置
   */
  async sampleTerrainForRiver() {
    if (!this.dataSource || !this.viewer) return;

    const terrainProvider = this.viewer.terrainProvider;
    if (!terrainProvider) return;

    const entities = this.dataSource.entities.values;
    
    for (const entity of entities) {
      // 处理线要素的地形采样
      if (entity.polyline && entity.polyline.positions) {
        const positions = entity.polyline.positions.getValue();
        if (positions && positions.length > 0) {
          try {
            // 转换为地理坐标
            const cartographics = positions.map(position => 
              Cesium.Cartographic.fromCartesian(position)
            );
            
            // 采样地形高度
            const sampledCartographics = await Cesium.sampleTerrainMostDetailed(
              terrainProvider, 
              cartographics
            );
            
            // 将高度设置为地形高度加上一个小的偏移量（1米），确保河流显示在地形上方
            const groundPositions = sampledCartographics.map(cartographic => {
              return Cesium.Cartesian3.fromRadians(
                cartographic.longitude, 
                cartographic.latitude, 
                cartographic.height + 1.0 // 地形高度 + 1米偏移
              );
            });
            
            entity.polyline.positions = groundPositions;
          } catch (error) {
            console.warn("河流线要素地形采样失败:", error);
            // 如果采样失败，至少确保高度为0
            const groundPositions = positions.map(position => {
              const cartographic = Cesium.Cartographic.fromCartesian(position);
              return Cesium.Cartesian3.fromRadians(
                cartographic.longitude, 
                cartographic.latitude, 
                1.0 // 设置为1米高度
              );
            });
            entity.polyline.positions = groundPositions;
          }
        }
      }
      
      // 处理面要素的地形采样
      if (entity.polygon && entity.polygon.hierarchy) {
        const hierarchy = entity.polygon.hierarchy.getValue();
        if (hierarchy && hierarchy.positions) {
          try {
            // 转换为地理坐标
            const cartographics = hierarchy.positions.map(position => 
              Cesium.Cartographic.fromCartesian(position)
            );
            
            // 采样地形高度
            const sampledCartographics = await Cesium.sampleTerrainMostDetailed(
              terrainProvider, 
              cartographics
            );
            
            // 将高度设置为地形高度加上小偏移
            const groundPositions = sampledCartographics.map(cartographic => {
              return Cesium.Cartesian3.fromRadians(
                cartographic.longitude, 
                cartographic.latitude, 
                cartographic.height + 0.5 // 地形高度 + 0.5米偏移
              );
            });
            
            entity.polygon.hierarchy = new Cesium.PolygonHierarchy(groundPositions);
          } catch (error) {
            console.warn("河流面要素地形采样失败:", error);
            // 如果采样失败，至少确保高度为0.5米
            const groundPositions = hierarchy.positions.map(position => {
              const cartographic = Cesium.Cartographic.fromCartesian(position);
              return Cesium.Cartesian3.fromRadians(
                cartographic.longitude, 
                cartographic.latitude, 
                0.5 // 设置为0.5米高度
              );
            });
            entity.polygon.hierarchy = new Cesium.PolygonHierarchy(groundPositions);
          }
        }
      }
    }
    
    console.log("河流地形采样完成");
  }

  /**
   * 检查图层是否显示
   * @returns {Boolean} 是否显示
   */
  isShown() {
    return this.dataSource ? this.dataSource.show : false;
  }

  /**
   * 获取图层信息
   */
  getLayerInfo() {
    return {
      name: "河流图层",
      entityCount: this.entities.length,
      hasLoaded: this._hasLoaded,
      dataSource: this.dataSource,
      geoJsonUrl: this.geoJsonUrl
    };
  }

  /**
   * 设置缩放监听器
   */
  setupZoomListener() {
    if (!this.viewer) return;
    
    // 移除已存在的监听器
    if (this.zoomListener) {
      this.zoomListener();
      this.zoomListener = null;
    }
    
    // 添加相机移动结束事件监听器
    this.zoomListener = this.viewer.camera.moveEnd.addEventListener(() => {
      this.checkZoomLevel();
    });
    
    // 初始检查
    this.checkZoomLevel();
  }

  /**
   * 检查当前缩放级别并控制图层显示
   */
  checkZoomLevel() {
    if (!this.viewer || !this.config.zoomLevel.enabled) return;
    
    // 获取当前相机高度并转换为缩放级别
    const height = this.viewer.camera.positionCartographic.height;
    const zoomLevel = this.getZoomLevelFromHeight(height);
    
    const { minZoom, maxZoom } = this.config.zoomLevel;
    const shouldShow = zoomLevel >= minZoom && zoomLevel <= maxZoom;
    
    if (shouldShow && this.hiddenByZoom) {
      // 应该显示但当前因层级隐藏，则显示
      this.hiddenByZoom = false;
      if (this.dataSource) {
        this.dataSource.show = true;
      }
    } else if (!shouldShow && !this.hiddenByZoom) {
      // 应该隐藏但当前显示，则隐藏
      this.hiddenByZoom = true;
      if (this.dataSource) {
        this.dataSource.show = false;
      }
    }
  }

  /**
   * 根据相机高度计算缩放级别
   * @param {Number} height - 相机高度（米）
   * @returns {Number} 缩放级别
   */
  getZoomLevelFromHeight(height) {
    // Cesium中相机高度到缩放级别的近似转换
    // 这个公式是基于Web墨卡托投影的标准转换
    const earthRadius = 6378137; // 地球半径（米）
    const tileSize = 256; // 瓦片大小
    const zoom = Math.log2(2 * Math.PI * earthRadius / (height * tileSize / 256));
    return Math.max(0, Math.min(22, Math.round(zoom)));
  }

  /**
   * 设置层级控制参数
   * @param {Object} options - 层级控制选项
   * @param {Number} options.minZoom - 最小显示层级
   * @param {Number} options.maxZoom - 最大显示层级
   * @param {Boolean} options.enabled - 是否启用层级控制
   */
  setZoomLevelControl(options = {}) {
    if (options.minZoom !== undefined) {
      this.config.zoomLevel.minZoom = options.minZoom;
    }
    if (options.maxZoom !== undefined) {
      this.config.zoomLevel.maxZoom = options.maxZoom;
    }
    if (options.enabled !== undefined) {
      this.config.zoomLevel.enabled = options.enabled;
      
      if (options.enabled && this.viewer) {
        this.setupZoomListener();
      } else if (!options.enabled && this.zoomListener) {
        this.zoomListener();
        this.zoomListener = null;
        this.hiddenByZoom = false;
        if (this.dataSource) {
          this.dataSource.show = true;
        }
      }
    }
    
    // 重新检查当前层级
    if (this.config.zoomLevel.enabled) {
      this.checkZoomLevel();
    }
  }

  /**
   * 获取当前缩放级别
   * @returns {Number} 当前缩放级别
   */
  getCurrentZoomLevel() {
    if (!this.viewer) return 0;
    const height = this.viewer.camera.positionCartographic.height;
    return this.getZoomLevelFromHeight(height);
  }

  /**
   * 销毁图层
   */
  destroy() {
    // 移除缩放监听器
    if (this.zoomListener) {
      this.zoomListener();
      this.zoomListener = null;
    }
    
    this.remove();
    eventBus.$off("riverLayer:shown");
    eventBus.$off("riverLayer:error");
  }
}

export default new RiverLayer();