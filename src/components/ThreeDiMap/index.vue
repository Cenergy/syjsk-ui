<template>
  <div id="cesiumContainer" ref="viewer">
    <el-row id="cesium-group-button-container">
      <el-button size="small" @click="viewDam">
        大坝
      </el-button>
      <el-button size="small" @click="viewDam2">
        溢洪道
      </el-button>
    </el-row>
  </div>
</template>

<script>

import { getProviderViewModels } from "@/map/threeD/provider";
let [tiandiVecModel, tiandiImgModel] = getProviderViewModels();
var viewer = null;

import "@/map/tools/gifler";

export default {
  name: "sm-viewer",
  data() {
    return {
      viewer: null,
    };
  },
  methods: {
    init() {
      // 设置摄像头默认视角
      Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(89.5, 20.4, 110.4, 61.2);
      Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmYjU0MGUyNS03YmUzLTQ4MjQtODI1MC1iNzcxMGUyMjY5MzUiLCJpZCI6MjEzMzU0LCJpYXQiOjE3MTUwNDU1OTF9.OWQEv7Vz218FVCUQqr3VxHNBxYKqx3W_vY9WZSUJfus';
      let viewer = new Cesium.Viewer(this.$refs.viewer, {
        homeButton: false,//可以回到最初的视角
        sceneModePicker: false,//地球的展示形式，球体还是平面
        baseLayerPicker: false, // 底图影像切换
        animation: false, // 是否显示动画控件
        infoBox: false, // 是否显示点击要素之后显示的信息
        selectionIndicator: false, // 要素选中框
        geocoder: false, // 是否显示地名查找控件
        timeline: false, // 是否显示时间线控件
        fullscreenButton: false,//是否显示全屏按钮
        shouldAnimate: false,//是否需要动画
        navigationHelpButton: false, // 是否显示帮助信息控件
        imageryProviderViewModels: [tiandiVecModel, tiandiImgModel]
      });

      //加载高德/百度影像地图，UrlTemplateImageryProvider该接口是加载谷歌地图服务的接口
      // 高德地图图层URL
      const amapURL = `https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}`;

      // 创建一个自定义的ImageryProvider
      // const amapImageryProvider = new Cesium.UrlTemplateImageryProvider({
      //   url: amapURL,
      //   subdomains: ['webrd01.is.autonavi.com', 'webrd02.is.autonavi.com', 'webrd03.is.autonavi.com', 'webrd04.is.autonavi.com'],
      //   tilingScheme: new Cesium.WebMercatorTilingScheme(),
      // });

      // 设置中心点的位置
      var center = Cesium.Cartesian3.fromDegrees(114, 22);

      // 将相机的中心点设置为指定位置
      // viewer.camera.lookAt(center, new Cesium.Cartesian3(0.0, 0.0, 100.0));

      // 将高德地图作为底图添加到Cesium Viewer中
      // viewer.imagery.addImageryProvider(amapImageryProvider);
      const token = "d064f7f32eb2e512486ecc240f8ae8e5";
      // 天地图的URL模板，其中YOUR_TIANDITU_KEY替换为你的天地图API密钥
      // const tdtyj_img_url = `http://t{s}.tianditu.gov.cn/img_c/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=tk=${token}`;
      const tdtyj_img_url = `http://t{s}.tianditu.gov.cn/img_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${token}`;
      // 创建天地图的ImageryProvider

      // 将天地图ImageryProvider添加到Cesium Viewer中

      const webKey = 'd064f7f32eb2e512486ecc240f8ae8e5';
      //天地图属于网络底图切片影像图层 影像底图
      //WebMapTileServiceImageryProvider该接口是加载WMTS服务的接口，天地图是典型的WMTS服务的原型
      //矢量底图
      // 
      //加载高德/百度影像地图，UrlTemplateImageryProvider该接口是加载谷歌地图服务的接口
      // viewer.imageryLayers.addImageryProvider(
      // new Cesium.UrlTemplateImageryProvider({
      //   url: 'https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
      //   layer: 'tdtVecBasicLayer',
      //   style: 'default',
      //   format: 'image/png',
      //   tileMatrixSetID: 'GoogleMapsCompatible',
      //   show: false,
      // });
      // );


      // 获取图层集合并遍历去除每一个图层

      //矢量底图
      // viewer.imageryLayers.addImageryProvider(
      //   new Cesium.WebMapTileServiceImageryProvider({
      //     url:
      //       'http://t0.tianditu.com/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=' +
      //       webKey,
      //     layer: 'tdtVecBasicLayer',
      //     style: 'default',
      //     format: 'image/jpeg',
      //     tileMatrixSetID: 'GoogleMapsCompatible',
      //     show: true,
      //   })
      // );
      // 你可以通过
      // 或者通过viewer.imageryLayers.lowerToBottom(imageryProvider)将天地图图层置于底部
      // 或者通过viewer.imageryLayers.remove(imageryProvider)移除天地图图层
    },
    async getData() {
      // 创建一个Headers对象
      const headers2 = new Headers({
        "szvsud-license-key":
          "OtbjZmMdjqwNiF93XZ2crfQodNXo5nOjm+/L8o+GUt4wlp2YOkQ397iugFWasxhdKeHgawKvvI5srJfXVzlYVg==",
      });
      const f = await fetch("http://10.253.102.69/gw/TILE_3D_MODEL/sz/dapeng/tileset.json", {
        method: "GET",
        headers: headers2,
        mode: "cors",
      });
      const result = await f.json();
      return result;

    },
    viewDam() {
      if (!viewer) return;
      viewer.scene.camera.flyTo({
        //将经度、纬度、高度的坐标转换为笛卡尔坐标
        destination: Cesium.Cartesian3.fromDegrees(114.493036, 22.60472, 100),
        orientation: {
          heading: Cesium.Math.toRadians(-30),
          pitch: Cesium.Math.toRadians(-30),
          roll: 1.4456880137458938e-11
        }
      });
    },
    viewDam2() {
      if (!viewer) return;
      viewer.scene.camera.flyTo({
        //将经度、纬度、高度的坐标转换为笛卡尔坐标
        destination: Cesium.Cartesian3.fromDegrees(114.495104, 22.606392, 100),
        orientation: {
          heading: 5.064930524606465,
          pitch: -0.6750047172284135,
          roll: 6.283185307179586
        }
      });
    }
  },

  async mounted() {
    // this.init();
    const webKey = 'd064f7f32eb2e512486ecc240f8ae8e5';
    viewer = new Cesium.Viewer(this.$refs.viewer, {
      homeButton: false,//可以回到最初的视角
      sceneModePicker: false,//地球的展示形式，球体还是平面
      baseLayerPicker: false, // 底图影像切换
      animation: false, // 是否显示动画控件
      infoBox: false, // 是否显示点击要素之后显示的信息
      selectionIndicator: false, // 要素选中框
      geocoder: false, // 是否显示地名查找控件
      timeline: false, // 是否显示时间线控件
      fullscreenButton: false,//是否显示全屏按钮
      shouldAnimate: false,//是否需要动画
      navigationHelpButton: false, // 是否显示帮助信息控件
      // imageryProviderViewModels: [tiandiVecModel, tiandiImgModel]
    });
    viewer.imageryLayers.addImageryProvider(new Cesium.TiandituImageryProvider({
      credit: new Cesium.Credit('天地图全球影像服务'),
      token: webKey
    }));
    var imageryLayers = viewer.imageryLayers;
    //初始化天地图全球中文注记服务，并添加至影像图层
    // var labelImagery = new Cesium.TiandituImageryProvider({
    //   mapStyle: Cesium.TiandituMapsStyle.CIA_C, //天地图全球中文注记服务（经纬度投影）
    //   token: webKey
    // });
    // imageryLayers.addImageryProvider(labelImagery);
    viewer.scene.lightSource.ambientLightColor = new Cesium.Color(0.65, 0.65, 0.65, 1);
    // 设置中心点的位置
    var center = Cesium.Cartesian3.fromDegrees(114.50148980352163, 22.6186123072287, 100000);

    // 将相机的中心点设置为指定位置
    var scene = viewer.scene;
    scene.camera.setView({
      //将经度、纬度、高度的坐标转换为笛卡尔坐标
      destination: Cesium.Cartesian3.fromDegrees(114.492809, 22.604782, 5),
      orientation: {
        heading: 5.760591691536681,
        pitch: -0.035519956055927615,
        roll: 1.1874057292970974e-11
      }
    });
    // 创建一个Cesium3DTileset实例并添加到Cesium Viewer
    const tilesetUrl = "http://10.253.102.69/gw/TILE_3D_MODEL/sz/dapeng/tileset.json";
    const resource = new Cesium.Resource({
      url: tilesetUrl,
      headers: {
        "szvsud-license-key":
          "OtbjZmMdjqwNiF93XZ2crfQodNXo5nOjm+/L8o+GUt4wlp2YOkQ397iugFWasxhdKeHgawKvvI5srJfXVzlYVg==",
      }
    });
    function tileSet(tileset, height) {
      //3dtile模型的边界球体
      var boundingSphere = tileset.boundingSphere;
      //迪卡尔空间直角坐标=>地理坐标（弧度制）
      var cartographic_original = Cesium.Cartographic.fromCartesian(boundingSphere.center);
      // longitude偏大时右移，latitude偏大时上移
      const boundingCenter = Cesium.Cartesian3.fromDegrees(114.47857000352163, 22.5620803072287, 0);
      var boundingCenter2 = Cesium.Cartographic.fromCartesian(boundingCenter);

      //地理坐标（弧度制）=>迪卡尔空间直角坐标
      var Cartesian3_original = Cesium.Cartesian3.fromRadians(cartographic_original.longitude, cartographic_original.latitude, cartographic_original.height);
      //模型改变的位置
      var offset = Cesium.Cartesian3.fromRadians(boundingCenter2.longitude, boundingCenter2.latitude, height);
      var Cartesian3_offset = Cesium.Cartesian3.fromRadians(cartographic_original.longitude, cartographic_original.latitude, height);
      //获得地面和offset的转换
      var translation = Cesium.Cartesian3.subtract(offset, Cartesian3_original, new Cesium.Cartesian3());
      //修改模型矩阵
      tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
    }

    const tileset = new Cesium.Cesium3DTileset({
      url: resource,
      maximumMemoryUsage: 100,//不可设置太高，目标机子空闲内存值以内，防止浏览器过于卡
      maximumScreenSpaceError: 32,//用于驱动细节细化级别的最大屏幕空间错误;较高的值可提供更好的性能，但视觉质量较低。
      maximumNumberOfLoadedTiles: 1000,  //最大加载瓦片个数
      shadows: false,//是否显示阴影
      skipLevelOfDetail: true,// 确定是否应在遍历期间应用详细级别跳过(默认false)
      baseScreenSpaceError: 1024,//When skipLevelOfDetailis true，在跳过详细级别之前必须达到的屏幕空间错误(默认1024)
      skipScreenSpaceErrorFactor: 16,// 定义要跳过的最小屏幕空间错误的乘数。与 一起使用skipLevels来确定要加载哪些图块(默认16)
      skipLevels: 1,//skipLevelOfDetail是true 一个常量，定义了加载图块时要跳过的最小级别数。为 0 时，不跳过任何级别。与 一起使用skipScreenSpaceErrorFactor来确定要加载哪些图块。(默认1)
      immediatelyLoadDesiredLevelOfDetail: false,//当skipLevelOfDetail是时true，只会下载满足最大屏幕空间错误的图块。忽略跳过因素，只加载所需的图块(默认false)
      loadSiblings: false,// 如果为true则不会在已加载完概况房屋后，自动从中心开始超清化房屋 --- 何时确定在遍历期间skipLevelOfDetail是否true始终下载可见瓦片的兄弟姐妹(默认false)
      cullWithChildrenBounds: true,//是否使用子边界体积的并集来剔除瓦片（默认true）
      dynamicScreenSpaceError: true,//减少距离相机较远的图块的屏幕空间错误(默认false)
      dynamicScreenSpaceErrorDensity: 0.00278,//数值加大，能让周边加载变快 --- 用于调整动态屏幕空间误差的密度，类似于雾密度(默认0.00278)
      dynamicScreenSpaceErrorFactor: 4.0,// 用于增加计算的动态屏幕空间误差的因素(默认4.0)
      dynamicScreenSpaceErrorHeightFalloff: 0.25//密度开始下降的瓦片集高度的比率(默认0.25)
    });
    var tilesetbuilding = viewer.scene.primitives.add(tileset);
    tilesetbuilding.readyPromise.then((ts) => {
      tileSet(ts, -45);
    });

    let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(function (event) {
      let cartesian = viewer.camera.pickEllipsoid(event.position);
      if (!cartesian) return;
      let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      let lng = Cesium.Math.toDegrees(cartographic.longitude); // 经度
      let lat = Cesium.Math.toDegrees(cartographic.latitude); // 纬度
      let alt = cartographic.height; // 高度，椭球面height永远等于0
      let coordinate = {
        longitude: Number(lng.toFixed(6)),
        latitude: Number(lat.toFixed(6)),
        altitude: Number(alt.toFixed(2))
      };
      // 转换为笛卡尔坐标
      const cartesian3 = Cesium.Cartesian3.fromDegrees(lng, lat);
      console.log("🚀 ~ lng, lat:", lng, lat);
      const heading = viewer.camera.heading;
      const pitch = viewer.camera.pitch;
      const roll = viewer.camera.roll;
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    const widget = viewer.cesiumWidget;
    let waterLayer = null;
    try {
      //场景添加S3M图层服务
      var promise = scene.open("http://113.108.111.178:8081/iserver/services/3D-scene/rest/realspace");
      Cesium.when(promise, (layers) => {
        waterLayer = scene.layers.find('shuimian@Datasource');
        var style = new Cesium.Style3D();
        style.bottomAltitude = 18;
        //设置水面图层的底部高程，确保水面与模型贴合
        waterLayer.style3D = style;
        //设置风格后需刷新
        waterLayer.refresh();
      });
    }
    catch (e) {
      if (widget._showRenderLoopErrors) {
        var title = '渲染时发生错误，已停止渲染。';
        widget.showErrorPanel(title, undefined, e);
      }
    }

    // 计算水面高度
    this.$bus.on("ReservoirWaterSurfaceHeight", (res) => {
      if(!waterLayer) return;
      const { currentRz,futureRz } = res;
      const waterHeight=futureRz||currentRz;
      var style = new Cesium.Style3D();
      style.bottomAltitude = waterHeight * 0.8;
      //设置水面图层的底部高程，确保水面与模型贴合
      waterLayer.style3D = style;
      //设置风格后需刷新
      waterLayer.refresh();

    });

    // 定义矩形的位置和大小
    var rectangle = Cesium.Rectangle.fromDegrees(114.4922476507744, 22.60513593784924, 114.49299, 22.601792);
    let gifImageLayerList = {};
    let preShowGifLayer = null;
    const entity = new Cesium.Entity({
      id: "uniqueId_resverior",
    });
    viewer.entities.add(entity);

    function onDrawFrame(ctx, frame, width, height) {
      let { data_offset } = frame;
      if (gifImageLayerList[data_offset]) {
        // const currentLayer = gifImageLayerList[data_offset];
        // if (preShowGifLayer) {
        //   preShowGifLayer.alpha = 0;
        // }
        // currentLayer.alpha = 1;
        // viewer.imageryLayers.raiseToTop(currentLayer);
        // preShowGifLayer = currentLayer;
        const material = gifImageLayerList[data_offset];
        entity.polygon.material = material;
      } else {
        ctx.canvas.width = width || frame.width;
        ctx.canvas.height = height || frame.height;

        ctx.drawImage(frame.buffer, 0, 0);
        // const provider = new Cesium.SingleTileImageryProvider({
        //   url: canvas.toDataURL(),
        //   rectangle
        // });
        // if (preShowGifLayer) {
        //   preShowGifLayer.alpha = 0;
        // }
        // let layer = viewer.imageryLayers.addImageryProvider(provider);

        const material = new Cesium.ImageMaterialProperty({ image: canvas.toDataURL() });
        entity.polygon = {
          hierarchy: Cesium.Cartesian3.fromDegreesArray([
            114.49046259832384, 22.603643520518222,
            114.49874366657889, 22.578194752163533,
            114.5143957882611, 22.59383961709996,
            114.49500440772307, 22.606273619605496,
          ]), //参数为四个角点坐标
          material,

          // material: Cesium.Color.RED.withAlpha(0.5), //材质
          outline: true, //是否显示轮廓
          outlineColor: Cesium.Color.RED, //轮廓的颜色
        };
        // const aaa = viewer.entities.add({
        //   id: "1231456465456",
        //   polygon: {
        // hierarchy: Cesium.Cartesian3.fromDegreesArray([//一组地理坐标
        //   109.080842, 25.002073,
        //   105.91517, 25.002073,
        //   104.058488, 24.996596,
        //   104.053011, 23.002989,
        //   104.053011, 21.003906,
        //   105.728954, 40.998429,
        //   107.919731, 21.003906,
        //   109.04798, 20.998429,
        //   111.047063, 20.998429,
        //   111.047063, 42.000709,
        //   111.047063, 24.476286,
        //   111.05254, 25.002073]),
        //     material: new Cesium.ImageMaterialProperty({ image: canvas.toDataURL() }) // image的值为图片地址。ImageMaterialProperty默认图片不重复，不需要额外设置
        //   }
        // });

        gifImageLayerList[data_offset] = material;
        // preShowGifLayer = layer;
      }
    }

    let canvas = document.createElement("canvas");
    let url = require("@/assets/map/video3.gif");
    // let url =
    //   "https://media.giphy.com/media/VbEq7lhC0gVMFUX819/giphy-downsized.gif?cid=ecf05e471i9fq42unyxtjoci88jd019z2aana25ytggjay33&rid=giphy-downsized.gif&ct=g";
    gifler(url).frames(canvas, (ctx, frame) => {
      onDrawFrame(ctx, frame, 215, 292);
    });

    // try {
    //   //场景添加S3M图层服务
    //   var promise = scene.open('http://www.supermapol.com/realspace/services/3D-BIMbuilding/rest/realspace');
    //   Cesium.when(
    //     promise,
    //     function (layers) {
    //       //设置相机位置、方向，定位至模型
    //       scene.camera.setView({
    //         destination: new Cesium.Cartesian3.fromDegrees(
    //           116.472669,
    //           39.914821,
    //           1000
    //         ),
    //       });
    //       var layer = scene.layers.find("BIMbuilding");
    //       //读取子图层信息，通过数组的方式返回子图层的名称以及子图层所包含的对象的IDs
    //       layer.setQueryParameter({
    //         url: "http://www.supermapol.com/realspace/services/data-BIMbuilding/rest/data",
    //         dataSourceName: "BIMBuilding",
    //         isMerge: true,
    //       });
    //     },
    //     function (e) {
    //       if (widget._showRenderLoopErrors) {
    //         var title =
    //           "加载SCP失败，请检查网络连接状态或者url地址是否正确？";
    //         widget.showErrorPanel(title, undefined, e);
    //       }
    //     }
    //   );
    // } catch (e) {
    //   if (widget._showRenderLoopErrors) {
    //     var title = "渲染时发生错误，已停止渲染。";
    //     widget.showErrorPanel(title, undefined, e);
    //   }
    // }
  },
};
</script>
<style lang="scss" scoped>
#cesiumContainer {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

#cesium-group-button-container {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 10px;
  right: 26%;
  z-index: 100;
}

#cesium-group-button-container button {
  margin-top: 10px;
}

.el-button {
  margin-left: 0px;
}
</style>
