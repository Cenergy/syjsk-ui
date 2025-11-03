import eventBus from "@/utils/EventBus";

import BaseLayer from "./baseLayer";

class DamMonitorLayer extends BaseLayer {
  constructor(options) {
    super(options);
    this.bridgeEntity = null;
  }
  async show() {
    const { viewer,id } = this;
    // console.log("🚀 ~ DamMonitorLayer ~ show ~ viewer:", viewer);
    
    // 绘制桥洞
    this.bridgeEntity = viewer.entities.add({
      name: 'bridge',
      polylineVolume: {
        positions: Cesium.Cartesian3.fromDegreesArray([
          // 桥洞路径坐标
          113.89800526754637,22.80733028750255,
          113.89900526754637,22.80653028750255,
        ]),
        shape: [
          // 桥洞截面形状
          new Cesium.Cartesian2(-10, 0),
          new Cesium.Cartesian2(10, 0),
          new Cesium.Cartesian2(10, 20),
          new Cesium.Cartesian2(-10, 20)
        ],
        material: new Cesium.ColorMaterialProperty(Cesium.Color.RED)
      }
    });

    this.hasLoaded = true;
  }
  hide() {
    if(this.bridgeEntity) {
      this.viewer.entities.remove(this.bridgeEntity);
      this.bridgeEntity = null;
    }
  }
  setLegend(visible = true) {
  
  }
}

const entity = new DamMonitorLayer();
export default entity;
