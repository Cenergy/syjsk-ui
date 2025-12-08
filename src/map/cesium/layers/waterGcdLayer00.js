import BaseLayer from "./baseLayer";

class WaterGcdLayer extends BaseLayer {
  constructor(options = {}) {
    super(options);
    this.dataSource = null;
    this.entities = [];
    this.isVisible = false;
    this.gcdUrl = "/datasets/geojson/gcd.geojson";
    this.autoDecimate = true;
    this._clusterListenerSet = false;
    this._cameraChangedHandler = null;
    this.maxDepth = 198.4;
    // 性能缓存：减少不必要的标签显隐更新与相机事件频率
    this._lastShowLabels = null;
    this._lastCameraUpdateTime = 0;
  }

  async show(options = {}) {
    const { viewer } = this;
    const { maxDepth } = options;
    // 若传入新的水位（maxDepth）并与当前不一致：
    // 性能优化：已加载时优先只更新水位相关文本与聚类，而不重载数据
    if (typeof maxDepth === "number" && !isNaN(maxDepth)) {
      if (this.hasLoaded && this.isVisible && this.maxDepth !== maxDepth) {
        this.updateWaterLevel(maxDepth);
        return;
      }
      this.maxDepth = maxDepth;
    }
    
    
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
        const heightNum = Number(heightVal);
        entity._heightNum = isNaN(heightNum) ? undefined : heightNum;

        // 点样式
        entity.point = new Cesium.PointGraphics({
          pixelSize: 10,
          color: Cesium.Color.CYAN.withAlpha(0.95),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        });

         const depth = (typeof this.maxDepth === "number" ? this.maxDepth : NaN) - heightVal;
        const depthText = depth<=0 ? "" : `\n水深:${Math.max(0, depth).toFixed(2)}m`;
        const text = `高程:${heightVal}m${depthText}`;

        // 标签样式
        entity.label = new Cesium.LabelGraphics({
        //   text: heightVal !== undefined ? `${refName || ""} (${heightVal}m)` : `${refName || ""}`,
          text,
          font: "14pt Microsoft YaHei, sans-serif",
          fillColor: Cesium.Color.BLACK,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          showBackground: true,
          backgroundColor: Cesium.Color.WHITE.withAlpha(0.9),
          backgroundPadding: new Cesium.Cartesian2(10, 6),
          pixelOffset: new Cesium.Cartesian2(0, depthText?-40:-24),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scaleByDistance: new Cesium.NearFarScalar(1000, 1.0, 50000, 0.4),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 40000),
        });

        this.entities.push(entity);
      });

      // 启用并配置聚类，实现自动抽稀
      this.setupClustering();
      // 根据相机高度自适应聚类强度
      this.setupCameraAdaptiveClustering();

      this.isVisible = true;
      this.hasLoaded = true;
      console.log("水利高程控制点图层加载并显示成功");
    } catch (error) {
      console.error("加载高程控制点图层失败:", error);
    }
  }

  hide() {
    if (!this.entities.length) {
      // 仍需移除相机监听以降低后台负载
      if (this._cameraChangedHandler && this.viewer) {
        this.viewer.camera.changed.removeEventListener(this._cameraChangedHandler);
        this._cameraChangedHandler = null;
      }
      this.isVisible = false;
      return;
    }
    this.entities.forEach((entity) => (entity.show = false));
    this.isVisible = false;
    // 隐藏时移除相机监听，避免空闲时仍然响应相机事件
    if (this._cameraChangedHandler && this.viewer) {
      this.viewer.camera.changed.removeEventListener(this._cameraChangedHandler);
      this._cameraChangedHandler = null;
    }
  }

  flyToAll() {
    if (this.dataSource && this.viewer) {
      this.viewer.flyTo(this.dataSource);
    }
  }

  // 聚类配置（自动抽稀）
  setupClustering() {
    if (!this.dataSource) return;
    const clustering = this.dataSource.clustering;
    clustering.enabled = true;
    clustering.pixelRange = 50; // 聚类半径像素范围
    clustering.minimumClusterSize = 3; // 最少聚类数量

    if (this._clusterListenerSet) return;
    clustering.clusterEvent.addEventListener((clusteredEntities, cluster) => {
      // 聚类：显示该簇内最低高程（不显示数量、不显示图标）
      // 性能优化：仅使用预缓存的 _heightNum，避免每帧读取属性与解析
      let minHeight = Number.POSITIVE_INFINITY;
      for (const ent of clusteredEntities) {
        const h = ent && typeof ent._heightNum === "number" ? ent._heightNum : NaN;
        if (!isNaN(h) && h < minHeight) minHeight = h;
      }

      if (minHeight !== Number.POSITIVE_INFINITY) {
        const depth = (typeof this.maxDepth === "number" ? this.maxDepth : NaN) - minHeight;
        const depthText = isNaN(depth) || depth <= 0 ? "" : ` 深:${Math.max(0, depth).toFixed(2)}m`;
        const text = `${minHeight}m${depthText}`;
        cluster.label.show = true;
        cluster.label.text = text;
        cluster.label.font = "14pt Microsoft YaHei, sans-serif";
        cluster.label.fillColor = Cesium.Color.WHITE;
        cluster.label.outlineColor = Cesium.Color.BLACK;
        cluster.label.outlineWidth = 2;
        cluster.label.style = Cesium.LabelStyle.FILL_AND_OUTLINE;
      } else {
        cluster.label.show = false;
      }
      // 隐藏聚类图标
      cluster.billboard.show = false;
      cluster.billboard.image = undefined;
    });
    this._clusterListenerSet = true;
  }

  // 相机高度自适应聚类强度（自动抽稀增强）
  setupCameraAdaptiveClustering() {
    if (!this.viewer || !this.dataSource || !this.autoDecimate) return;
    const clustering = this.dataSource.clustering;
    // 提高 Camera.changed 触发阈值，减少事件触发频率
    try {
      const cam = this.viewer.camera;
      const currentPct = typeof cam.percentageChanged === "number" ? cam.percentageChanged : 0.05;
      cam.percentageChanged = Math.max(currentPct, 0.1);
    } catch (_) {}
    // 节流相机变化触发聚类强度调整：仅在高度分桶变化时更新
    this._lastClusterBucket = this._lastClusterBucket || null;
    const update = () => {
      // 轻量节流：避免每帧都运行计算
      const nowTs = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
      if (nowTs - this._lastCameraUpdateTime < 100) return; // ~10fps 上限，进一步降负载
      this._lastCameraUpdateTime = nowTs;
      const height = this.viewer.camera.positionCartographic.height || 0;
      const bucket = height > 40000 ? 3 : height > 15000 ? 2 : height > 5000 ? 1 : 0;
      if (bucket === this._lastClusterBucket) return;
      this._lastClusterBucket = bucket;
      if (bucket === 3) {
        clustering.pixelRange = 90;
        clustering.minimumClusterSize = 6;
      } else if (bucket === 2) {
        clustering.pixelRange = 70;
        clustering.minimumClusterSize = 5;
      } else if (bucket === 1) {
        clustering.pixelRange = 50;
        clustering.minimumClusterSize = 4;
      } else {
        clustering.pixelRange = 30;
        clustering.minimumClusterSize = 2;
      }

      // 根据缩放级别控制单点标签显示，避免与聚类标签叠加
      // 远景（bucket>=2）隐藏单点标签，仅保留聚类标签；近景（bucket<=1）恢复单点标签
      this._updateLabelVisibilityByBucket(bucket);
    };

    if (!this._cameraChangedHandler) {
      this._cameraChangedHandler = () => update();
      this.viewer.camera.changed.addEventListener(this._cameraChangedHandler);
    }
    update();
  }

  // 开关自动抽稀
  enableAutoDecimate(enabled = true) {
    this.autoDecimate = Boolean(enabled);
    if (this.autoDecimate) {
      this.setupCameraAdaptiveClustering();
    } else {
      if (this._cameraChangedHandler && this.viewer) {
        this.viewer.camera.changed.removeEventListener(this._cameraChangedHandler);
        this._cameraChangedHandler = null;
      }
      if (this.dataSource) {
        this.dataSource.clustering.pixelRange = 30;
        this.dataSource.clustering.minimumClusterSize = 2;
      }
    }
  }

  // 移除图层（语义化方法，等同于销毁）
  remove() {
    this.destroy();
  }

  // 根据相机高度分桶控制单点标签显示，缓解重叠
  _updateLabelVisibilityByBucket(bucket) {
    if (!Array.isArray(this.entities) || !this.entities.length) return;
    const showLabels = bucket <= 1; // 近景显示，远景隐藏
    if (this._lastShowLabels === showLabels) return; // 无变化则不遍历
    this._lastShowLabels = showLabels;
    for (const entity of this.entities) {
      if (entity && entity.label) {
        entity.label.show = showLabels;
      }
    }
  }

  // 高效更新水位，不重载数据源，仅刷新文本与聚类
  updateWaterLevel(maxDepth) {
    if (typeof maxDepth !== "number" || isNaN(maxDepth)) return;
    this.maxDepth = maxDepth;
    // 更新所有点实体的标签文本与偏移
    if (Array.isArray(this.entities) && this.entities.length) {
      this.entities.forEach((entity) => {
        const h = typeof entity._heightNum === "number" && !isNaN(entity._heightNum) ? entity._heightNum : undefined;
        if (typeof h !== "number") return;
        const depth = this.maxDepth - h;
        const depthText = depth <= 0 ? "" : `\n水深:${Math.max(0, depth).toFixed(2)}m`;
        const text = `高程:${h}m${depthText}`;
        if (entity.label) {
          entity.label.text = text;
          entity.label.pixelOffset = new Cesium.Cartesian2(0, depthText ? -40 : -24);
        }
      });
    }
    // 触发聚类重算以刷新簇标签
    if (this.dataSource && this.dataSource.clustering) {
      const clustering = this.dataSource.clustering;
      const prev = clustering.enabled;
      clustering.enabled = !prev;
      clustering.enabled = prev;
    }
    this.isVisible = true;
    this.hasLoaded = true;
  }

  destroy() {
    try {
      // 移除相机事件监听
      if (this._cameraChangedHandler && this.viewer) {
        this.viewer.camera.changed.removeEventListener(this._cameraChangedHandler);
        this._cameraChangedHandler = null;
      }
      if (this.dataSource && this.viewer) {
        this.viewer.dataSources.remove(this.dataSource);
      }
      this.dataSource = null;
      this.entities = [];
      this.isVisible = false;
      this.hasLoaded = false;
      // 重置聚类监听标志，避免重新加载后不再绑定自定义聚类事件
      this._clusterListenerSet = false;
      console.log("水利高程控制点图层已销毁");
    } catch (error) {
      console.error("销毁水利高程控制点图层失败:", error);
    }
  }
}

export default new WaterGcdLayer();