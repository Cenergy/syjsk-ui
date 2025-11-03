import BaseLayer from "./baseLayer";
import eventBus from "../../../utils/EventBus";

class tilesetModel extends BaseLayer {
  constructor(options) {
    super(options);
    this.tilesetModel = null;
    this.tilesetFlag = null;
  }
  async show() {
    const { viewer, id } = this;
    var timestamp = new Date().getTime();
    // 创建一个Cesium3DTileset实例并添加到Cesium Viewer
    const tilesetUrl =
      "/tileset/gw/TILE_3D_MODEL/gm/mesh_guangming_2022/tileset.json?timestamp=" + timestamp;
    const resource = new Cesium.Resource({
      url: tilesetUrl,
      headers: {
        "szvsud-license-key":
          "f/3m/qLvPYtBhpkac8qW1mcTM21FuDB6XgAFEgIQskzi1GqADJcw7dqa1tc1yp43wKESyiHREWvb1YrnmPYMHq1Pwm+gUNmYDIZMxCVAEQE= ",
      },
    });
    function tileSet(tileset, height) {
      //3dtile模型的边界球体
      var boundingSphere = tileset.boundingSphere;
      //迪卡尔空间直角坐标=>地理坐标（弧度制）
      var cartographic_original = Cesium.Cartographic.fromCartesian(
        boundingSphere.center
      );
      // longitude偏大时右移，latitude偏大时上移
      const boundingCenter = Cesium.Cartesian3.fromDegrees(
        113.9324,
        22.76975,
        0
      );
      var boundingCenter2 = Cesium.Cartographic.fromCartesian(boundingCenter);

      //地理坐标（弧度制）=>迪卡尔空间直角坐标
      var Cartesian3_original = Cesium.Cartesian3.fromRadians(
        cartographic_original.longitude,
        cartographic_original.latitude,
        cartographic_original.height,
        Cesium.Ellipsoid.CGCS2000
      );
      //模型改变的位置
      var offset = Cesium.Cartesian3.fromRadians(
        boundingCenter2.longitude,
        boundingCenter2.latitude,
        height,
        Cesium.Ellipsoid.CGCS2000
      );
      // var Cartesian3_offset = Cesium.Cartesian3.fromRadians(
      //   cartographic_original.longitude,
      //   cartographic_original.latitude,
      //   height
      // );
      //获得地面和offset的转换
      var translation = Cesium.Cartesian3.subtract(
        offset,
        Cartesian3_original,
        new Cesium.Cartesian3()
      );
      //修改模型矩阵
      tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
    }

    this.tilesetModel = Cesium.Cesium3DTileset.fromUrl(resource, {
      enableCollision: true,
      maximumMemoryUsage: 100, //不可设置太高，目标机子空闲内存值以内，防止浏览器过于卡
      maximumScreenSpaceError: 32, //用于驱动细节细化级别的最大屏幕空间错误;较高的值可提供更好的性能，但视觉质量较低。
      maximumNumberOfLoadedTiles: 1000, //最大加载瓦片个数
      shadows: false, //是否显示阴影
      skipLevelOfDetail: true, // 确定是否应在遍历期间应用详细级别跳过(默认false)
      baseScreenSpaceError: 1024, //When skipLevelOfDetailis true，在跳过详细级别之前必须达到的屏幕空间错误(默认1024)
      skipScreenSpaceErrorFactor: 16, // 定义要跳过的最小屏幕空间错误的乘数。与 一起使用skipLevels来确定要加载哪些图块(默认16)
      skipLevels: 1, //skipLevelOfDetail是true 一个常量，定义了加载图块时要跳过的最小级别数。为 0 时，不跳过任何级别。与 一起使用skipScreenSpaceErrorFactor来确定要加载哪些图块。(默认1)
      immediatelyLoadDesiredLevelOfDetail: false, //当skipLevelOfDetail是时true，只会下载满足最大屏幕空间错误的图块。忽略跳过因素，只加载所需的图块(默认false)
      loadSiblings: false, // 如果为true则不会在已加载完概况房屋后，自动从中心开始超清化房屋 --- 何时确定在遍历期间skipLevelOfDetail是否true始终下载可见瓦片的兄弟姐妹(默认false)
      cullWithChildrenBounds: true, //是否使用子边界体积的并集来剔除瓦片（默认true）
      dynamicScreenSpaceError: true, //减少距离相机较远的图块的屏幕空间错误(默认false)
      dynamicScreenSpaceErrorDensity: 0.00278, //数值加大，能让周边加载变快 --- 用于调整动态屏幕空间误差的密度，类似于雾密度(默认0.00278)
      dynamicScreenSpaceErrorFactor: 4.0, // 用于增加计算的动态屏幕空间误差的因素(默认4.0)
      dynamicScreenSpaceErrorHeightFalloff: 0.25, //密度开始下降的瓦片集高度的比率(默认0.25)
    });
    this.tilesetModel.then((_tileset) => {
      this.tilesetFlag = _tileset;
      viewer.scene.primitives.add(_tileset);
      tileSet(_tileset, -148);
    });

    this.hasLoaded = true;
  }
  //隐藏
  hide() {
    const { viewer, id } = this;

    if (this.tilesetModel && viewer) {
      viewer.scene.primitives.remove(this.tilesetFlag);
      // this.tilesetModel.then(function (_tileset) {
      //   // this.tilesetFlag = _tileset
      //   viewer.scene.primitives.remove(this.tilesetFlag );
      // });
      this.tilesetModel = null;
    }
  }
}
export default new tilesetModel();
