import BaseLayer from "./baseLayer";
import * as request from "@/api/map";
import * as styles from "../styles";
import eventBus from "../../../utils/EventBus";

class vehicle extends BaseLayer {
  constructor(options) {
    super(options);
    this.legend1 = {
      label: "在线车辆",
      url: styles.vehicleOrangeIcon.options.iconUrl,
    };
    this.legend2 = {
      label: "离线车辆",
      url: styles.vehicleGrayIcon.options.iconUrl,
    };
    this.vehiclePointEntity = [];
  }
  async show() {
    const { viewer, id } = this;
    var heightValue = 10;
    this.setLegend(); //设置图例
    if (this.hasLoaded) {
      //显示entity
      if (this.vehiclePointEntity && this.vehiclePointEntity.length > 0) {
        this.vehiclePointEntity.forEach((entity) => {
          entity.show = true;
        });
      }
      return;
    }
    //请求接口数据
    const { code, vehic } = await request.getVehiclePointList(462);
    if (code !== 200 || !vehic.length) return;
    vehic.forEach((item) => {
      const status = item.status === "在线" ? "orange" : "gray";
      const entity = viewer.entities.add({
        id: item.id,
        name: item.name,
        position: Cesium.Cartesian3.fromDegrees(
          parseFloat(item.lon),
          parseFloat(item.lat),
          heightValue
        ),
        type: "vehicle",
        properties: item,
        point: {
          pixelSize: 5,
          color: Cesium.Color.BLUE,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
          clampToGround: true //贴地
        },
        billboard: {
          image: require(`@/assets/map/qxcl_${status}.png`), 
          width: 60,
          height: 60,
          scaleByDistance: new Cesium.NearFarScalar(1000, 1.0, 10000, 0.8),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });
      this.vehiclePointEntity.push(entity);
    });
    //对图层监听事件
    var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    //点击事件
    handler.setInputAction(function (e) {
      var pick = viewer.scene.pick(e.position);
      if (pick && pick.id) {
        var entityData = pick.id;
        if (entityData.type === "vehicle") {
          // 点击图标emit id
           var vehicleProperties = entityData.properties.getValue(
            Cesium.JulianDate.now()
          );
          console.log(vehicleProperties,"vehicleProperties");
          eventBus.emit("openCarCamera", vehicleProperties);
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    this.hasLoaded = true;
  }
  setLegend() {
    eventBus.emit("setLegend", {
      type: "pointLayer",
      data: this.legend1,
    });
    eventBus.emit("setLegend", {
      type: "pointLayer",
      data: this.legend2,
    });
  }
  delLegend() {
    eventBus.emit("closeLegend", {
      type: "pointLayer",
      data: this.legend1,
    });
    eventBus.emit("closeLegend", {
      type: "pointLayer",
      data: this.legend2,
    });
  }
  hide() {
    this.delLegend();
    if (this.vehiclePointEntity && this.vehiclePointEntity.length > 0) {
      this.vehiclePointEntity.forEach((entity) => {
        entity.show = false;
      });
    }
  }
}
export default new vehicle();
