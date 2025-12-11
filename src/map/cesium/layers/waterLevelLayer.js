import { constant } from "@/map";
import eventBus from "@/utils/EventBus";
import BaseLayer from "./baseLayer";

const { EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT, DEFAULT_WATER_LEVEL_COLOR,MODEL_3DTILES_INFO_LIST } = constant;

class WaterLevelLayer extends BaseLayer {
  constructor(options) {
    super(options);
    this.dataSources = new Map();
    // 组装图例项：使用常量中的水位颜色配置
    const items = [
      ...EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT,
    ].map((item) => ({ label: item.label, color: item.color }));
    this.legend = {
      label: "水位影响范围图例",
      items,
    };
  }

  async add(options = {}) {
    const { id, zIndex = 100,height = 175 } = options;
    const idStr = String(id);
    if (this.dataSources.has(idStr)) {
      this.show(idStr);
      return;
    }

    const selectWaterLevelInfo = [DEFAULT_WATER_LEVEL_COLOR, ...EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT].find(
      (item) => item.id === id
    );



    if (!selectWaterLevelInfo) {
      return;
    }

    const { loadChunk } = selectWaterLevelInfo;
    // 当 loadChunk 为 true 时，按区域名称分块加载对应的 GeoJSON
    if (loadChunk) {
      const waterLevelNameList = MODEL_3DTILES_INFO_LIST.map((item) => item.name);
      const strokeColor = window.Cesium.Color.fromCssColorString(
        selectWaterLevelInfo.color
      );
      const fillColor = window.Cesium.Color.fromCssColorString(
        selectWaterLevelInfo.color
      ).withAlpha(selectWaterLevelInfo.alpha || 0.3);

      for (const info of MODEL_3DTILES_INFO_LIST) {
        const {name: areaName,height:baseHeight}=info;
        
        const path = `/geodata/effects/${areaName}${id}.geojson`;
        console.log("🚀 ~ WaterLevelLayer ~ add (chunk) ~ path:", path);
        try {
          const resp = await fetch(path);
          if (!resp.ok) {
            console.warn("分块水位加载失败:", path, resp.status);
            continue;
          }
          const geoJsonData = await resp.json();
          const dataSource = await window.Cesium.GeoJsonDataSource.load(
            geoJsonData,
            {
              stroke: strokeColor,
              fill: fillColor,
              strokeWidth: 10,
              clampToGround: false,
            }
          );
          const entities = dataSource.entities.values;
          entities.forEach(function (entity) {
            if (entity && entity.polygon) {
              // entity.polygon.zIndex = zIndex;
              const height = baseHeight+(Number(id)-2000)*0.1;
              console.log("🚀 ~ WaterLevelLayer ~ add ~ caclHeight:", height);
              entity.polygon.height = height;
            }
          });
          dataSource.name = `water-level-${areaName}-${id}`;
          dataSource.zIndex = zIndex;
          await this.viewer.dataSources.add(dataSource);
          // 使用组合键进行缓存，便于 show/hide/remove 按组操作
          this.dataSources.set(`${idStr}:${areaName}`, dataSource);
        } catch (err) {
          console.error("分块水位加载异常:", path, err);
        }
      }
      // 按 zIndex 置顶，保持图层顺序
      this.sortDataSourcesByZIndex();
      // 分块模式下不再加载合并文件，直接返回
      this.setLegend();
      return;
    }

    try {
      const response = await fetch(`/geodata/effects/${id}.geojson`);
      const geoJsonData = await response.json();

      const dataSource = await window.Cesium.GeoJsonDataSource.load(
        geoJsonData,
        {
          stroke: window.Cesium.Color.fromCssColorString(
            selectWaterLevelInfo.color
          ),
          fill: window.Cesium.Color.fromCssColorString(
            selectWaterLevelInfo.color
          ).withAlpha(selectWaterLevelInfo.alpha||0.3),
          strokeWidth: 10,
          clampToGround: true,
        }
      );
      const entities = dataSource.entities.values;
      entities.forEach(function (entity) {
        if (entity && entity.polygon) {
          entity.polygon.zIndex = zIndex; // 或者其他数字来调整层级
          // entity.polygon.height = height;
        }
      });

      dataSource.name = `water-level-${idStr}`;
      dataSource.zIndex = zIndex;
      await this.viewer.dataSources.add(dataSource);
      this.dataSources.set(idStr, dataSource);
      this.sortDataSourcesByZIndex();

      // 展示图例
      this.setLegend();
    } catch (error) {
      console.error("加载影响范围线数据失败:", error);
    }
  }

  remove(id) {
    const idStr = String(id);
    if (this.dataSources.has(idStr)) {
      const dataSource = this.dataSources.get(idStr);
      this.viewer.dataSources.remove(dataSource, true);
      this.dataSources.delete(idStr);
    }
    // 兼容分块键：移除所有以 `${id}:` 开头的数据源
    const groupPrefix = `${idStr}:`;
    const keys = Array.from(this.dataSources.keys()).filter((k) => String(k).startsWith(groupPrefix));
    keys.forEach((key) => {
      const ds = this.dataSources.get(key);
      if (ds) this.viewer.dataSources.remove(ds, true);
      this.dataSources.delete(key);
    });
    // 若全部移除则关闭图例
    if (this.dataSources.size === 0) {
      this.delLegend();
    }
  }

  removeAll() {
    for (const id of this.dataSources.keys()) {
      this.remove(id);
    }
    // 兜底关闭图例
    this.delLegend();
  }

  show(id) {
    const idStr = String(id);
    if (this.dataSources.has(idStr)) {
      const dataSource = this.dataSources.get(idStr);
      dataSource.show = true;
      return;
    }
    // 兼容分块键：显示所有以 `${id}:` 开头的数据源
    const groupPrefix = `${idStr}:`;
    const keys = Array.from(this.dataSources.keys()).filter((k) => String(k).startsWith(groupPrefix));
    keys.forEach((key) => {
      const ds = this.dataSources.get(key);
      if (ds) ds.show = true;
    });
  }

  hide(id) {
    const idStr = String(id);
    if (this.dataSources.has(idStr)) {
      const dataSource = this.dataSources.get(idStr);
      dataSource.show = false;
      return;
    }
    // 兼容分块键：隐藏所有以 `${id}:` 开头的数据源
    const groupPrefix = `${idStr}:`;
    const keys = Array.from(this.dataSources.keys()).filter((k) => String(k).startsWith(groupPrefix));
    keys.forEach((key) => {
      const ds = this.dataSources.get(key);
      if (ds) ds.show = false;
    });
  }

  sortDataSourcesByZIndex() {
    const sortedDataSources = Array.from(this.dataSources.values()).sort(
      (a, b) => (a.zIndex || 0) - (b.zIndex || 0)
    );
    sortedDataSources.forEach((dataSource) => {
      this.viewer.dataSources.raiseToTop(dataSource);
    });
  }

  setLegend() {
    eventBus.emit("setLegend", {
      type: "waterLevel",
      data: this.legend,
    });
  }

  delLegend() {
    eventBus.emit("closeLegend", {
      type: "waterLevel",
      data: this.legend,
    });
  }
}

export default new WaterLevelLayer();
