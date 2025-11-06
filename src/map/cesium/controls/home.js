import BaseMapBus from "./base";
import eventBus from "@/utils/EventBus";
import * as layers from "../layers";
import { constant } from "@/map";

const { VIEW_SETTINGS_MAP, MODEL_3DTILES_INFO_LIST } = constant;

const layerMap = new Map([
  ["waterLogging", layers.waterLoggingPoint],
  ["tilesetModel", layers.tilesetModel],
  ["glbModel", layers.glbModel],
  ["radarImage", layers.radarImage],
  ["videoMonitor", layers.videoMonitor],
  ["cloudImage", layers.cloudImage],
  ["pipe", layers.pipe],
  ["vehicle", layers.vehicle],
  ["rainfallForecast", layers.rainfallForecast],
  ["tilesetModelAccuracy", layers.tilesetModelAccuracy],
  ["rainMonitor", layers.rainMonitor],
  ["typhoonTrack", layers.typhoonTrack],
  ["thunder", layers.thunder],
  ["floodAnalysis", layers.floodAnalysisLayer],
  ["floodRisk", layers.floodRisk],
  ["echartsLayer", layers.echartsLayer],
  ["drainageZone", layers.drainageZone],
  ["weather", layers.weather],
  ["administrativeLayer", layers.administrativeLayer],
  ["watershedLayer", layers.watershedLayer],
  ["reservoirPoints", layers.reservoirPoints],
  ["boundaryLayer", layers.boundaryLayer],
  ["riverLayer", layers.riverLayer],
  ["waterLayer", layers.waterLayer],
]);
/**
 * 首页中的地图业务类
 */
class MapBus extends BaseMapBus {
  constructor(options) {
    super(options);
  }
  /**
   * 一进入地图需要加载的函数
   */
  startup(options = {}) {
    // 初始化地图,传递options参数
    this.init(options);
    // 天地图底图显示
    layers.tiandituLayer.show();
    // 默认显示水库点位图层
    layers.reservoirPoints.show();
    // 默认显示区域边界图层
    // layers.boundaryLayer.show();
    layers.terrainLayer.show();
    // 默认显示河流图层
    // layers.riverLayer.show();
    // layers.pipe.show();
    // layers.vehicle.show();
    // layers.waterLoggingPoint.show();
    // layers.echartsLayer.show();
    // layers.drainageZone.show();
    // layers.tilesetModelAccuracy.show();
    // layers.waterLayer.show();
    // layers.floodRisk.show();
    // layers.administrativeLayer.show();
    //地图详细弹窗
    eventBus.emit("addMapDetail", {
      value: "floodAnalysis",
      label: "淹没分析",
    });
    // eventBus.emit("addMapDetail", {
    //   value: "tilesetModelAccuracy",
    //   label: "模型精度",
    // });

    //事件监听
    this.subscribe();
  }
  subscribe() {
    // 监听定位
    eventBus.on("mapLocate", (res) => {
      this._mapLocate(res);
    });
    // 监听的是复选框的状态
    eventBus.on("addMapLayer", (checkItem = {}) => {
      const checkObject = { checkItem, checkStatus: true };
      this._checkboxMapChange(checkObject);
    });
    // 监听的是复选框的状态
    eventBus.on("removeMapLayer", (checkItem = {}) => {
      const checkObject = { checkItem, checkStatus: false };
      this._checkboxMapChange(checkObject);
    });
    // 监听添加GeoJSON图层
    eventBus.on("addGeoJsonLayer", (options = {}) => {
      this._addGeoJsonLayer(options);
    });
    //排水分区
    eventBus.on("addPsfq", (sendata = {}) => {
      layers.drainageZone.show(sendata);
      layers.echartsLayer.show();
    });
    eventBus.on("removePsfq", () => {
      layers.drainageZone.hide();
      layers.echartsLayer.hide();
    });
    //天气特效
    eventBus.on("addWeather", (type) => {
      layers.weather.showRain(type);
    });
    eventBus.on("removeWeather", () => {
      layers.weather.hide();
    });

    // 监听水库点位相关事件
    eventBus.on("showReservoirPoints", () => {
      layers.reservoirPoints.show();
    });
    eventBus.on("hideReservoirPoints", () => {
      layers.reservoirPoints.hide();
    });
    eventBus.on("flyToReservoir", (reservoirId) => {
      layers.reservoirPoints.flyToReservoir(reservoirId);
    });

    // 监听区域边界图层相关事件
    eventBus.on("showBoundaryLayer", () => {
      layers.boundaryLayer.show();
    });
    eventBus.on("hideBoundaryLayer", () => {
      layers.boundaryLayer.hide();
    });
    eventBus.on("flyToRegion", (refName) => {
      layers.boundaryLayer.flyToRegion(refName);
    });
  }
  //地图点击事件

  _mapLocate(res) {
    const { viewer, id } = this;
    const { type, data } = res;
    if (type === "FlyToLocal") {
      if ([...VIEW_SETTINGS_MAP.keys()].includes(data)) {
        const viewInfo = VIEW_SETTINGS_MAP.get(data);
        viewInfo && viewer.camera.flyTo(viewInfo);
        return;
      }
      const selectObj = MODEL_3DTILES_INFO_LIST.find(
        (item) => item.name === data
      );

      if (selectObj) {
        const { postion, center, view = {}, flyToData } = selectObj;
        const { center: viewCenter } = view;
        if (flyToData) {
          viewer.camera.flyTo(flyToData);
          return;
        }
        const flyToPosition = viewCenter || postion || center;
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(
            flyToPosition[0],
            flyToPosition[1],
            1000
          ),
          orientation: {
            heading: 0.13661135068214314,
            pitch: 0.004291045325958809,
            roll: 0.000002205047945125216,
            ...view,
          },
        });
        return;
      }
      viewer.scene.camera.flyTo({
        //将经度、纬度、高度的坐标转换为笛卡尔坐标
        destination: Cesium.Cartesian3.fromDegrees(
          114.47844870725397,
          25.78777303333803,
          8000
        ),
        orientation: {
          heading: 5.263221487362526,
          pitch: -0.49596446933827343,
          roll: 0.00021076712083978322,
        },
      });
    }

    if (data.center) {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          data.center[0],
          data.center[1],
          1000
        ),
      });
      return;
    }
    if (data.x && data.y) {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(data.x, data.y, 1000),
      });
    } else if (data.lon && data.lat) {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(data.lon, data.lat, 1000),
      });
    } else {
      const entity = viewer.entities.getById(data.id);
      if (entity) {
        viewer.flyTo(entity);
        return entity;
      }
    }
  }
  //图层显隐
  _checkboxMapChange(options) {
    const { checkItem = {}, checkStatus } = options;
    const { label, val, layerId } = checkItem;

    // 处理自定义图层ID的情况（如effect-layer）
    if (layerId) {
      if (checkStatus) {
        // 显示图层逻辑已在addGeoJsonLayer中处理
      } else {
        // 移除图层
        this._removeGeoJsonLayer(layerId);
      }
      return;
    }

    const layer = layerMap.get(val);
    if (!layer) return;
    layer.setVisible(checkStatus);
  }

  // 添加GeoJSON图层
  async _addGeoJsonLayer(options = {}) {
    const { layerId, data, style = {} } = options;
    const { viewer } = this;

    if (!layerId || !data) {
      console.warn("addGeoJsonLayer: layerId和data参数是必需的");
      return;
    }

    try {
      // 移除已存在的同名图层
      this._removeGeoJsonLayer(layerId);

      // 创建GeoJSON数据源
      const geoJsonDataSource = await Cesium.GeoJsonDataSource.load(data, {
        stroke: Cesium.Color.fromCssColorString(
          style.color || "#ff0000"
        ).withAlpha(style.opacity || 0.8),
        strokeWidth: style.weight || 3,
        fill: Cesium.Color.fromCssColorString(
          style.fillColor || "#ff0000"
        ).withAlpha(style.fillOpacity || 0.2),
        clampToGround: true,
        skipLevelOfDetail: true,
      });

      // 设置数据源名称以便后续识别
      geoJsonDataSource.name = layerId;

      // 添加到地图
      viewer.dataSources.add(geoJsonDataSource);

      console.log(`GeoJSON图层 ${layerId} 添加成功`);
    } catch (error) {
      console.error(`添加GeoJSON图层 ${layerId} 失败:`, error);
    }
  }

  // 移除GeoJSON图层
  _removeGeoJsonLayer(layerId) {
    const { viewer } = this;

    if (!layerId) {
      console.warn("removeGeoJsonLayer: layerId参数是必需的");
      return;
    }

    // 查找并移除指定名称的数据源
    const dataSources = viewer.dataSources._dataSources;
    for (let i = dataSources.length - 1; i >= 0; i--) {
      const dataSource = dataSources[i];
      if (dataSource.name === layerId) {
        viewer.dataSources.remove(dataSource);
        console.log(`GeoJSON图层 ${layerId} 移除成功`);
        break;
      }
    }
  }
  //销毁实例
  destroy() {
    const { viewer } = this;
    if (Cesium.defined(viewer)) {
      viewer.entities.removeAll();
      viewer.imageryLayers.removeAll();
      viewer.dataSources.removeAll();
      // 获取webgl上下文
      let gl = viewer.scene.context._originalGLContext;
      gl.canvas.width = 1;
      gl.canvas.height = 1;
      viewer.destroy(); // 销毁Viewer实例
      gl.getExtension("WEBGL_lose_context").loseContext();
      gl = null;
      window.viewer = null;
      var cesiumContainer = document.getElementById("cesiumContainer");
      if (cesiumContainer) {
        cesiumContainer.remove(); // 移除与地图相关的DOM元素
      }
      console.log("cesium已销毁");
    }
  }
}
export default new MapBus();
