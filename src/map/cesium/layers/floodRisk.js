import BaseLayer from "./baseLayer";
import * as request from "@/api/map";
import * as styles from "../styles";
import eventBus from "../../../utils/EventBus";

class floodRisk extends BaseLayer {
  constructor(options) {
    // 调用父类的构造函数，并传入参数options
    super(options);
    this.floodRiskEntity = null;
    this.hasLoaded = false;
    this.currentImageName = 4;
  }
  // 异步显示
  async show() {
    // 获取viewer和id
    const { viewer, id } = this;
    // 如果已经加载过
    if (this.hasLoaded) {
      this.floodRiskEntity.polygon.material.image = require(`@/assets/map/floodRisk/${this.currentImageName}.png`);
    }
    eventBus.on("changeFloodRiskImage", (imageName) => {
      if (this.floodRiskEntity) {
        this.currentImageName = imageName;
        this.floodRiskEntity.polygon.material.image = require(`@/assets/map/floodRisk/${imageName}.png`);
      }
    });
    var positions = [
      Cesium.Cartesian3.fromDegrees(113.768547, 22.695829),
      Cesium.Cartesian3.fromDegrees(113.978653, 22.695829),
      Cesium.Cartesian3.fromDegrees(113.978653, 22.834384),
      Cesium.Cartesian3.fromDegrees(113.768547, 22.834384),
    ];
    this.floodRiskEntity = viewer.entities.add({
      name: "floodRiskEntity",
      polygon: {
        hierarchy: new Cesium.PolygonHierarchy(positions),
        material: new Cesium.ImageMaterialProperty({
          image: require(`@/assets/map/floodRisk/${this.currentImageName}.png`), // 初始图片
          transparent: true,
        }),
      },
    });
    this.hasLoaded = true;
  }
  hide() {
    const { viewer, id } = this;
    if (this.floodRiskEntity) {
      viewer.entities.remove(this.floodRiskEntity);
    }
    this.currentImageName = 4;
    this.hasLoaded = false;
  }
}

export default new floodRisk();
