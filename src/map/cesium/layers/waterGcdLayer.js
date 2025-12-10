import BaseLayer from "./baseLayer";
import { gcdData } from "@/api/map";

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
      fontSize: options?.fontSize || 12,
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
    this.maxDepth = 198.4;

    // 层级控制：仅在缩放层级 > 16 时显示
    this.minZoomLevel = 17.5; // 大于16即 >=17
    this.zoomListener = null;
    this.hiddenByZoom = false;

    // 预分配像素偏移对象，避免频繁创建小对象
    this._offsetWithWater = new Cesium.Cartesian2(0, -40);
    this._offsetNoWater = new Cesium.Cartesian2(0, -24);

    // 每个不同 maxDepth 构建独立图层缓存
    this.layersByDepth = new Map(); // key: depthKey => { dataSource, entities }
    this.currentDepthKey = null;
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

    this.mouseMoveHandler =
      this.viewer.cesiumWidget.screenSpaceEventHandler.setInputAction(
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

    this.clickHandler =
      this.viewer.cesiumWidget.screenSpaceEventHandler.setInputAction(
        (event) => {
          const pickedObject = this.viewer.scene.pick(event.position);
          if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
            const entity = pickedObject.id;
            if (
              entity.clickHandler &&
              typeof entity.clickHandler === "function"
            ) {
              entity.clickHandler(event, entity);
            }
          }
        },
        Cesium.ScreenSpaceEventType.LEFT_CLICK
      );
  }

  async show(options = {}) {
    const { maxDepth } = options;
    console.log("🚀 ~ WaterGcdLayer ~ show ~ maxDepth:", maxDepth);
    // 使用传入的 maxDepth（如果提供）
    if (typeof maxDepth === "number" && !isNaN(maxDepth)) {
      this.maxDepth = maxDepth;
    }

    const depthKey = this._getDepthKey(this.maxDepth);

    // 如已存在该水位对应图层，则切换显示
    if (this.layersByDepth.has(depthKey)) {
      this._switchToDepthLayer(depthKey);
      // 设置缩放监听，基于层级控制显隐
      this.setupZoomLevelControl();
      // 立即检查一次层级，确保按需显示
      this.checkZoomLevel();
      this.isVisible = true;
      this.hasLoaded = true;
      return;
    }

    // 载入 GCD 点位数据（GeoJSON）
    try {
      const geojson = await gcdData.fetch();
      const features = Array.isArray(geojson?.features) ? geojson.features : [];

      // 为该水位创建独立数据源
      const ds = new Cesium.CustomDataSource(`waterGcdPoints_${depthKey}`);
      this.viewer.dataSources.add(ds);
      const ents = [];
      // 使 _createEntity 写入到当前新数据源
      this.dataSource = ds;

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
        const elevTextVal = typeof elev === "number" ? `${elev.toFixed(2)}m` : "";
        const hNum = Number(elev);
        // 显示水深（按当前 maxDepth）
        const depth = this.maxDepth - hNum;
        const depthText =
          depth <= 0 ? "" : `\n水深:${Math.max(0, depth).toFixed(2)}m`;
        const text = `高程:${elevTextVal}${depthText}`;

        const entity = this._createEntity({
          lon,
          lat,
          alt,
          name,
          elevText: text,
          props,
        });
        ents.push(entity);
      }


      // 交互（默认开启）
      const enableInteractions = false;
      if (enableInteractions) {
        this.setupClickHandler();
        this.setupMouseMoveHandler();
      } else {
        this.removeClickHandler();
        this.removeMouseMoveHandler();
      }
      // 缓存该水位图层
      this.layersByDepth.set(depthKey, { dataSource: ds, entities: ents });

      // 切换到当前水位，仅显示一个图层
      this._switchToDepthLayer(depthKey);

      // 设置缩放监听，基于层级控制显隐
      this.setupZoomLevelControl();
      // 立即检查一次层级，确保按需显示
      this.checkZoomLevel();

      this.isVisible = true;
      this.hasLoaded = true;
    } catch (err) {
      console.error("加载 GCD 点位失败:", err);
    }
  }

  hide() {
    // 隐藏所有水位图层，仅移除监听
    if (this.layersByDepth && this.layersByDepth.size) {
      this.layersByDepth.forEach(({ dataSource }) => {
        if (dataSource) dataSource.show = false;
      });
    }
    this.isVisible = false;
    this.removeClickHandler();
    this.removeMouseMoveHandler();
    // 移除层级监听
    this.removeZoomLevelControl();
  }

  // 外部更新水位，仅刷新标签与偏移，不重载数据
  setMaxDepth(maxDepth) {
    if (typeof maxDepth !== "number" || isNaN(maxDepth)) return;
    // 切换到对应水位图层（不存在则创建），每次只显示一个
    this.show({ maxDepth });
  }

  _createEntity({ lon, lat, alt, name, elevText, props }) {
    const position = Cesium.Cartesian3.fromDegrees(lon, lat, alt || 0);

    const labelText = elevText ? `${elevText}` : "";
    const entityConfig = {
      position,
      point: {
        pixelSize: 6,
        color: Cesium.Color.fromCssColorString("#409EFD"),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 1,
        showBackground: false,
        // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      label: {
        text: labelText,
        font: `${this.labelConfig.fontWeight} ${this.labelConfig.fontSize}pt ${this.labelConfig.fontFamily}`,
        showBackground: false,
        style: Cesium.LabelStyle.FILL,
        // fillColor: this.labelConfig.fillColor,
        // outlineColor: this.labelConfig.outlineColor,
        // outlineWidth: this.labelConfig.outlineWidth,
        // style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        // showBackground: this.labelConfig.showBackground,
        // backgroundColor: this.labelConfig.backgroundColor,
        // backgroundPadding: this.labelConfig.backgroundPadding,
        pixelOffset: new Cesium.Cartesian2(0, -40),
        // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
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
    // 缓存数值高程，便于后续水位联动更新
    const heightVal = props && (props.height ?? props.Elevation);
    const hNum = Number(heightVal);
    entity._heightNum = isNaN(hNum) ? undefined : hNum;
    // 可选：为点击提供默认行为（示例为日志）
    entity.clickHandler = (evt, e) => {
      // console.log("GCD 点位点击:", e?.properties?.name?.getValue?.());
    };
    return entity;
  }

  // —— 水位图层管理 ——
  _getDepthKey(depth) {
    const d = Number(depth);
    if (isNaN(d)) return "NaN";
    return d.toFixed(2);
  }

  _switchToDepthLayer(depthKey) {
    if (!this.layersByDepth || !this.layersByDepth.has(depthKey)) return;
    // 隐藏其它图层
    this.layersByDepth.forEach(({ dataSource }, key) => {
      if (dataSource) dataSource.show = key === depthKey;
    });
    // 绑定当前图层引用
    const { dataSource, entities } = this.layersByDepth.get(depthKey);
    this.dataSource = dataSource;
    this.entities = entities || [];
    this.currentDepthKey = depthKey;
  }

  // 高效更新水位，不重载数据源，仅刷新文本与偏移
  updateWaterLevel(maxDepth) {
    if (typeof maxDepth !== "number" || isNaN(maxDepth)) return;
    this.maxDepth = maxDepth;
    // 更新所有点实体的标签文本与偏移
    if (Array.isArray(this.entities) && this.entities.length) {
      this.entities.forEach((entity) => {
        const h =
          typeof entity._heightNum === "number" && !isNaN(entity._heightNum)
            ? entity._heightNum
            : undefined;
        if (typeof h !== "number") return;
        const depth = this.maxDepth - h;
        const depthText =
          depth <= 0 ? "" : `\n水深:${Math.max(0, depth).toFixed(2)}m`;
        const text = `高程:${h}m${depthText}`;
        if (entity.label) {
          // 差异写入，避免不必要的属性更新与对象分配
          if (entity.label.text !== text) {
            entity.label.showBackground = false
            entity.label.text = text;
          }
          const targetOffset = depthText ? this._offsetWithWater : this._offsetNoWater;
          if (!entity.label.pixelOffset || entity.label.pixelOffset.y !== targetOffset.y) {
            entity.label.pixelOffset = targetOffset;
          }
        }
      });
    }
    // 轻量刷新场景（开启 requestRenderMode 时可立即重绘）
    // if (this.viewer && this.viewer.scene && typeof this.viewer.scene.requestRender === "function") {
    //   this.viewer.scene.requestRender();
    // }
    this.isVisible = true;
    this.hasLoaded = true;
  }

  // ===== 缩放层级显隐控制 =====
  setupZoomLevelControl() {
    if (!this.viewer) return;
    // 若已有监听，先移除
    if (this.zoomListener) {
      try { this.zoomListener(); } catch (e) {}
      this.zoomListener = null;
    }
    // 绑定相机移动结束事件
    this.zoomListener = this.viewer.camera.moveEnd.addEventListener(() => {
      this.checkZoomLevel();
    });
  }

  removeZoomLevelControl() {
    if (this.zoomListener) {
      try { this.zoomListener(); } catch (e) {}
      this.zoomListener = null;
    }
    this.hiddenByZoom = false;
  }

  checkZoomLevel() {
    if (!this.viewer || !this.dataSource) return;
    // 复用 BaseLayer 的层级计算
    const info = this.getHierarchyLevel && this.getHierarchyLevel();
    const zoomLevel = info && typeof info.floorLevel === 'number' ? info.floorLevel : 0;
    const shouldShow = zoomLevel >= this.minZoomLevel;

    if (shouldShow && this.hiddenByZoom) {
      this.hiddenByZoom = false;
      this.dataSource.show = true;
    } else if (!shouldShow && !this.hiddenByZoom) {
      this.hiddenByZoom = true;
      this.dataSource.show = false;
    }
  }
}

export default new WaterGcdLayer();
