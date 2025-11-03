import BaseLayer from "./baseLayer";
import * as request from "@/api/map";
import * as styles from "../styles";
import eventBus from "../../../utils/EventBus";
import { min } from "@sakitam-gis/kriging";
import { Message } from "element-ui";
class rainfallForecast extends BaseLayer {
  // 构造函数，初始化参数
  constructor(options) {
    super(options);
    this.gridEntityGroup = [];
    this.gridCenterEntityGroup = [];
    this.hasLoaded = false;
    this.selectedEntity = null;
  }
  async show() {
    const { viewer, id } = this;
    viewer.scene.camera.flyTo({
      //将经度、纬度、高度的坐标转换为笛卡尔坐标
      destination: {x: -2397630.3523386256, y: 5404185.590720737, z: 2464254.2513874564},
      orientation: {
        heading: 0.0106075178243481,
        pitch: -1.5615564701753208,
        roll: 0,
      },
    });
    if (this.hasLoaded) {
      // this.gridEntityGroup.forEach((item) => {
      //   item.show = true;
      // });
      this.gridCenterEntityGroup.forEach((item) => {
        item.show = true;
      });
    }
    const { code, data } = await request.getQxGrid();
    data.forEach((item) => {
      const center = [item.x, item.y];
      const xMin = item.x1;
      const yMin = item.y1;
      const xMax = item.x2;
      const yMax = item.y2;
      //中心点数据
      // const gridCenterEntity = viewer.entities.add({
      //   position: Cesium.Cartesian3.fromDegrees(center[0], center[1]),
      //   label: {
      //     text: "0",
      //     font: "14pt sans-serif",
      //     style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      //     outlineWidth: 2,
      //     verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      //     pixelOffset: new Cesium.Cartesian2(0, -10),
      //     distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
      //       0,
      //       40000
      //     ),
      //   },
      // });
      //网格
      const gridEntity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(center[0], center[1]),
        properties: item,
        type: "rainfallForecastGrid",
        rectangle: {
          coordinates: Cesium.Rectangle.fromDegrees(xMin, yMin, xMax, yMax),
          outline: true,
          extrudedHeight: 0,
          material: Cesium.Color.WHITE.withAlpha(0.01),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 100,
          // clampToGround: true, //贴地
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
            0,
            40000
          ),
        },
      });
      //对图层监听事件

      this.gridEntityGroup.push(gridEntity);
      // this.gridCenterEntityGroup.push(gridCenterEntity);
    });
    var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((e) => {
      if (this.selectedEntity) {
        this.selectedEntity.rectangle.material =
          Cesium.Color.WHITE.withAlpha(0.01);
      }
      var pick = viewer.scene.pick(e.position);
      if (pick && pick.id) {
        var entityData = pick.id;
        if (entityData.type === "rainfallForecastGrid") {
          var gridProperties = entityData.properties.getValue(
            Cesium.JulianDate.now()
          );
          eventBus.emit("openGridInfo", gridProperties);
          entityData.rectangle.material = Cesium.Color.WHITE.withAlpha(0.5);
          this.selectedEntity = entityData;
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.hasLoaded = true;
  }
  hide() {
    if (this.gridEntityGroup.length > 0) {
      this.gridEntityGroup.forEach((item) => {
        item.show = false;
      });
      // this.gridCenterEntityGroup.forEach((item) => {
      //   item.show = false;
      // });
    }
  }
}
export default new rainfallForecast();
