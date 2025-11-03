import BaseLayer from "./baseLayer";
import * as request from "@/api/map";
import * as styles from "../styles";
import eventBus from "../../../utils/EventBus";

class rainMonitor extends BaseLayer {
  constructor(options) {
    // 调用父类的构造函数，并传入参数options
    super(options);
    // 初始化legend对象，包含label和url属性
    // this.legend1 = {
    //   label: "巡查车",
    //   url: styles.protalVehicleIcon.options.iconUrl,
    // };

    this.rainMonitorPointEntity = [];
  }
  async show() {
    const { viewer, id } = this;
      viewer.scene.camera.flyTo({
      //将经度、纬度、高度的坐标转换为笛卡尔坐标
      destination: {
        x: -2396705.430787051,
        y: 5414414.642882906,
        z: 2469351.917707543,
      },
      orientation: {
        heading: 6.231715911961878,
        pitch: -1.5706808202460758,
        roll: 0,
      },
    });
    var heightValue = 500;
     this.setLegend();
    if (this.hasLoaded) {
      //显示entity
      if (
        this.rainMonitorPointEntity &&
        this.rainMonitorPointEntity.length > 0
      ) {
        this.rainMonitorPointEntity.forEach((entity) => {
          entity.show = true;
        });
      }
      return;
    }
    //请求接口数据
    const { code, data } = await request.getWaterLoggingPointList();
    if (code !== 200 || !data.length) return;
   
    data.forEach((item) => {
      var color =new Cesium.Color.fromBytes(0, 253, 255, 178);
      if(item.depth30<10){
        color =new Cesium.Color.fromBytes(0, 253, 255, 178);
      }else if(item.depth30>=10&&item.depth30<25){
         color =new Cesium.Color.fromBytes(4, 229, 3, 178);
      }else if(item.depth30>=25&&item.depth30<50){
         color =new Cesium.Color.fromBytes(0, 12, 218, 178);
      }else if(item.depth30>=50&&item.depth30<100){
         color =new Cesium.Color.fromBytes(250, 243, 11, 178);
      }else if(item.depth30>=100&&item.depth30<250){
         color =new Cesium.Color.fromBytes(250, 115, 31, 178);
      }
      const entity = viewer.entities.add({
        id: `rainMonitor${item.id}`,
        name: item.name,
        position: Cesium.Cartesian3.fromDegrees(
          parseFloat(item.x),
          parseFloat(item.y),
          heightValue
        ),
        type: "rainMonitor",
        properties: item,
        label: {
          text: `${item.sspq}:${item.depth30}mm`,
          font: "10pt sans-serif",
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 4,
          outlineColor: Cesium.Color.fromBytes(57, 120, 180),
          fillColor: Cesium.Color.fromBytes(0, 0, 0),
          verticalOrigin: Cesium.VerticalOrigin.TOP,
          pixelOffset: new Cesium.Cartesian2(0, -80),
          showBackground: true,
          backgroundColor: color,
          backgroundPadding: new Cesium.Cartesian2(20, 10),
        },
      });
      this.rainMonitorPointEntity.push(entity);
    });
    this.hasLoaded = true;
  }
  setLegend() {
    eventBus.emit("setLegend", {
      type: "rainMonitor",
    });
  }
  delLegend() {
    eventBus.emit("closeLegend", {
      type: "rainMonitor",
    });
  }
  hide() {
    this.delLegend();
    if (this.rainMonitorPointEntity && this.rainMonitorPointEntity.length > 0) {
      this.rainMonitorPointEntity.forEach((entity) => {
        entity.show = false;
      });
    }
  }
}
export default new rainMonitor();
