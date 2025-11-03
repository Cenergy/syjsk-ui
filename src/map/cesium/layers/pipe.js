import BaseLayer from "./baseLayer";
import * as request from "@/api/map";
import * as styles from "../styles";
import eventBus from "../../../utils/EventBus";
import { min } from "@sakitam-gis/kriging";
import { Message } from "element-ui";
import pipeData from "../../../mock/data/PS_PIPE.json";
import pipePointData from "../../../mock/data/PS_POINT.json";
class pipe extends BaseLayer {
  constructor(options) {
    super(options);
    this.pipeDataGroup = [];
    this.pipeEntity = [];
    this.pipePointDataGroup = [];
    this.pipePointEntity = [];
    this.selectedEntity = null;
    this.selectedEntityColor = null;
    this.selectPointEntity = null;
  }
  async show() {
    const { viewer, id } = this;
    if (this.hasLoaded) {
      const entities = this.viewer.entities.values;
      for (let i = 0; i < entities.length; i++) {
        if (entities[i].type === "pipe" || entities[i].type === "pipePoint") {
          entities[i].show = true;
        }
      }
      return;
    }
    var heightValue = 10;
    //管线
    this.pipeDataGroup = pipeData.features;
    var colorPipeMap = {
      WS: [255, 0, 255],
      YS: [0, 255, 0],
      YSQ: [0, 255, 0],
      WSQ: [255, 0, 255],
      HS1: [255, 102, 0],
      HS2: [255, 102, 0],
    };
    this.pipeDataGroup.forEach((item, index) => {
      var coorGroup = item.geometry.coordinates[0].flat();
      var colorRGB = colorPipeMap[item.properties.Type] || [255, 255, 255];

      let positionsWithHeight = [];
      for (let i = 0; i < coorGroup.length; i += 2) {
        positionsWithHeight.push(coorGroup[i], coorGroup[i + 1], heightValue); // heightValue是你想要的高度
      }
      var entity = viewer.entities.add({
        polyline: {
          id: `PIPE_${item.properties.OBJECTID}`,
          // positions: Cesium.Cartesian3.fromDegreesArray(coorGroup),
          positions:
            Cesium.Cartesian3.fromDegreesArrayHeights(positionsWithHeight),
          width: item.properties.PSize / 200,
          // material: Cesium.Color.BLUE,
          material: Cesium.Color.fromBytes(
            colorRGB[0],
            colorRGB[1],
            colorRGB[2]
          ),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
            0,
            2000
          ),
          show: true,
          // clampToGround: true //贴地
        },
        type: "pipe",
        properties: item.properties,
      });
    });

    //管点

    this.pipePointDataGroup = pipePointData.features;
    this.pipePointDataGroup.forEach((item, index) => {
      var coor = item.geometry.coordinates;

      var entity = viewer.entities.add({
        id: item.properties.OBJECTID,
        name: item.properties.PRJID,
        position: Cesium.Cartesian3.fromDegrees(
          parseFloat(coor[0]),
          parseFloat(coor[1]),
          heightValue - 0.5
        ),
        type: "pipePoint",
        properties: item.properties,
        billboard: {
          // 添加图标
          image: (() => {
            try {
              return require(`@/assets/map/pipe/${item.properties.Type}.png`);
            } catch (e) {
              return require(`@/assets/map/pipe/common.png`);
            }
          })(),
          width: 9,
          height: 9,
          // scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e7, 0.5),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          // disableDepthTestDistance: Number.POSITIVE_INFINITY,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
            0,
            950                 
          ),
        },
      });
    });

    //点击事件
    var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((e) => {
      if (this.selectedEntity) {
        this.selectedEntity.polyline.material = this.selectedEntityColor;
      }
      if (this.selectPointEntity) {
        this.selectPointEntity.billboard.image = () => {
          try {
            return require(`@/assets/map/pipe/${this.selectPointEntityType}.png`);
          } catch (e) {
            return require(`@/assets/map/pipe/common.png`);
          }
        };
      }
      var pick = viewer.scene.pick(e.position);
      if (pick && pick.id) {
        var entityData = pick.id;
        if (entityData.type === "pipe") {
          var pipeProperties = entityData.properties.getValue(
            Cesium.JulianDate.now()
          );
          this.selectedEntity = entityData;
          this.selectedEntityColor = entityData.polyline.material;
          eventBus.emit("openPipeDetail", pipeProperties);
          entityData.polyline.material = Cesium.Color.YELLOW; // 设置为高亮
        } else if (entityData.type === "pipePoint") {
          var pipeProperties = entityData.properties.getValue(
            Cesium.JulianDate.now()
          );

          this.selectPointEntity = entityData;
          this.selectPointEntityType = pipeProperties.Type;
          eventBus.emit("openPipeDetail", pipeProperties);
          entityData.billboard.image = () => {
            try {
              return require(`@/assets/map/pipe/${this.selectPointEntityType}_active.png`);
            } catch (e) {
              return require(`@/assets/map/pipe/common.png`);
            }
          };
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.hasLoaded = true;
  }
  hide() {
    const entities = this.viewer.entities.values;
    for (let i = 0; i < entities.length; i++) {
      if (entities[i].type === "pipe" || entities[i].type === "pipePoint") {
        entities[i].show = false;
      }
    }
  }
}
export default new pipe();
