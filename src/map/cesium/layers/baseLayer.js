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
}
