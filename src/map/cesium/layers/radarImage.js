import BaseLayer from "./baseLayer";
import * as request from "@/api/map";
import * as styles from "../styles";
import eventBus from "../../../utils/EventBus";
import { min } from "@sakitam-gis/kriging";
import { Message } from 'element-ui'
class radarImage extends BaseLayer {
  constructor(options) {
    super(options);
    this.radarEntity = null;
    this.intervalId = null;
    this.currentIndex = 0;
    this.radarImageGroup = []; // 存储加载的图片
  }
  async show() {
    const { viewer, id } = this;
    
    //时间格式化
    var date = new Date()
      .toLocaleDateString()
      .split("/")
      .map((item) => {
        if (item < 10) {
          return "0" + item;
        } else {
          return item;
        }
      })
      .join("");
    var year = date.substring(0, 4);
    const yyYear = date.substring(2, 4);
    var month = date.substring(4, 6);
    const forecastTime = new Date(new Date().getTime() - 20 * 60 * 1000);
    const forecastMinute = forecastTime.getMinutes();
    const forecastHour = ("0" + forecastTime.getHours()).slice(-2);
    const day = ("0" + forecastTime.getDate()).slice(-2);
    const recentForecastMinute = Math.floor(forecastMinute / 6) * 6;
    const recentForecastMinuteStr =
      recentForecastMinute < 10
        ? `0${recentForecastMinute}`
        : recentForecastMinute;

    const forecastTimeStr = `${year}${month}${day}${forecastHour}${recentForecastMinuteStr}`;
    const forecastTimeStr1 = `${yyYear}${month}${day}${forecastHour}${recentForecastMinuteStr}`;
    //图例

    const baseRequestURL = `/radar/data_cache/radar/Cotrec_QPF/1h/${year}/${month}/${day}/${forecastTimeStr}/`;
    var positions = [
      Cesium.Cartesian3.fromDegrees(108.505, 19.0419),
      Cesium.Cartesian3.fromDegrees(117.505, 19.0419),
      Cesium.Cartesian3.fromDegrees(117.505, 26.0419),
      Cesium.Cartesian3.fromDegrees(108.505, 26.0419),
    ];
    // 预加载所有图像
    const preloadImages = async () => {
      const images = [];
      for (let i = 0; i < 20; i++) {
        const img = new Image();
        img.src = getRadarImageUrl(i);
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = () => {
            Message.error("暂无数据")
            reject(new Error(`Failed to load image ${i}`));
          };
        });
        images.push(img);
      }
      return images;
    };
    const radarImageGroup = await preloadImages(); // 等待所有图像加载完成

    function getRadarImageUrl(index) {
      const url = `${baseRequestURL}${index + 1}.png?r=${forecastTimeStr1}`; // 请求图片
      return url;
    }
    //第一张图片
    this.radarEntity = viewer.entities.add({
      name: "radarAnimation",
      polygon: {
        hierarchy: new Cesium.PolygonHierarchy(positions),
        material: new Cesium.ImageMaterialProperty({
          image: radarImageGroup[0], // 初始图片
          transparent: true,
        }),
      },
    });
    eventBus.emit("setLegend", {
      type: "radar",
      data: {
        yy: year,
        mm: month,
        dd: day,
        hh: forecastHour,
        mi: recentForecastMinuteStr,
      },
    });
    //轮播
    this.intervalId = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % 20; //模运算实现循环
      const legendTime = new Date(
        forecastTime.getTime() + this.currentIndex * 6 * 60 * 1000
      );
      const legendTimeHour = ("0" + legendTime.getHours()).slice(-2);
      const legendTimeMin = Math.floor(legendTime.getMinutes() / 6) * 6;
      const legendTimeMinuteStr =
        legendTimeMin < 10 ? `0${legendTimeMin}` : legendTimeMin;
      eventBus.emit("setLegend", {
        type: "radar",
        data: {
          yy: year,
          mm: month,
          dd: day,
          hh: legendTimeHour,
          mi: legendTimeMinuteStr,
        },
      });
      this.radarEntity.polygon.material.image = new Cesium.ConstantProperty(
        radarImageGroup[this.currentIndex]
      );
    }, 2500);
    this.hasLoaded = true;
  }
  hide() {
    const { viewer, id } = this;
    //清除定时器
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      viewer.entities.remove(this.radarEntity);
    }
    this.currentIndex = 0; //重置索引
    this.radarEntity = null;
    eventBus.emit("closeLegend", {
      type: "radar",
    });
  }
}
export default new radarImage();
