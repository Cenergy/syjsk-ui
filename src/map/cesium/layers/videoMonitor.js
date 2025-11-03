import BaseLayer from "./baseLayer";
import * as request from "@/api/map";
import * as styles from "../styles";
import eventBus from "../../../utils/EventBus";

class videoMonitor extends BaseLayer {
  constructor(options) {
    // 调用父类的构造函数，并传入参数options
    super(options);
    // 初始化legend对象，包含label和url属性
    this.legend = {
      label: "视频监控",
      url: styles.videoMonitorIcon.options.iconUrl,
    };
    this.videoMonitorPointEntity = [];
  }
  async show() {
    const { viewer, id } = this;
     this.setLegend(); //设置图例
    if (this.hasLoaded) {
      //显示entity
      if (
        this.videoMonitorPointEntity &&
        this.videoMonitorPointEntity.length > 0
      ) {
        this.videoMonitorPointEntity.forEach((entity) => {
          entity.show = true;
        });
      }
      return;
    }
    //请求接口数据
    const { code, data } = await request.getvideoMonitorPointList();
    if (code !== 200 || !data.length) return;
    //去重复stcd对象
    var uniqueData = [];
    var stcdList = [];
    for(var item of data){
      if(!stcdList.includes(item.stcd)){
        uniqueData.push(item);
        stcdList.push(item.stcd);
      } 
    } 
    uniqueData.forEach((item) => {
      const entity = viewer.entities.add({
        id: item.stcd,
        name: item.name,
        position: Cesium.Cartesian3.fromDegrees(
          parseFloat(item.x),
          parseFloat(item.y)
        ),
        type: "videoMonitorPoint",
        properties: item,
        point: {
          pixelSize: 3,
          color: Cesium.Color.RED,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
        },
        billboard: {
          // 添加图标
          image: require("@/assets/map/videoMonitor.png"), // 替换为你的图标路径
          width: 60,
          height: 60,
          scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e7, 0.5),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
          text: item.name,
          font: "10pt sans-serif",
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          verticalOrigin: Cesium.VerticalOrigin.TOP,
          pixelOffset: new Cesium.Cartesian2(0, -80),
          showBackground: true,
          backgroundColor: new Cesium.Color(0.165, 0.165, 0.165, 0.7),
        },
      });
      this.videoMonitorPointEntity.push(entity);
    });
    //对图层监听事件
    var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    //点击事件
    handler.setInputAction(function (e) {
      var pick = viewer.scene.pick(e.position);
      if (pick && pick.id) {
        var entityData = pick.id;
        if (entityData.type === "videoMonitorPoint") {
          //点击图标emit id
          // console.log("点击到了：",entityData.position, entityData.id, entityData.type);
          // eventBus.emit("openJLDDetail", entityData.id);
           viewer.camera.flyTo({
             destination: Cesium.Cartesian3.fromDegrees(
              Number(entityData.properties.x._value) ,
              Number(entityData.properties.y._value) ,
               10
             ),
              // destination: entityData.position._value,
             orientation: {
               heading: Cesium.Math.toRadians(348.4202942851978),
               pitch: Cesium.Math.toRadians(-89.74026687972041),
               roll: Cesium.Math.toRadians(0),
             },
             complete: function callback() {
               // 定位完成之后的回调函数
             },
           });
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.hasLoaded = true;
  }
   setLegend() {
     eventBus.emit("setLegend", {
      type: "pointLayer",
      data:this.legend,
    });
  }
   delLegend() {
     eventBus.emit("closeLegend", {
      type: "pointLayer",
      data:this.legend,
    });
  }
  hide() {
    // const { viewer, id } = this;
    // if (this.waterLoggingPointEntity&&this.waterLoggingPointEntities.length > 0) {
    //   viewer.entities.remove(this.waterLoggingPointEntity);
    //   this.waterLoggingPointEntity = null;
    // }
    this.delLegend();
    if (
      this.videoMonitorPointEntity &&
      this.videoMonitorPointEntity.length > 0
    ) {
      
      this.videoMonitorPointEntity.forEach((entity) => {
        entity.show = false;
      });
    }
  }
}
export default new videoMonitor();
