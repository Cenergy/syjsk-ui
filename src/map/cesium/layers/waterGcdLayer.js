import BaseLayer from "./baseLayer";
import { turf } from "swpdmap";

/**
 * 高程控制点图层
 * 参考 test.html 的聚类与标签思路，用 Cesium Entity + turf.DBSCAN 实现
 */
class WaterGcdLayer extends BaseLayer {
  constructor(options = {}) {
    super(options);
    this.dataSource = null; // Cesium.CustomDataSource
    this.entities = []; // 当前渲染的所有实体
    this.isVisible = false;
    this.gcdUrl = "/datasets/geojson/gcd.geojson";
    this._clusterListenerSet = false;
    this._cameraMoveEndHandler = null;
    this._lastLevel = null;

    // 缩放级别控制（与 test.html 对齐）
    this.levels = [10, 11, 12, 13, 14, 15, 16, 17, 18];
    this.curLevel = 18;

    // 性能缓存：减少不必要的标签更新
    this._lastCameraUpdateTime = 0;

    // 原始要素点集合（turf FeatureCollection）
    this.pointsFC = null;

    // 飞行临时实体
    this._flyTmpEntity = null;
  }

  /**
   * 根据缩放级别返回 DBSCAN 的距离阈值（单位：公里）
   */
  _dbscanEpsByLevel(level) {
    if (level === 13) return 0.5; // 500米
    if (level === 14) return 0.2; // 200米
    if ([15, 16].includes(level)) return 0.05; // 50米
    if ([17, 18].includes(level)) return 0.01; // 10米
    return 2; // 2公里
  }

  /**
   * 通过瓦片渲染列表估算当前 level（与 test.html 一致用法）
   */
  _getCurrentLevel() {
    try {
      const tilesToRender = this.viewer?.scene?.globe?._surface?._tilesToRender;
      if (tilesToRender && Array.isArray(tilesToRender) && tilesToRender.length > 0) {
        return tilesToRender[0]?._level ?? this.curLevel;
      }
    } catch (e) {}
    return this.curLevel;
  }

  /**
   * 计算不同级别对应的飞行高度（与 test.html 的公式一致）
   */
  _getEyeHeightByLevel(level) {
    const A = 40487.57;
    const B = 0.00007096758;
    const C = 91610.74;
    const D = -40467.74;
    return Math.pow((A - D) / (level - D) - 1, 1 / B) * C;
  }

  /**
   * 飞行到经纬度
   */
  async _flyToLngLat({ lng, lat, eyeHeight, duration = 1 }) {
    const { viewer } = this;
    if (!viewer) return;

    // 采样地形高度
    let height = 0;
    try {
      const cartographics = [Cesium.Cartographic.fromDegrees(lng, lat)];
      const sampled = await Cesium.sampleTerrain(viewer.scene.terrainProvider, 14, cartographics);
      height = sampled?.[0]?.height ?? 0;
    } catch (e) {}

    // 临时实体用于 flyTo 定位
    if (this._flyTmpEntity) {
      viewer.entities.remove(this._flyTmpEntity);
      this._flyTmpEntity = null;
    }
    this._flyTmpEntity = new Cesium.Entity({
      id: `waterGcd_flyTmp_${Date.now()}`,
      position: Cesium.Cartesian3.fromDegrees(lng, lat, height),
      point: {
        pixelSize: 0,
        color: Cesium.Color.RED.withAlpha(0),
        outlineColor: Cesium.Color.WHITE.withAlpha(0),
        outlineWidth: 0,
      },
    });
    viewer.entities.add(this._flyTmpEntity);

    const offset = {
      heading: viewer.scene.camera.heading,
      pitch: viewer.scene.camera.pitch,
      range: eyeHeight,
    };
    try {
      await viewer.flyTo(this._flyTmpEntity, { duration, offset });
    } catch (e) {}
  }

  /**
   * 将 GeoJSON features 转换为 turf 的点集合
   */
  _buildPointsFC(geojson) {
    const fc = { type: "FeatureCollection", features: [] };
    const feats = Array.isArray(geojson?.features) ? geojson.features : [];
    for (const f of feats) {
      if (f?.geometry?.type === "Point") {
        const [lng, lat] = f.geometry.coordinates;
        const height = f.properties?.height ?? f.properties?.Elevation ?? 0;
        const name = f.properties?.RefName ?? "";
        fc.features.push({
          type: "Feature",
          geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
          id: f.properties?.OBJECTID ?? `${lng}_${lat}`,
          coordinates: [Number(lng), Number(lat)],
          properties: { height, name },
          extData: { height, name },
        });
      }
    }
    return fc;
  }

  /**
   * 聚类结果转索引（cluster id -> items）
   */
  _calcClusterIndexs(features) {
    const index = {};
    for (const item of features) {
      const cid = item?.properties?.cluster;
      if (cid !== undefined && cid !== null) {
        index[cid] = index[cid] || [];
        index[cid].push(item);
      } else {
        const id = item?.id ?? Math.random().toString(36).slice(2);
        index[id] = [item];
      }
    }
    return index;
  }

  /**
   * 清理当前实体
   */
  _removeAllEntities() {
    if (!this.dataSource) return;
    this.dataSource.entities.removeAll();
    this.entities = [];
  }

  /**
   * 添加单点标签
   */
  _addPointLabel(item) {
    const [lng, lat] = item.coordinates;
    const text = `${(item.extData?.height ?? 0).toFixed(2)}m`;

    const entity = this.dataSource.entities.add({
      position: Cesium.Cartesian3.fromDegrees(lng, lat, 0),
      label: {
        text,
        font: `bold 18px Microsoft YaHei`,
        fillColor: Cesium.Color.BLACK,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        showBackground: true,
        backgroundColor: Cesium.Color.WHITE.withAlpha(0.9),
        backgroundPadding: new Cesium.Cartesian2(10, 6),
        pixelOffset: new Cesium.Cartesian2(0, -40),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        scaleByDistance: new Cesium.NearFarScalar(1000, 1.0, 50000, 0.3),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      properties: {
        type: "gcd_point",
        lng,
        lat,
        height: item.extData?.height,
        name: item.extData?.name,
      },
    });

    this.entities.push(entity);
    return entity;
  }

  /**
   * 添加聚类标签
   */
  _addClusterLabel(items) {
    // 用第一个点的位置作为聚类标签位置
    const [lng, lat] = items[0].coordinates;
    const entity = this.dataSource.entities.add({
      position: Cesium.Cartesian3.fromDegrees(lng, lat, 0),
      label: {
        text: `高程控制点(${items.length}个)`,
        font: `bold 16px Microsoft YaHei`,
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.fromCssColorString("#0e8f0c"),
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        showBackground: true,
        backgroundColor: Cesium.Color.fromCssColorString("#0e8f0c").withAlpha(0.85),
        backgroundPadding: new Cesium.Cartesian2(8, 4),
        pixelOffset: new Cesium.Cartesian2(0, -40),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        scaleByDistance: new Cesium.NearFarScalar(1000, 1.0, 50000, 0.3),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      properties: {
        type: "gcd_cluster",
        lng,
        lat,
        items, // 聚类内的点
      },
    });

    this.entities.push(entity);
    return entity;
  }

  /**
   * 根据当前级别计算聚类并渲染
   */
  _renderByLevel(level) {
    if (!this.pointsFC) return;
    const eps = this._dbscanEpsByLevel(level);
    const clustered = turf.clustersDbscan(this.pointsFC, eps, { minPoints: 2 });
    const index = this._calcClusterIndexs(clustered.features);

    this._removeAllEntities();

    Object.keys(index).forEach((key) => {
      const items = index[key];
      if (items.length === 1) this._addPointLabel(items[0]);
      else this._addClusterLabel(items);
    });
  }

  /**
   * 设置点击交互（点位点击与聚类点击）
   */
  _setupClickHandler() {
    const { viewer } = this;
    if (!viewer) return;

    // 先移除旧的
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
      Cesium.ScreenSpaceEventType.LEFT_CLICK
    );

    viewer.cesiumWidget.screenSpaceEventHandler.setInputAction(
      (evt) => {
        const picked = viewer.scene.pick(evt.position);
        if (!picked || !picked.id) return;
        const entity = picked.id;
        const props = entity.properties;
        if (!props) return;

        const type = props.type?.getValue?.() ?? props.type;
        const lng = props.lng?.getValue?.() ?? props.lng;
        const lat = props.lat?.getValue?.() ?? props.lat;

        if (type === "gcd_point") {
          // 单点：适度拉近
          const eye = 700.0;
          this._flyToLngLat({ lng, lat, eyeHeight: eye, duration: 1 });
        } else if (type === "gcd_cluster") {
          // 聚类：根据级别拉近到一个合适高度
          let targetLevel = this.curLevel < 13 ? 13 : this.curLevel < 15 ? 15 : 18;
          const eye = this._getEyeHeightByLevel(targetLevel);
          this._flyToLngLat({ lng, lat, eyeHeight: eye, duration: 1 });
        }
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK
    );
  }

  /**
   * 相机移动结束事件，驱动聚类刷新
   */
  _attachCameraMoveEndListener() {
    if (this._clusterListenerSet) return;
    const handler = () => {
      // 简单节流：200ms
      const now = performance.now();
      if (now - this._lastCameraUpdateTime < 200) return;
      this._lastCameraUpdateTime = now;

      const level = this._getCurrentLevel();
      if (this.levels.includes(level) && level !== this.curLevel) {
        this.curLevel = level;
        this._renderByLevel(this.curLevel);
      }
    };
    this.viewer.camera.moveEnd.addEventListener(handler);
    this._cameraMoveEndHandler = handler;
    this._clusterListenerSet = true;
  }

  /**
   * 显示图层
   */
  async show(options = {}) {
    if (this.isVisible) return;
    if (!this.viewer) return;

    try {
      // 创建数据源
      if (!this.dataSource) {
        this.dataSource = new Cesium.CustomDataSource("waterGcdLayer");
        this.viewer.dataSources.add(this.dataSource);
      }

      // 拉取 GeoJSON
      const res = await fetch(this.gcdUrl);
      const geojson = await res.json();
      this.pointsFC = this._buildPointsFC(geojson);

      // 初次渲染
      this.curLevel = this._getCurrentLevel();
      this._renderByLevel(this.curLevel);

      // 交互与监听
      this._setupClickHandler();
      this._attachCameraMoveEndListener();

      this.isVisible = true;
      this.hasLoaded = true;
      console.log("waterGcdLayer: shown");
    } catch (err) {
      console.error("waterGcdLayer: show failed", err);
    }
  }

  /**
   * 隐藏并清理
   */
  hide() {
    if (!this.viewer) return;

    try {
      // 移除监听
      if (this._clusterListenerSet && this._cameraMoveEndHandler) {
        this.viewer.camera.moveEnd.removeEventListener(this._cameraMoveEndHandler);
        this._cameraMoveEndHandler = null;
        this._clusterListenerSet = false;
      }

      // 清理实体
      this._removeAllEntities();

      // 隐藏数据源
      if (this.dataSource) this.dataSource.show = false;

      this.isVisible = false;
      console.log("waterGcdLayer: hidden");
    } catch (e) {
      console.error("waterGcdLayer: hide failed", e);
    }
  }
}

export default new WaterGcdLayer();