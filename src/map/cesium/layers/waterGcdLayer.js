import BaseLayer from "./baseLayer";

class WaterGcdLayer extends BaseLayer {
  constructor(options = {}) {
    super(options);
    this.dataSource = null;
    this.entities = [];
    this.isVisible = false;
    this.hasLoaded = false;

    // 数据源
    this.gcdUrl = "/datasets/geojson/gcd.geojson";

    // 标签样式（对齐 reservoirPoints 的风格）
    this.labelConfig = {
      fontSize: options?.fontSize || 18,
      fontFamily: "Microsoft YaHei",
      fontWeight: "bold",
      fillColor: Cesium.Color.BLACK,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 3,
      showBackground: true,
      backgroundColor: Cesium.Color.WHITE.withAlpha(1),
      backgroundPadding: new Cesium.Cartesian2(12, 8),
    };

    // 交互处理器
    this.clickHandler = null;
    this.mouseMoveHandler = null;
  }

  removeClickHandler() {
    if (this.clickHandler) {
      this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_CLICK
      );
      this.clickHandler = null;
    }
  }

  removeMouseMoveHandler() {
    if (this.mouseMoveHandler) {
      this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.MOUSE_MOVE
      );
      this.mouseMoveHandler = null;
    }
  }

  setupMouseMoveHandler() {
    if (this.mouseMoveHandler) {
      this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.MOUSE_MOVE
      );
    }

    this.mouseMoveHandler = this.viewer.cesiumWidget.screenSpaceEventHandler.setInputAction(
      (event) => {
        const pickedObject = this.viewer.scene.pick(event.endPosition);
        if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
          const entity = pickedObject.id;
          if (this.entities.includes(entity)) {
            this.viewer.canvas.style.cursor = "pointer";
          } else {
            this.viewer.canvas.style.cursor = "default";
          }
        } else {
          this.viewer.canvas.style.cursor = "default";
        }
      },
      Cesium.ScreenSpaceEventType.MOUSE_MOVE
    );
  }

  setupClickHandler() {
    if (this.clickHandler) {
      this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_CLICK
      );
    }

    this.clickHandler = this.viewer.cesiumWidget.screenSpaceEventHandler.setInputAction(
      (event) => {
        const pickedObject = this.viewer.scene.pick(event.position);
        if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
          const entity = pickedObject.id;
          if (entity.clickHandler && typeof entity.clickHandler === "function") {
            entity.clickHandler(event, entity);
          }
        }
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK
    );
  }

  async show(options = {}) {
    if (this.isVisible) return;

    // 创建数据源
    if (!this.dataSource) {
      this.dataSource = new Cesium.CustomDataSource("waterGcdPoints");
      this.viewer.dataSources.add(this.dataSource);
    }

    // 清空旧实体
    this.dataSource.entities.removeAll();
    this.entities = [];

    // 载入 GCD 点位数据（GeoJSON）
    try {
      const res = await fetch(this.gcdUrl);
      const geojson = await res.json();
      const features = Array.isArray(geojson?.features) ? geojson.features : [];

      for (const feature of features) {
        if (feature?.geometry?.type !== "Point") continue;
        const coords = feature.geometry.coordinates || [];
        if (coords.length < 2) continue;

        const lon = Number(coords[0]);
        const lat = Number(coords[1]);
        const alt = Number(coords[2] || 0);
        const props = feature.properties || {};
        const name = props.RefName || "";
        const elev = props.height ?? props.Elevation; // 优先取 height
        const elevText = typeof elev === "number" ? `${elev.toFixed(2)}m` : "";

        const entity = this._createEntity({ lon, lat, alt, name, elevText, props });
        this.entities.push(entity);
      }

      // 启用聚类
      this.setupClustering(options?.clustering);

      // 交互（默认开启）
      const enableInteractions = options?.enableInteractions !== false;
      if (enableInteractions) {
        this.setupClickHandler();
        this.setupMouseMoveHandler();
      } else {
        this.removeClickHandler();
        this.removeMouseMoveHandler();
      }

      this.isVisible = true;
      this.hasLoaded = true;
    } catch (err) {
      console.error("加载 GCD 点位失败:", err);
    }
  }

  hide() {
    if (!this.dataSource) return;
    this.isVisible = false;
    this.dataSource.show = false;
    this.removeClickHandler();
    this.removeMouseMoveHandler();
  }

  _createEntity({ lon, lat, alt, name, elevText, props }) {
    const position = Cesium.Cartesian3.fromDegrees(lon, lat, alt || 0);

    const labelText = elevText ? `${name}\n${elevText}` : name;
    const entityConfig = {
      position,
      label: {
        text: labelText,
        font: `${this.labelConfig.fontWeight} ${this.labelConfig.fontSize}pt ${this.labelConfig.fontFamily}`,
        fillColor: this.labelConfig.fillColor,
        outlineColor: this.labelConfig.outlineColor,
        outlineWidth: this.labelConfig.outlineWidth,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        showBackground: this.labelConfig.showBackground,
        backgroundColor: this.labelConfig.backgroundColor,
        backgroundPadding: this.labelConfig.backgroundPadding,
        pixelOffset: new Cesium.Cartesian2(0, -40),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        scaleByDistance: new Cesium.NearFarScalar(1000, 1.0, 50000, 0.3),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      properties: {
        name,
        elevText,
        ...props,
      },
    };

    const entity = this.dataSource.entities.add(entityConfig);
    // 可选：为点击提供默认行为（示例为日志）
    entity.clickHandler = (evt, e) => {
      // console.log("GCD 点位点击:", e?.properties?.name?.getValue?.());
    };
    return entity;
  }

  setupClustering(config = {}) {
    if (!this.dataSource) return;
    const clustering = this.dataSource.clustering;
    clustering.enabled = true;
    clustering.pixelRange = config.pixelRange ?? 50;
    clustering.minimumClusterSize = config.minimumClusterSize ?? 3;

    clustering.clusterEvent.addEventListener((clusteredEntities, cluster) => {
      const count = clusteredEntities.length;
      const text = `GCD点位 ${count}`;

      // 仅显示聚类的文字标签，关闭默认图标
      cluster.label.show = true;
      cluster.label.text = text;
      cluster.label.font = "14pt Microsoft YaHei, sans-serif";
      cluster.label.fillColor = Cesium.Color.WHITE;
      cluster.label.outlineColor = Cesium.Color.BLACK;
      cluster.label.outlineWidth = 2;
      cluster.label.style = Cesium.LabelStyle.FILL_AND_OUTLINE;

      cluster.billboard.show = false;
      cluster.billboard.image = undefined;
    });
  }
}

export default new WaterGcdLayer();