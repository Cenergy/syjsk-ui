import BaseLayer from "./baseLayer";
import eventBus from "@/utils/EventBus";
import houseData from "@/api/map/getHouses";

import {turf} from "swpdmap"


class AffectedHousesLayer extends BaseLayer {
  constructor(options) {
    super(options);
    this.dataSource = null;
    this.outlineDataSource = null;
    this.highlightDataSource = null;
    this.isVisible = false;
    this.hasLoaded = false;
    this.zIndex = 120;
    this.style = {
      color: "#FF0000",
      alpha: 0.25,
      strokeWidth: 6,
    };
    // Hover tooltip and handler
    this._hoverHandler = null;
    this._hoverTooltipEl = null;
    this._turfFeatures = [];
  }

  async add(options = {}) {
    const { data, id = "affected-houses", zIndex = this.zIndex, style = {} } = options;

    // 合并样式
    this.style = { ...this.style, ...style };

    try {
      // 若已有数据源，先移除
      if (this.dataSource) {
        this.viewer.dataSources.remove(this.dataSource, true);
        this.dataSource = null;
      }

      const geoJsonData = data || (await houseData.getHouses());
      if (!geoJsonData || !geoJsonData.features) {
        console.warn("受影响民房数据为空或格式错误");
        return;
      }

      const { color, alpha, strokeWidth } = this.style;

      const dataSource = await window.Cesium.GeoJsonDataSource.load(geoJsonData, {
        stroke: window.Cesium.Color.fromCssColorString(color),
        // 禁用填充：设置为透明，随后在实体上直接关闭 fill
        fill: window.Cesium.Color.TRANSPARENT,
        strokeWidth: strokeWidth,
        clampToGround: true,
      });

      const entities = dataSource.entities.values;
      entities.forEach((entity) => {
        if (entity && entity.polygon) {
          entity.polygon.zIndex = zIndex;
          // 面透明填充以支持拾取；关闭自带轮廓，由贴地 polyline 显示
          entity.polygon.fill = true;
          entity.polygon.outline = false;
          entity.polygon.material = window.Cesium.Color.TRANSPARENT;
        }
      });

      // 为面要素生成贴地线框（polyline），实现真正贴地的轮廓
      const outlineDS = new window.Cesium.CustomDataSource(`${id}-outline`);

      geoJsonData.features.forEach((feature) => {
        const geometry = feature && feature.geometry;
        if (!geometry || !geometry.type || !geometry.coordinates) return;
        const type = geometry.type;
        const coords = geometry.coordinates;
        const props = (feature && feature.properties) || {};

        const addRingPolyline = (ring) => {
          // ring: [[lon, lat, h?], ...]
          // 扁平化为 [lon,lat,lon,lat,...]
          const flat = ring.flat();
          // 若包含高度，fromDegreesArray 会忽略高度；贴地由 clampToGround 控制
          const positions = window.Cesium.Cartesian3.fromDegreesArray(flat);
          outlineDS.entities.add({
            name: props.name || props.Name || "受影响民房",
            properties: new window.Cesium.PropertyBag(props || {}),
            polyline: {
              positions,
              clampToGround: true,
              width: strokeWidth,
              material: window.Cesium.Color.fromCssColorString(color),
            },
          });
        };

        if (type === "Polygon") {
          // coords: [ outerRing, holeRing1, holeRing2, ... ]
          coords.forEach((ring) => addRingPolyline(ring));
        } else if (type === "MultiPolygon") {
          // coords: [ [ outerRing, holeRing... ], [ ... ], ... ]
          coords.forEach((poly) => {
            poly.forEach((ring) => addRingPolyline(ring));
          });
        }
      });

      // 预构建 turf 几何（Polygon/MultiPolygon），用于鼠标在面上时的兜底命中判断
      this._turfFeatures = geoJsonData.features
        .map((f) => {
          const g = f && f.geometry;
          if (!g || !g.type || !g.coordinates) return null;
          const props = (f && f.properties) || {};
          if (g.type === "Polygon") return turf.polygon(g.coordinates, props);
          if (g.type === "MultiPolygon") return turf.multiPolygon(g.coordinates, props);
          return null;
        })
        .filter(Boolean);

      await this.viewer.dataSources.add(outlineDS);
      this.outlineDataSource = outlineDS;

      dataSource.name = id;
      dataSource.zIndex = zIndex;
      await this.viewer.dataSources.add(dataSource);
      this.dataSource = dataSource;
      this.isVisible = true;
      this.hasLoaded = true;

      // 初始化悬浮提示与事件
      this._setupHoverTooltip();

      // 可选：通知图例（如需）
      eventBus.emit("setLegend", {
        type: "affectedHouses",
        data: {
          label: "受影响民房范围",
          items: [{ label: "范围", color }],
        },
      });
    } catch (error) {
      console.error("加载受影响民房面数据失败:", error);
    }
  }

  show() {
    if (this.dataSource) {
      this.dataSource.show = true;
      this.isVisible = true;
    }
  }

  hide() {
    if (this.dataSource) {
      this.dataSource.show = false;
      this.isVisible = false;
    }
    // 隐藏悬浮提示
    if (this._hoverTooltipEl) {
      this._hoverTooltipEl.style.display = "none";
    }
  }

  remove() {
    if (this.dataSource) {
      this.viewer.dataSources.remove(this.dataSource, true);
      this.dataSource = null;
      this.isVisible = false;
      eventBus.emit("closeLegend", { type: "affectedHouses" });
    }
    if (this.outlineDataSource) {
      this.viewer.dataSources.remove(this.outlineDataSource, true);
      this.outlineDataSource = null;
    }
    if (this.highlightDataSource) {
      this.viewer.dataSources.remove(this.highlightDataSource, true);
      this.highlightDataSource = null;
    }
    this._destroyHoverTooltip();
  }

  removeAll() {
    this.remove();
  }

  // ===== 悬浮提示实现 =====
  _ensureHoverTooltipEl() {
    if (this._hoverTooltipEl) return this._hoverTooltipEl;
    const el = document.createElement("div");
    el.style.position = "absolute";
    el.style.pointerEvents = "none";
    el.style.zIndex = "9999";
    el.style.background = "rgba(4,26,56,0.85)";
    el.style.color = "#fff";
    el.style.border = "1px solid #335c94";
    el.style.borderRadius = "4px";
    el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.4)";
    el.style.padding = "8px 10px";
    el.style.fontSize = "12px";
    el.style.display = "none";
    el.style.maxWidth = "320px";
    el.style.backdropFilter = "blur(2px)";
    this.viewer.container.appendChild(el);
    this._hoverTooltipEl = el;
    return el;
  }

  _formatPropsToHtml(props = {}) {
    try {
      const entries = Object.entries(props || {});
      if (!entries.length) return "";
      // 选取前若干条关键信息
      const maxItems = 8;
      const lines = entries.slice(0, maxItems).map(([k, v]) => {
        const vv = v == null ? "" : String(v);
        return `<div><span style="color:#50beff">${k}</span>：${vv}</div>`;
      });
      return lines.join("");
    } catch (e) {
      return "";
    }
  }

  _showTooltipAt(x, y, html = "") {
    const el = this._ensureHoverTooltipEl();
    if (!html) {
      el.style.display = "none";
      return;
    }
    el.innerHTML = html;
    // 避免超出右下角
    const offsetX = 12;
    const offsetY = 12;
    const { clientWidth, clientHeight } = el;
    const containerRect = this.viewer.container.getBoundingClientRect();
    let left = x + offsetX;
    let top = y + offsetY;
    // 调整到容器坐标
    // pick返回的是canvas坐标，容器通常是同一层次，直接使用即可
    if (left + clientWidth > containerRect.width - 10) {
      left = Math.max(10, x - clientWidth - offsetX);
    }
    if (top + clientHeight > containerRect.height - 10) {
      top = Math.max(10, y - clientHeight - offsetY);
    }
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    el.style.display = "block";
  }

  _hideTooltip() {
    if (this._hoverTooltipEl) this._hoverTooltipEl.style.display = "none";
  }

  _setupHoverTooltip() {
    // 已存在则不重复绑定
    if (this._hoverHandler) return;
    this._ensureHoverTooltipEl();
    const scene = this.viewer.scene;
    const handler = new window.Cesium.ScreenSpaceEventHandler(scene.canvas);
    handler.setInputAction((movement) => {
      const pos = movement && movement.endPosition;
      if (!pos) {
        this._hideTooltip();
        return;
      }
      const picked = scene.pick(pos);
      let handled = false;

      if (picked && picked.id) {
        const entity = picked.id;
        // 处理本图层轮廓线实体或面实体
        const isOutlineEntity =
          this.outlineDataSource &&
          this.outlineDataSource.entities &&
          this.outlineDataSource.entities.values &&
          this.outlineDataSource.entities.values.indexOf(entity) !== -1;

        const isPolygonEntity =
          this.dataSource &&
          this.dataSource.entities &&
          this.dataSource.entities.values &&
          this.dataSource.entities.values.indexOf(entity) !== -1 &&
          !!entity.polygon;

        if (isOutlineEntity || isPolygonEntity) {
          let props = {};
          try {
            if (entity.properties && typeof entity.properties.getValue === "function") {
              props = entity.properties.getValue(window.Cesium.JulianDate.now()) || {};
            } else if (entity.properties) {
              props = entity.properties || {};
            }
          } catch (e) {
            props = {};
          }
          const html = this._formatPropsToHtml(props);
          if (html) {
            this._showTooltipAt(pos.x, pos.y, html);
            handled = true;
          }
        }
      }

      // 若未拾取到实体，进行兜底：将鼠标点转为经纬度并做面内判断
      if (!handled && Array.isArray(this._turfFeatures) && this._turfFeatures.length) {
        let cartesian = scene.pickPosition(pos);
        if (!cartesian) {
          cartesian = this.viewer.camera.pickEllipsoid(
            pos,
            scene.globe && scene.globe.ellipsoid
          );
        }
        if (cartesian) {
          const carto = window.Cesium.Cartographic.fromCartesian(cartesian);
          const lon = window.Cesium.Math.toDegrees(carto.longitude);
          const lat = window.Cesium.Math.toDegrees(carto.latitude);
          const pt = turf.point([lon, lat]);
          for (const tf of this._turfFeatures) {
            try {
              if (turf.booleanPointInPolygon(pt, tf)) {
                const html = this._formatPropsToHtml(tf.properties || {});
                if (html) {
                  this._showTooltipAt(pos.x, pos.y, html);
                  handled = true;
                }
                break;
              }
            } catch (e) {}
          }
        }
      }

      if (!handled) this._hideTooltip();
    }, window.Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    this._hoverHandler = handler;
  }

  _destroyHoverTooltip() {
    if (this._hoverHandler) {
      this._hoverHandler.destroy();
      this._hoverHandler = null;
    }
    if (this._hoverTooltipEl && this._hoverTooltipEl.parentNode) {
      this._hoverTooltipEl.parentNode.removeChild(this._hoverTooltipEl);
      this._hoverTooltipEl = null;
    }
  }

  updateStyle(styleConfig = {}) {
    this.style = { ...this.style, ...styleConfig };
    if (this.dataSource) {
      const { color, alpha, strokeWidth } = this.style;
      const entities = this.dataSource.entities.values;
      entities.forEach((entity) => {
        if (entity && entity.polygon) {
          // 面透明填充便于拾取；边框仍由贴地 polyline 控制
          entity.polygon.fill = true;
          entity.polygon.outline = false;
          entity.polygon.material = window.Cesium.Color.TRANSPARENT;
        }
      });
    }
    if (this.outlineDataSource) {
      const { color, strokeWidth } = this.style;
      const entities = this.outlineDataSource.entities.values;
      entities.forEach((entity) => {
        if (entity && entity.polyline) {
          entity.polyline.width = strokeWidth;
          entity.polyline.material = window.Cesium.Color.fromCssColorString(color);
        }
      });
    }
  }

  /**
   * 高亮显示选中面要素（只绘制贴地线框）
   * @param {Object} geojson FeatureCollection，包含 Polygon/MultiPolygon
   * @param {Object} options { color?: string, width?: number, flyTo?: boolean }
   */
  highlight(geojson, options = {}) {
    if (!geojson || !geojson.features || !Array.isArray(geojson.features)) return;

    // 清除已有高亮
    if (this.highlightDataSource) {
      this.viewer.dataSources.remove(this.highlightDataSource, true);
      this.highlightDataSource = null;
    }

    const colorStr = options.color || "#00FFFF"; // 青色高亮
    const lineWidth = options.width || Math.max(3, this.style.strokeWidth + 2);
    const flyTo = options.flyTo !== false; // 默认飞到

    const highlightDS = new window.Cesium.CustomDataSource("affected-houses-highlight");

    // 计算范围（用于飞到）
    let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;

    const addRingPolyline = (ring) => {
      // 更新范围
      ring.forEach(([lon, lat]) => {
        if (lon < minLon) minLon = lon;
        if (lat < minLat) minLat = lat;
        if (lon > maxLon) maxLon = lon;
        if (lat > maxLat) maxLat = lat;
      });

      const flat = ring.flat();
      const positions = window.Cesium.Cartesian3.fromDegreesArray(flat);
      highlightDS.entities.add({
        polyline: {
          positions,
          clampToGround: true,
          width: lineWidth,
          material: window.Cesium.Color.fromCssColorString(colorStr),
        },
      });
    };

    geojson.features.forEach((feature) => {
      const geometry = feature && feature.geometry;
      if (!geometry || !geometry.type || !geometry.coordinates) return;
      const type = geometry.type;
      const coords = geometry.coordinates;

      if (type === "Polygon") {
        coords.forEach((ring) => addRingPolyline(ring));
      } else if (type === "MultiPolygon") {
        coords.forEach((poly) => {
          poly.forEach((ring) => addRingPolyline(ring));
        });
      }
    });

    this.viewer.dataSources.add(highlightDS);
    this.highlightDataSource = highlightDS;

    if (flyTo && isFinite(minLon) && isFinite(minLat) && isFinite(maxLon) && isFinite(maxLat)) {
      const zoomOutFactor = options.zoomOutFactor != null ? options.zoomOutFactor : 0.25; // 默认四周留白25%
      const padLon = Math.max((maxLon - minLon) * zoomOutFactor, 0.001);
      const padLat = Math.max((maxLat - minLat) * zoomOutFactor, 0.001);
      const rect = window.Cesium.Rectangle.fromDegrees(
        minLon - padLon,
        minLat - padLat,
        maxLon + padLon,
        maxLat + padLat
      );
      this.viewer.camera.flyTo({
        destination: rect,
        duration: 1.0,
      });
    }
  }
}

export default new AffectedHousesLayer();
