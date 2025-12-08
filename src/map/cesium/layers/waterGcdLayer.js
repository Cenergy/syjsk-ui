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
  }

  async show(options = {}) {
    const { viewer } = this;
    const { maxDepth } = options;
    // 若传入新的水位（maxDepth）并与当前不一致：
    // 已加载且正在显示则先移除，再更新水位；未加载则直接更新水位
    if (typeof maxDepth === "number" && !isNaN(maxDepth)) {
      if (this.hasLoaded && this.isVisible && this.maxDepth !== maxDepth) {
        this.remove();
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
        const depthText = depth<0 ? "" : `\n水深:${Math.max(0, depth).toFixed(2)}m`;
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
    if (!this.entities.length) return;
    this.entities.forEach((entity) => (entity.show = false));
    this.isVisible = false;
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
      const now = Cesium.JulianDate.now();
      let minHeight = Number.POSITIVE_INFINITY;
      const keys = [
        "height",
        "Height",
        "Elevation",
        "elevation",
        "H",
        "Z",
        "高程",
        "海拔",
      ];

      for (const ent of clusteredEntities) {
        let candidate = NaN;
        // 1) 尝试从实体标签解析数值（标签通常是“123m”）
        try {
          const t = ent.label && ent.label.text;
          if (typeof t === "string") {
            candidate = parseFloat(t);
          } else if (t && typeof t.getValue === "function") {
            const tv = t.getValue(now);
            candidate = parseFloat(tv);
          }
        } catch (_) {}

        // 2) 若标签不可用或解析失败，则从属性中获取
        if (isNaN(candidate)) {
          try {
            const propsBag = ent.properties && typeof ent.properties.getValue === "function" ? ent.properties.getValue(now) : null;
            for (const k of keys) {
              let v = undefined;
              if (propsBag && propsBag[k] !== undefined && propsBag[k] !== null) {
                v = propsBag[k];
              } else if (ent.properties && ent.properties[k]) {
                const p = ent.properties[k];
                v = typeof p.getValue === "function" ? p.getValue(now) : p;
              }
              if (v !== undefined && v !== null) {
                const num = parseFloat(v);
                if (!isNaN(num)) {
                  candidate = num;
                  break;
                }
              }
            }
          } catch (_) {}
        }

        if (!isNaN(candidate)) {
          minHeight = Math.min(minHeight, candidate);
        }
      }

      if (minHeight !== Number.POSITIVE_INFINITY) {
        const text = `${minHeight}m`;
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
    const update = () => {
      const height = this.viewer.camera.positionCartographic.height || 0;
      if (height > 40000) {
        clustering.pixelRange = 90;
        clustering.minimumClusterSize = 6;
      } else if (height > 15000) {
        clustering.pixelRange = 70;
        clustering.minimumClusterSize = 5;
      } else if (height > 5000) {
        clustering.pixelRange = 50;
        clustering.minimumClusterSize = 4;
      } else {
        clustering.pixelRange = 30;
        clustering.minimumClusterSize = 2;
      }
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