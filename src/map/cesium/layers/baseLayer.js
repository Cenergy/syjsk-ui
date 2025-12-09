import { uuid, turf } from "swpdmap";
export default class BaseLayer {
  constructor() {
    this.pulseIdList = []; // 定时器id列表
  }
  init(viewer, options = {}) {
    this.viewer = viewer;
    this._id = uuid.v4();
    this._hasLoaded = false;
  }
  get id() {
    return this._id;
  }
  get hasLoaded() {
    return this._hasLoaded;
  }
  set hasLoaded(status) {
    this._hasLoaded = Boolean(status);
  }
  // 获取geojson的中心点
  getFeaturesCenter(geojson) {
    try {
      // 使用turf计算中心点
      const center = turf.center(geojson);
      // 返回经纬度坐标 [longitude, latitude]
      return center.geometry.coordinates;
    } catch (error) {
      console.error("getFeaturesCenter: 计算中心点时发生错误", error);
      return null;
    }
  }
  //地图点要素小弹窗方法
  openPointPopup({ content = "", component, latlng, options = {} }) {}
  closePointPopup() {}
  //图层显隐
  setVisible(visible, options = {}) {
    if (visible) {
      this._debounce(this.show.bind(this), 200)(options);
    } else {
      this._debounce(this.hide.bind(this), 200)(options);
    }
  }
  show(options) {
    this._showCore(options);
  }
  //图例
  setLegend(visible) {
    if (!this.legend) return;
    this._setLegend(visible);
  }
  delLegend(visible) {
    if (!this.legend) return;
    this.delLegend(visible);
  }
  hide(options) {
    this._showCore(options);
  }
  _delLegend(visible) {
    this._throwNotImplementationError();
  }
  _setLegend(visible) {
    this._throwNotImplementationError();
  }
  _showCore(options) {
    this._throwNotImplementationError();
  }
  _throwNotImplementationError() {
    throw new Error("method not implementation.");
  }
  /**
   *  防抖函数，频繁调用时，使用它
   * @param {*} fn 回调函数
   * @param {*} delay 防抖时间
   * @returns {void}
   */
  _debounce(fn, delay) {
    // 所以这个函数就可以使用...运算符收集js自动添加的参数到一个数组中
    const { name: timerId = "toggleShowLayerTimer" } = this.constructor;
    return (...arg) => {
      if (this[timerId]) clearTimeout(this[timerId]);
      this[timerId] = setTimeout(() => {
        // 通过apply绑定this和传递参数，apply第二个参数正好是传数组嘛
        fn.apply(this, arg);
      }, delay);
    };
  }

  // 获取当前层级
  getHierarchyLevel() {
    const { viewer } = this;
    if (!viewer || !viewer.camera) {
      console.log("Viewer 未初始化");
      return null;
    }

    try {
      // 方法1：通过相机高度计算层级
      const camera = viewer.camera;
      const height = camera.positionCartographic.height;

      // 标准Web墨卡托瓦片层级计算
      // 地球周长约40075公里，层级0时可见整个地球
      const earthCircumference = 40075000; // 米
      const tileSize = 256; // 标准瓦片尺寸

      // 计算当前高度对应的地面分辨率（米/像素）
      const canvas = viewer.scene.canvas;
      const fov = camera.frustum.fovy; // 视野角度
      const canvasHeight = canvas.clientHeight;

      // 地面分辨率 = (2 * height * tan(fov/2)) / canvasHeight
      const groundResolution = (2 * height * Math.tan(fov / 2)) / canvasHeight;

      // 层级计算：level = log2(earthCircumference / (tileSize * groundResolution))
      const level = Math.log2(
        earthCircumference / (tileSize * groundResolution)
      );
      const floorLevel = Math.floor(level);
      const ceilLevel = Math.ceil(level);

      // 方法2：使用Cesium内置方法获取瓦片层级
      let cesiumLevel = null;
      try {
        // 尝试从imagery provider获取层级信息
        const scene = viewer.scene;
        const globe = scene.globe;

        if (globe && globe._surface && globe._surface._tilesToRender) {
          const tiles = globe._surface._tilesToRender;
          if (tiles.length > 0) {
            // 获取渲染瓦片的层级范围
            const levels = tiles.map((tile) => tile.level);
            const minLevel = Math.min(...levels);
            const maxLevel = Math.max(...levels);
            cesiumLevel = { min: minLevel, max: maxLevel };
          }
        }
      } catch (error) {
        console.log("无法获取Cesium瓦片层级:", error);
      }

      // 方法3：标准瓦片层级映射 (0-19层级)
      const getSimpleLevel = (height) => {
        // 基于标准Web地图瓦片层级 0-19
        if (height > 20037508) return 0; // 层级0：全球视图 (约40,075km分辨率)
        if (height > 10018754) return 1; // 层级1：半球视图 (约20,037km分辨率)
        if (height > 5009377) return 2; // 层级2：大洲级别 (约10,018km分辨率)
        if (height > 2504688) return 3; // 层级3：大国级别 (约5,009km分辨率)
        if (height > 1252344) return 4; // 层级4：国家级别 (约2,504km分辨率)
        if (height > 626172) return 5; // 层级5：省份级别 (约1,252km分辨率)
        if (height > 313086) return 6; // 层级6：大城市级别 (约626km分辨率)
        if (height > 156543) return 7; // 层级7：城市级别 (约313km分辨率)
        if (height > 78271) return 8; // 层级8：城区级别 (约156km分辨率)
        if (height > 39135) return 9; // 层级9：区县级别 (约78km分辨率)
        if (height > 19567) return 10; // 层级10：镇级别 (约39km分辨率)
        if (height > 9783) return 11; // 层级11：大街道级别 (约19km分辨率)
        if (height > 4891) return 12; // 层级12：街道级别 (约9km分辨率)
        if (height > 2445) return 13; // 层级13：街区级别 (约4km分辨率)
        if (height > 1222) return 14; // 层级14：小街区级别 (约2km分辨率)
        if (height > 611) return 15; // 层级15：建筑群级别 (约1km分辨率)
        if (height > 305) return 16; // 层级16：建筑级别 (约500m分辨率)
        if (height > 152) return 17; // 层级17：建筑细节级别 (约250m分辨率)
        if (height > 76) return 18; // 层级18：超详细级别 (约125m分辨率)
        return 19; // 层级19：最高精度 (约60m分辨率)
      };

      const simpleLevel = getSimpleLevel(height);

      const result = {
        // 相机信息
        cameraHeight: Math.round(height),
        cameraHeightKm: Math.round((height / 1000) * 100) / 100,

        // 层级信息
        calculatedLevel: Math.round(level * 100) / 100, // 计算得出的精确层级
        floorLevel: floorLevel, // 向下取整层级
        ceilLevel: ceilLevel, // 向上取整层级
        simpleLevel: simpleLevel, // 简化映射层级

        // 分辨率信息
        groundResolution: Math.round(groundResolution * 100) / 100, // 地面分辨率(米/像素)

        // Cesium瓦片层级（如果可用）
        cesiumTileLevel: cesiumLevel,

        // 层级描述
        levelDescription: "第" + floorLevel + "层级",

        // 视野信息
        fovDegrees: Math.round(Cesium.Math.toDegrees(fov) * 100) / 100,
      };

      // console.log('当前地球层级信息:', result);
      return result;
    } catch (error) {
      console.error("获取层级时出错:", error);
      return null;
    }
  }
}
