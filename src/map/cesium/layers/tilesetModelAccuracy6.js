import BaseLayer from "./baseLayer";
import eventBus from "../../../utils/EventBus";
import {constant}  from "@/map";
import { moveModel ,tileSet,tileSetAll } from "@/map/cesium/helps/modelHandle";

class tilesetModelAccuracy extends BaseLayer {
  constructor(options) {
    super(options);
    this.tilesetModel = null;
    this.tilesetFlag = null;
    // 可见性控制配置
    this.visibilityConfig = {
      minCameraHeight: 0, // 最小相机高度（米），低于此高度不显示3D Tiles
      maxCameraHeight: 10000, // 最大相机高度（米），高于此高度不显示3D Tiles
      viewDistanceThreshold: 8000, // 视图距离阈值（米），超过此距离不显示3D Tiles
      ...options?.visibilityConfig
    };
    this.cameraChangeListener = null;
    this.isVisibilityControlEnabled = true;
  }
  // 检查3D Tiles是否应该可见
  checkTilesetVisibility() {
    const { viewer } = this;
    if (!viewer || !this.isVisibilityControlEnabled) return true;

    const camera = viewer.camera;
    const cameraPosition = camera.position;
    const cameraHeight = viewer.scene.globe.ellipsoid.cartesianToCartographic(cameraPosition).height;

    // 检查相机高度是否在指定范围内
    if (cameraHeight < this.visibilityConfig.minCameraHeight || 
        cameraHeight > this.visibilityConfig.maxCameraHeight) {
      return false;
    }

    // 检查是否有任何3D Tiles在视图距离阈值内
    if (this.tilesetFlags && this.tilesetFlags.length > 0) {
      for (let tileset of this.tilesetFlags) {
        if (tileset && tileset.boundingSphere) {
          const distance = Cesium.Cartesian3.distance(cameraPosition, tileset.boundingSphere.center);
          if (distance <= this.visibilityConfig.viewDistanceThreshold) {
            return true;
          }
        }
      }
      return false;
    }

    return true;
  }

  // 更新3D Tiles的可见性
  updateTilesetVisibility() {
    if (!this.tilesetFlags || this.tilesetFlags.length === 0) return;

    const shouldBeVisible = this.checkTilesetVisibility();
    
    this.tilesetFlags.forEach(tileset => {
      if (tileset) {
        tileset.show = shouldBeVisible;
      }
    });
  }

  // 设置相机变化监听器
  setupCameraListener() {
    const { viewer } = this;
    if (!viewer) return;

    // 移除现有监听器
    if (this.cameraChangeListener) {
      this.cameraChangeListener();
      this.cameraChangeListener = null;
    }

    // 添加新的监听器
    this.cameraChangeListener = viewer.camera.changed.addEventListener(() => {
      this.updateTilesetVisibility();
    });
  }

  async show() {
    const { viewer, id } = this;
    // 创建一个Cesium3DTileset实例并添加到Cesium Viewer
    var timestamp = new Date().getTime();
    const showList=constant.MODEL_3DTILES_INFO_LIST;
    console.log("🚀 ~ tilesetModelAccuracy ~ show ~ showList:", showList);
    
    // 存储所有tileset的数组
    this.tilesetModels = [];
    this.tilesetFlags = [];
    
    function tileSet(tileset, center, height = 10) {
      //3dtile模型的边界球体
      var boundingSphere = tileset.boundingSphere;
      //迪卡尔空间直角坐标=>地理坐标（弧度制）
      var cartographic_original = Cesium.Cartographic.fromCartesian(
        boundingSphere.center
      );
      // longitude偏大时右移，latitude偏大时上移
      const boundingCenter = Cesium.Cartesian3.fromDegrees(
        center[0],
        center[1],
        center[2]
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
      //获得地面和offset的转换
      var translation = Cesium.Cartesian3.subtract(
        offset,
        Cartesian3_original,
        new Cesium.Cartesian3()
      );
      //修改模型矩阵
      tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
    }

    // 遍历showList加载所有3D Tiles
    for (let i = 0; i < showList.length; i++) {
      const item = showList[i];
      const baseURL= `/geodata/3dtiles/${item.name}/tileset.json`
      const tilesetUrl = baseURL + "?timestamp=" + timestamp;
      const resource = new Cesium.Resource({
        url: tilesetUrl,
      });
      console.log(`🚀 ~ tilesetModelAccuracy ~ show ~ ${item.name} resource:`, resource);

      const tilesetModel = Cesium.Cesium3DTileset.fromUrl(resource, {
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
      
      this.tilesetModels.push(tilesetModel);
      
      tilesetModel.then((_tileset) => {
        this.tilesetFlags.push(_tileset);
        viewer.scene.primitives.add(_tileset);
        const modelMatrix = moveModel(_tileset, item.center[0], item.center[1], -10);
        _tileset.modelMatrix = modelMatrix;
        // tileSet(_tileset, item.center);
        console.log(`✅ ${item.name} 3D Tiles loaded successfully`);
        
        // 初始化可见性控制
        this.updateTilesetVisibility();
      }).catch((error) => {
        console.error(`❌ Failed to load ${item.name} 3D Tiles:`, error);
      });
    }

    // 保持向后兼容性
    this.tilesetModel = this.tilesetModels[0];
    this.hasLoaded = true;
    
    // 设置相机监听器
    this.setupCameraListener();
  }
  //隐藏
  hide() {
    const { viewer, id } = this;

    // 移除相机监听器
    if (this.cameraChangeListener) {
      this.cameraChangeListener();
      this.cameraChangeListener = null;
    }

    if (this.tilesetModels && viewer) {
      // 移除所有tileset
      this.tilesetFlags.forEach(tileset => {
        if (tileset) {
          viewer.scene.primitives.remove(tileset);
        }
      });
      this.tilesetModels = [];
      this.tilesetFlags = [];
    }
    
    // 保持向后兼容性
    if (this.tilesetModel && viewer) {
      viewer.scene.primitives.remove(this.tilesetFlag);
      this.tilesetModel = null;
      this.tilesetFlag = null;
    }
  }

  // 启用/禁用可见性控制
  setVisibilityControlEnabled(enabled) {
    this.isVisibilityControlEnabled = enabled;
    if (enabled) {
      this.updateTilesetVisibility();
      this.setupCameraListener();
    } else {
      // 禁用时显示所有3D Tiles
      if (this.tilesetFlags) {
        this.tilesetFlags.forEach(tileset => {
          if (tileset) {
            tileset.show = true;
          }
        });
      }
      // 移除监听器
      if (this.cameraChangeListener) {
        this.cameraChangeListener();
        this.cameraChangeListener = null;
      }
    }
  }

  // 更新可见性配置
  updateVisibilityConfig(config) {
    this.visibilityConfig = { ...this.visibilityConfig, ...config };
    if (this.isVisibilityControlEnabled) {
      this.updateTilesetVisibility();
    }
  }
}
export default new tilesetModelAccuracy();
