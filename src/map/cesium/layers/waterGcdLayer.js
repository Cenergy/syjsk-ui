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
    this.maxDepth = 200.6;

    // 层级控制：仅在缩放层级 > 16 时显示
    this.minZoomLevel = 17; // 大于16即 >=17
    this.zoomListener = null;
    this.hiddenByZoom = false;

    // 预分配像素偏移对象，避免频繁创建小对象
    this._offsetWithWater = new Cesium.Cartesian2(0, -40);
    this._offsetNoWater = new Cesium.Cartesian2(0, -24);
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
    // 始终使用同一数据源，仅根据 maxDepth 更新深度显示
    if (typeof maxDepth === "number" && !isNaN(maxDepth)) {
      this.maxDepth = maxDepth;
    }

    // 如果数据已加载，则只需显示并刷新水深标签
    if (this.hasLoaded) {
      if (this.dataSource) this.dataSource.show = true;
      // this.updateWaterLevel(this.maxDepth);
      // 设置缩放监听，基于层级控制显隐
      this.setupZoomLevelControl();
      // 立即检查一次层级，确保按需显示
      this.checkZoomLevel();
      this.isVisible = true;
      return;
    }

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
        // 显示水深
        const depth = this.maxDepth - elev;
        const depthText =
          depth <= 0 ? "" : `\n水深:${Math.max(0, depth).toFixed(2)}m`;
        const text = `高程:${elevText}${depthText}`;

        const entity = this._createEntity({
          lon,
          lat,
          alt,
          name,
          elevText:text,
          props,
        });
        this.entities.push(entity);
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
      // 更新水深标签与偏移
      // this.updateWaterLevel(this.maxDepth);

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
    if (!this.dataSource) return;
    this.isVisible = false;
    this.dataSource.show = false;
    this.removeClickHandler();
    this.removeMouseMoveHandler();
    // 移除层级监听
    this.removeZoomLevelControl();
  }

  // 外部更新水位，仅刷新标签与偏移，不重载数据
  setMaxDepth(maxDepth) {
    if (typeof maxDepth !== "number" || isNaN(maxDepth)) return;
    // this.updateWaterLevel(maxDepth);
  }

  _createEntity({ lon, lat, alt, name, elevText, props }) {
    const position = Cesium.Cartesian3.fromDegrees(lon, lat, alt || 0);

    const labelText = elevText ? `${name}\n${elevText}` : name;
    const entityConfig = {
      position,
      point: {
        pixelSize: 6,
        color: Cesium.Color.fromCssColorString("#409EFD"),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 1,
        // heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      label: {
        text: labelText,
        font: `${this.labelConfig.fontWeight} ${this.labelConfig.fontSize}pt ${this.labelConfig.fontFamily}`,
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
