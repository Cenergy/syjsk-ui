import { MapSdk, L, esri } from "swpdmap";
import "@/map/leaflet/styles/mapStyle.css";
import * as entities from "../layers";

//底图管理类
export default class BaseMapBus {
  constructor() {
    //存储图层
    this.layerMap = new Map();
  }
  //初始化
  init(options = {}) {
    //地图初始化
    const viewer = this._createMap(options);
    Object.keys(entities).map((key) => {
      const layer = entities[key];
      //初始化layer.js内的图层，传入viewer
      entities[key].init && entities[key].init(viewer);
    });
    this.viewer = viewer;
    return viewer;
  }

  _createMap(options) {
    // Cesium.Ion.defaultAccessToken ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmYjU0MGUyNS03YmUzLTQ4MjQtODI1MC1iNzcxMGUyMjY5MzUiLCJpZCI6MjEzMzU0LCJpYXQiOjE3MTUwNDU1OTF9.OWQEv7Vz218FVCUQqr3VxHNBxYKqx3W_vY9WZSUJfus"
    const { container = "cesiumContainer", destination, center, orientation } = options;
    const viewer = new Cesium.Viewer(container, {
      homeButton: false, //可以回到最初的视角
      sceneModePicker: false, //地球的展示形式，球体还是平面
      baseLayerPicker: false, // 底图影像切换
      animation: false, // 是否显示动画控件
      infoBox: false, // 是否显示点击要素之后显示的信息
      selectionIndicator: false, // 要素选中框
      geocoder: false, // 是否显示地名查找控件
      timeline: false, // 是否显示时间线控件
      fullscreenButton: false, //是否显示全屏按钮
      shouldAnimate: true, //是否需要动画
      navigationHelpButton: false, // 是否显示帮助信息控件
      imageryProvider: new Cesium.SingleTileImageryProvider({
        url: "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==",
      }),
      // requestRenderMode: true, // 启用按需渲染
      // maximumRenderTimeChange: Infinity, // 允许无限时间间隔
      // targetFrameRate: 60,
      // imageryProviderViewModels: [tiandiVecModel, tiandiImgModel]
    });
    viewer.cesiumWidget.creditContainer.style.display = "none";
    if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
      var vtxf_dpr = window.devicePixelRatio;
      //降低分辨率
      while (vtxf_dpr >= 2.0) {
        vtxf_dpr /= 2.0;
      }
      viewer.resolutionScale = vtxf_dpr;
    }

    // 开启帧率
    viewer.scene.debugShowFramesPerSecond = true;
    viewer.scene.sun.show = false;
    viewer.scene.moon.show = false;
    //限制缩放范围
    // 最小缩放高度（米）
    // viewer.scene.screenSpaceCameraController.minimumZoomDistance = 200;
    // 最大缩放高度（米）
    viewer.scene.screenSpaceCameraController.maximumZoomDistance = 100000;

    // 将相机的中心点设置为指定位置
    const scene = viewer.scene;
    scene.camera.setView({
      //将经度、纬度、高度的坐标转换为笛卡尔坐标
      destination: destination||Cesium.Cartesian3.fromDegrees(...center),
      // orientation,
    });

    let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((event) => {
      let cartesian = viewer.camera.pickEllipsoid(event.position);
      if (!cartesian) return;
      let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      let lng = Cesium.Math.toDegrees(cartographic.longitude); // 经度
      let lat = Cesium.Math.toDegrees(cartographic.latitude); // 纬度
      let alt = cartographic.height; // 高度，椭球面height永远等于0
      let coordinate = {
        longitude: Number(lng.toFixed(6)),
        latitude: Number(lat.toFixed(6)),
        altitude: Number(alt.toFixed(2)),
      };
      console.log("🚀 ~ BaseMapBus ~ coordinate:", coordinate);
      // 转换为笛卡尔坐标
      const cartesian3 = Cesium.Cartesian3.fromDegrees(lng, lat);
      var position = viewer.camera.position;

      // 获取相机经度
      var longitude = Cesium.Math.toDegrees(
        Cesium.Cartographic.fromCartesian(viewer.camera.position).longitude
      );
      // 获取相机纬度
      var latitude = Cesium.Math.toDegrees(
        Cesium.Cartographic.fromCartesian(viewer.camera.position).latitude
      );
      // 获取相机方向
      var heading = viewer.camera.heading;
      // 获取相机视角
      var pitch = viewer.camera.pitch;
      // 获取相机倾斜角度
      var roll = viewer.camera.roll;
      //  获取当前视口的四至
      const canvas = viewer.scene.canvas;
      const rectangle = viewer.camera.computeViewRectangle(
        viewer.scene.globe.ellipsoid
      );

      let viewBounds = null;
      if (rectangle) {
        // 将弧度转换为度数
        const west = Cesium.Math.toDegrees(rectangle.west);
        const south = Cesium.Math.toDegrees(rectangle.south);
        const east = Cesium.Math.toDegrees(rectangle.east);
        const north = Cesium.Math.toDegrees(rectangle.north);

        viewBounds = {
          west: Number(west.toFixed(6)),
          south: Number(south.toFixed(6)),
          east: Number(east.toFixed(6)),
          north: Number(north.toFixed(6)),
          center: {
            longitude: Number(((west + east) / 2).toFixed(6)),
            latitude: Number(((south + north) / 2).toFixed(6)),
          },
          width: Number((east - west).toFixed(6)),
          height: Number((north - south).toFixed(6)),
        };

        console.log("当前视口四至:", viewBounds);
      } else {
        console.warn("无法获取当前视口范围");
      }
      console.log("Position: ", position);
      console.log("Longitude: ", longitude);
      console.log("Latitude: ", latitude);
      console.log("Heading: ", heading);
      console.log("Pitch: ", pitch);
      console.log("Roll: ", roll);
      const orientation = {
        // 获取视角的中心
        heading,
        pitch,
        roll,
      };
      console.log("🚀 ~ BaseMapBus ~ _createMap ~ orientation:", orientation);

      // 获取当前视角信息
      const currentView = this.getCurrentCameraView(viewer);
      if (currentView) {
        console.log("=== 当前相机视角信息 ===");
        console.log("可读格式:", currentView.readable);
        console.log("flyTo格式:", currentView.flyToData);
        console.log("使用方法: viewer.camera.flyTo(currentView.flyToData)");
        console.log("========================");
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // var timeOutID = setTimeout(() => {
    //   viewer.scene.requestRenderMode = false;
    //   timeOutID = null;
    // }, 1000);
    return viewer;
  }
  getCurrentCameraView(viewer) {
    if (!viewer) {
      console.warn("Viewer未初始化");
      return null;
    }

    // 获取相机位置
    const position = viewer.camera.position;
    const cartographic = Cesium.Cartographic.fromCartesian(position);

    // 获取相机参数
    const longitude = Cesium.Math.toDegrees(cartographic.longitude);
    const latitude = Cesium.Math.toDegrees(cartographic.latitude);
    const height = cartographic.height;

    // 获取相机姿态
    const heading = viewer.camera.heading;
    const pitch = viewer.camera.pitch;
    const roll = viewer.camera.roll;

    // 构造与flyTo兼容的数据格式
    const cameraView = {
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
      orientation: {
        heading: heading,
        pitch: pitch,
        roll: roll,
      },
    };

    // 同时返回可读性更好的数据格式
    const readableView = {
      position: {
        longitude: Number(longitude.toFixed(6)),
        latitude: Number(latitude.toFixed(6)),
        height: Number(height.toFixed(2)),
      },
      orientation: {
        heading: Number(Cesium.Math.toDegrees(heading).toFixed(6)),
        pitch: Number(Cesium.Math.toDegrees(pitch).toFixed(6)),
        roll: Number(Cesium.Math.toDegrees(roll).toFixed(6)),
      },
    };

    return {
      flyToData: cameraView, // 可直接用于flyTo的数据
      readable: readableView, // 可读性好的数据（角度制）
    };
  }

  destroy() {
    const { viewer } = this;
    if (Cesium.defined(viewer)) {
      viewer.entities.removeAll();
      viewer.imageryLayers.removeAll();
      viewer.dataSources.removeAll();
      // viewer.scene.primitives.removeAll();
      // 获取webgl上下文
      let gl = viewer.scene.context._originalGLContext;
      gl.canvas.width = 1;
      gl.canvas.height = 1;
      viewer.destroy(); // 销毁Viewer实例
      gl.getExtension("WEBGL_lose_context").loseContext();
      gl = null;
      window.viewer = null;
      var cesiumContainer = document.getElementById("cesiumContainer");
      if (cesiumContainer) {
        cesiumContainer.remove(); // 移除与地图相关的DOM元素
      }
      console.log("cesium已销毁");
    }
  }
}
