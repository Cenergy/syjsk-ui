import BaseLayer from "./baseLayer";
import eventBus from "../../../utils/EventBus";

class glbModel extends BaseLayer {
  constructor(options) {
    super(options);
    this.glbEntity = null;
  }
  async show() {
    const { viewer, id } = this;
    var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
      Cesium.Cartesian3.fromDegrees(113.903545, 22.80307, 500)
    );
    this.glbEntity = viewer.scene.primitives.add(
      Cesium.Model.fromGltf({
        //Gltf和glb模型都可以用
        // url: "https://data.mars3d.cn/gltf/mars/feiji.glb",
        url:"",
        modelMatrix: modelMatrix,
        minimumPixelSize: 512,
        maximumScale: 200000,
        scale: 1,
      })
    );
    //定位到模型上
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(113.903545, 22.80307, 3000),
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
  hide() {
    const { viewer, id } = this;
    if(this.glbEntity) {
      viewer.entities.remove(this.glbEntity);
      this.glbEntity = null;
    }
  }
}
export default new glbModel();
