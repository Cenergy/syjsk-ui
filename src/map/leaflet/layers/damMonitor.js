import eventBus from "@/utils/EventBus";
import * as geoUtils from "../tools/geoUtils";

import BaseLayer from "./baseLayer";
import { getList } from "@/api/map/engineering";

class DamMonitorLayer extends BaseLayer {
  constructor(options) {
    super(options);
    this.legend = {
      label: "大坝监测",
      url: styles.damMonitorIcon.options.iconUrl,
    };
    this.timeTaskTimer = null;
  }
  async show() {
    const { mapSdk } = this;
    const id = this.id;

    // 添加定时任务
    // this._addTimeTask();
    if (this.hasLoaded) {
      mapSdk.showLayers(id);
      return;
    }

    const geoData = await this._getReserviorFeature();
    console.log("🚀 ~ DamMonitorLayer ~ show ~ geoData:", geoData);

    mapSdk.map.createPane(id);
    mapSdk.map.getPane(id).style.zIndex = 520;

    mapSdk.layerManager.addBatchJsonLayer({
      data: geoData,
      id,
      visible: true,
      pointToLayer: (feature, latlng) => {
        const { properties } = feature;
        const { tm, ccsw, stcd } = properties;
        const time = this._handlePublishHour(tm);
        let marker = L.marker(latlng, {
          icon: styles.damMonitorIcon,
          pane: id,
        });
        if (!this.isSmallMap) {
          marker.on("click", (e) => {
            const { properties = {} } = e.target.feature;
            const { latlng } = e;
            eventBus.emit("openMapDialog", {
              type: "DamMonitor",
              data: properties,
            });
            mapSdk.showPulse({ latlng, fillColor: "rgba(0,0,0,0)", count: 3 });
          });
        }

        marker.on("mouseover", (e) => {
          const { properties } = e.target.feature;
          const { stnm, name } = properties;
          this.openPointPopup({
            content: stnm || name,
            latlng: e.latlng,
            options: {},
          });
          marker.setIcon(marker.defaultOptions.icon.setSize([30, 30]));
        });
        marker.on("mouseout", (e) => {
          this.closePointPopup();
          marker.setIcon(marker.defaultOptions.icon.setSize());
        });
        return marker;
      },
    });
    this.hasLoaded = true;
  }
  // async show() {
  //   const { mapSdk } = this;
  //   const id = this.id;
  //   if (this.hasLoaded) {
  //     mapSdk.showLayers(id);
  //     return;
  //   }
  //   const { data = [] } = await request.getReservoirData();

  //   if (!data.length) return;
  //   const [firstData] = data;
  //   const geoData = geoUtils.dataToGeo(data, { lat: "LAT", lon: "LON" });

  //   mapSdk.map.createPane(id);
  //   mapSdk.map.getPane(id).style.zIndex = 520;

  //   mapSdk.layerManager.addBatchJsonLayer({
  //     data: geoData,
  //     id,
  //     visible: true,
  //     pointToLayer: (feature, latlng) => {
  //       const marker = L.marker(latlng, {
  //         icon: styles.damMonitorIcon,
  //         pane: id,
  //       });
  //       marker.on("click", (e) => {
  //         const { latlng } = e;
  //         eventBus.emit("openMapDialog", {
  //           type: "Reservoir",
  //           data: e.target.feature.properties || {},
  //         });
  //         mapSdk.showPulse({ latlng, fillColor: "rgba(0,0,0,0)", count: 3 });
  //       });
  //       marker.on("mouseover", function (e) {
  //         this.openPopup();
  //         marker.setIcon(marker.defaultOptions.icon.setSize([30, 30]));
  //       });
  //       marker.on("mouseout", function (e) {
  //         this.closePopup();
  //         marker.setIcon(marker.defaultOptions.icon.setSize());
  //       });
  //       return marker;
  //     },
  //     onEachFeature(feature, layer) {
  //       const html = componentToHtml({
  //         component: mapPopup.TestPopup,
  //         props: {
  //           feature,
  //         },
  //       });
  //       layer.bindPopup(html, {
  //         offset: L.point(0, -10),
  //       });
  //     },
  //   });
  //   this.hasLoaded = true;
  // }
  hide() {
    const id = this.id;
    // 取消定时任务
    this._cancleTimeTask();
    if (this.hasLoaded) {
      this.mapSdk.hideLayer(id);
    }
  }
  setLegend(visible = true) {
    this.mapSdk.showLegends({
      legends: [this.legend],
      visible,
    });
  }
  _effectHandle(feature) {
    console.log("🚀 ~ ReservoirLayer ~ _effectHandle ~ feature:", feature);
  }

  async _getReserviorFeature() {
    const { data } = await getList();
    console.log("🚀 ~ DamMonitorLayer ~ _getReserviorFeature ~ data:", data);
    const validData = data.filter((item) => item.lgtd && item.lttd);
    return geoUtils.dataToGeo(validData, {
      lat: "lttd",
      lon: "lgtd",
    });
  }

  _addTimeTask() {
    this.timeTaskTimer = setInterval(async () => {
      const layer = this.mapSdk.getLayer(this.id);
      const geoData = await this._getReserviorFeature();
      layer.addData(geoData);
    }, this.timeInterval);
  }
  _cancleTimeTask() {
    if (!this.timeTaskTimer) return;
    clearInterval(this.timeTaskTimer);
  }

  _handlePublishHour(post_modified) {
    // 拿到当前时间戳和发布时的时间戳，然后得出时间戳差
    const curTime = new Date();
    const postTime = new Date(post_modified);
    const timeDiff = curTime.getTime() - postTime.getTime();

    // 单位换算
    const min = 60 * 1000;
    const hour = min * 60;

    // 计算发布时间距离当前时间的小时
    const exceedHour = Math.floor(timeDiff / hour);
    return exceedHour;
  }
}

const entity = new DamMonitorLayer();
export default entity;
