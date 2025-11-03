
export function getProviderViewModels() {
  const tiandiKey = "d064f7f32eb2e512486ecc240f8ae8e5"; //天地图key，官网申请
  const baseUrl = "http://t{s}.tianditu.gov.cn";
  //天地图
  let tiandiVec = new Cesium.UrlTemplateImageryProvider({
    subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
    url:
      baseUrl +
      "/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=" +
      tiandiKey,
  });
  //天地图影像
  let tiandiImg = new Cesium.UrlTemplateImageryProvider({
    subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
    url:
      baseUrl +
      "/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=" +
      tiandiKey,
  });
  //天地图标注
  let tiandiCva = new Cesium.UrlTemplateImageryProvider({
    subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
    url:
      baseUrl +
      "/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=" +
      tiandiKey,
  });
  //天地图影像标注
  let tiandiCia = new Cesium.UrlTemplateImageryProvider({
    subdomains: ["0", "1", "2", "3", "4", "5", "6", "7"],
    url:
      baseUrl +
      "/cia_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=" +
      tiandiKey,
  });

  let tiandiVecModel = new Cesium.ProviderViewModel({
    name: "天地图",
    category: "国内地图资源",
    iconUrl: Cesium.buildModuleUrl(
      "./Widgets/Images/ImageryProviders/openStreetMap.png"
    ),
    tooltip: "WMTS 地图服务",
    creationFunction: function () {
      return [tiandiVec, tiandiCva];
    },
  });
  let tiandiImgModel = new Cesium.ProviderViewModel({
    name: "天地图影像",
    category: "国内地图资源",
    iconUrl: Cesium.buildModuleUrl(
      "./Widgets/Images/ImageryProviders/esriWorldImagery.png"
    ),
    tooltip: "WMTS 影像服务",
    creationFunction: function () {
      return [tiandiImg, tiandiCva];
    },
  });

  return [tiandiVecModel, tiandiImgModel];
}
