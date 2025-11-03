import BaseLayer from "./baseLayer";

const TIANDITU_MAP_TOKEN = "d064f7f32eb2e512486ecc240f8ae8e5";

class TiandituLayer extends BaseLayer {
  constructor() {
    super();
    this.imageryLayer = null;
    this.annotationLayer = null;
    this.tiandituImagery = null;
    this.tiandituAnnotation = null;
  }

  show(options = {}) {
    if (this.imageryLayer) {
      this.imageryLayer.show = true;
    }
    if (this.annotationLayer) {
      this.annotationLayer.show = true;
    }
    this.loadTiandituLayers();
  }

  // 隐藏图层
  hide(options = {}) {
    if (this.imageryLayer) {
      this.imageryLayer.show = false;
    }
    if (this.annotationLayer) {
      this.annotationLayer.show = false;
    }
  }

  loadTiandituLayers() {
    const imageryLayers = this.viewer.imageryLayers;

    // 加载天地图影像服务
    this.tiandituImagery = new Cesium.UrlTemplateImageryProvider({
      url: `https://t{s}.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TIANDITU_MAP_TOKEN}`,
      subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
      credit: "天地图影像服务",
      minimumLevel: 0,
      maximumLevel: 18,
      hasAlphaChannel: false,
      enablePickFeatures: false,
      tilingScheme: new Cesium.WebMercatorTilingScheme(),
      errorEvent: new Cesium.Event(),
    });

    // 添加错误处理，当瓦片加载失败时继续显示之前级别的瓦片
    this.tiandituImagery.errorEvent.addEventListener((error) => {
      console.warn("天地图影像瓦片加载失败，继续使用之前级别的瓦片:", error);
    });

    this.imageryLayer = imageryLayers.addImageryProvider(this.tiandituImagery);
    // 设置当超过最大级别时，继续显示最大级别的瓦片
    this.imageryLayer.show = true;
    this.imageryLayer.alpha = 1.0;

    // 加载天地图中文注记服务
    this.tiandituAnnotation = new Cesium.UrlTemplateImageryProvider({
      url: `https://t{s}.tianditu.gov.cn/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TIANDITU_MAP_TOKEN}`,
      subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
      credit: "天地图中文注记服务",
      minimumLevel: 0,
      maximumLevel: 18,
      hasAlphaChannel: true,
      enablePickFeatures: false,
      tilingScheme: new Cesium.WebMercatorTilingScheme(),
      errorEvent: new Cesium.Event(),
    });

    // 添加错误处理，当注记瓦片加载失败时继续显示之前级别的瓦片
    this.tiandituAnnotation.errorEvent.addEventListener((error) => {
      console.warn("天地图注记瓦片加载失败，继续使用之前级别的瓦片:", error);
    });

    this.annotationLayer = imageryLayers.addImageryProvider(
      this.tiandituAnnotation
    );
    // 设置当超过最大级别时，继续显示最大级别的瓦片
    this.annotationLayer.show = true;
    this.annotationLayer.alpha = 1.0;

    this.hasLoaded = true;
  }

  // 设置透明度
  setAlpha(alpha) {
    if (this.imageryLayer) {
      this.imageryLayer.alpha = alpha;
    }
    if (this.annotationLayer) {
      this.annotationLayer.alpha = alpha;
    }
  }

  // 设置亮度
  setBrightness(brightness) {
    if (this.imageryLayer) {
      this.imageryLayer.brightness = brightness;
    }
    if (this.annotationLayer) {
      this.annotationLayer.brightness = brightness;
    }
  }

  // 设置对比度
  setContrast(contrast) {
    if (this.imageryLayer) {
      this.imageryLayer.contrast = contrast;
    }
    if (this.annotationLayer) {
      this.annotationLayer.contrast = contrast;
    }
  }

  // 设置色调
  setHue(hue) {
    if (this.imageryLayer) {
      this.imageryLayer.hue = hue;
    }
    if (this.annotationLayer) {
      this.annotationLayer.hue = hue;
    }
  }

  // 设置饱和度
  setSaturation(saturation) {
    if (this.imageryLayer) {
      this.imageryLayer.saturation = saturation;
    }
    if (this.annotationLayer) {
      this.annotationLayer.saturation = saturation;
    }
  }

  // 设置伽马值
  setGamma(gamma) {
    if (this.imageryLayer) {
      this.imageryLayer.gamma = gamma;
    }
    if (this.annotationLayer) {
      this.annotationLayer.gamma = gamma;
    }
  }

  // 移除图层
  remove() {
    if (this.imageryLayer && this.viewer) {
      this.viewer.imageryLayers.remove(this.imageryLayer);
      this.imageryLayer = null;
    }
    if (this.annotationLayer && this.viewer) {
      this.viewer.imageryLayers.remove(this.annotationLayer);
      this.annotationLayer = null;
    }
    this.tiandituImagery = null;
    this.tiandituAnnotation = null;
    this.hasLoaded = false;
  }

  // 销毁图层
  destroy() {
    this.remove();
    super.destroy && super.destroy();
  }
}


export default new TiandituLayer();