import BaseLayer from "./baseLayer";
import * as request from "@/api/map";
import * as styles from "../styles";
import eventBus from "../../../utils/EventBus";
import { min } from "@sakitam-gis/kriging";
import { Message } from "element-ui";
import psfqData from "../../../mock/data/psfq.json";
class drainageZone extends BaseLayer {
  constructor(options) {
    super(options);
    this.drainageZoneGroup = [];
    this.drainageZoneEntity = [];
    this.detailData = {
      drainageArea: 0,
      depth: 0,
      drainageZoneArea: 0,
      capacity: 0,
    };
  }
  async show(sendData) {
    const { viewer, id } = this;
    viewer.screenSpaceEventHandler.removeInputAction(
      Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    );
    // 加载GeoJSON数据
    var heightValue = 8;
    if (sendData) {
      this.detailData = sendData;
    }

    this.drainageZoneGroup = psfqData.features;
    this.drainageZoneGroup.forEach((item, index) => {
      var coorGroup = item.geometry.coordinates[0][0].flat();
      var entity = viewer.entities.add({
        polygon: {
          show: true,
          hierarchy: Cesium.Cartesian3.fromDegreesArray(coorGroup),
          height: 10,
          material: Cesium.Color.ORANGE.withAlpha(0.7),
          outline: true,
          outlineColor: Cesium.Color.YELLOW,
        },
        label: {
          show: true,
          text: `排水面积：小于${this.detailData.drainageArea}m²\n积水深度：${
            this.detailData.drainageArea == 0
              ? "无排水"
              : this.detailData.drainageArea
          }\n排水分区面积：${
            this.detailData.drainageZoneArea
          }km²\n排水分区过流能力：${this.detailData.capacity}m³/s`,
          color: Cesium.Color.fromCssColorString("#000"),
          font: "normal 25px MicroSoft YaHei",
          showBackground: true,
          scale: 0.6,
          horizontalOrigin: Cesium.HorizontalOrigin.LEFT_CLICK,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        },
        position: Cesium.Cartesian3.fromDegrees(113.903545, 22.80307, 40),
        type: "psfq",
        properties: item.properties,
      });
    });
    this.hasLoaded = true;
  }
  hide() {
    const { viewer, id } = this;
    const entities = this.viewer.entities.values;
    for (let i = 0; i < entities.length; i++) {
      if (entities[i].type === "psfq") {
        // entities[i].show = false;
        viewer.entities.remove(entities[i]);
      }
    }
    viewer.screenSpaceEventHandler.setInputAction(
      Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    );
  }
}
export default new drainageZone();
