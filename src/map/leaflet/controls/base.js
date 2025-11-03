import { MapSdk, L, esri } from "swpdmap";
import "@/map/leaflet/styles/mapStyle.css";
import * as entities from "../layers";

L.Control.Attribution.include({
    options: {
        position: "bottomright",
        prefix: `Leaflet with <span>© <a href='' title='水务科技' target='_blank'>swkjmap</a></span>`,
    },
});

L.Map.mergeOptions({
    logoControl: false,
});

async function fetchImage(url, callback, headers, abort) {
    let _headers = {};
    if (headers) {
        headers.forEach((h) => {
            _headers[h.header] = h.value;
        });
    }
    const controller = new AbortController();
    const signal = controller.signal;
    if (abort) {
        abort.subscribe(() => {
            controller.abort();
        });
    }
    // 创建一个Headers对象
    const headers2 = new Headers({
        "szvsud-license-key":
            "OtbjZmMdjqwNiF93XZ2crfQodNXo5nOjm+/L8o+GUt4wlp2YOkQ397iugFWasxhdKeHgawKvvI5srJfXVzlYVg==",
    });
    const f = await fetch(url, {
        method: "GET",
        headers: headers2,
        mode: "cors",
        signal: signal,
    });
    const blob = await f.blob();
    callback(blob);
}
L.TileLayer.Dapeng = L.TileLayer.extend({
    getTileUrl: function (coords) {
        const { x, y, z } = coords;
        return `http://10.253.102.69/gw/OGC/Map/SZ_VEC_B4490/rest/Blue_shenzhen/EPSG:4490/EPSG:4490:${z - 9
            }/${y}/${x}?format=image/png`;
        // return `http://10.253.102.69/gw/OGC/Map/SZ_VEC_W4547/rest/w_shenzhen/EPSG:4490/EPSG:4490:${
        //   z - 9
        // }/${y}/${x}?format=image/png`;
    },
    getAttribution: function () {
        return "";
    },
    createTile(coords, done) {
        const url = this.getTileUrl(coords);
        const img = document.createElement("img");
        img.setAttribute("role", "presentation");

        self = this;

        fetchImage(
            url,
            (resp) => {
                const reader = new FileReader();
                reader.onload = () => {
                    img.src = reader.result;
                    if (self.results) {
                        self.results.next(reader.result);
                    }
                };
                reader.readAsDataURL(resp);
                done(null, img);
            },
            this.headers,
            this.abort
        );
        return img;
    },
});
L.tileLayer.dapeng = function () {
    return new L.TileLayer.Dapeng();
};
//底图管理类
export default class BaseMapBus {
    constructor() {
        //存储图层
        this.layerMap = new Map();
        //标识小地图
        this.isSmallMap = false;
    }
    //初始化
    init(options) {
        //地图初始化
        const map = this._createMap(options);

        const mapSdk = new MapSdk({ map, ...options }); //创建地图实例
        Object.keys(entities).map((key) => {
            const layer = entities[key];
            //初始化layer.js内的图层
            entities[key].init && entities[key].init(mapSdk, this.isSmallMap);
        });
        this.mapSdk = mapSdk;
        return mapSdk;
    }

    _createMap(options) {
        const {
            mapId = "map",
            center = [22.774336, 113.922961],
            zoom = 10,
        } = options;
        //创建leaflet地图
        const map = L.map(mapId, {
            center,
            zoom,
            minZoom: 10,
            attributionControl: false,
            crs: L.CRS.EPSG4326,//4326坐标系
        });
        const token = "d064f7f32eb2e512486ecc240f8ae8e5";
        //底图
        const image = L.tileLayer(
            `http://t{s}.tianditu.gov.cn/img_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${token}`,
            {
                subdomains: [0, 1, 2, 3, 4, 5, 6, 7],
                tileSize: 256, //使用L.CRS.EPSG4326时需要放开这两个参数
                zoomOffset: 1, //使用L.CRS.EPSG4326时需要放开这两个参数
            }
        );
        //注记
        const cia = L.tileLayer(
            `http://t{s}.tianditu.com/cva_c/wmts?layer=cva&style=default&tilematrixset=c&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix={z}&TileCol={x}&TileRow={y}&tk=${token}`,
            {
                subdomains: [0, 1, 2, 3, 4, 5, 6, 7],
                transparent: true,
                tileSize: 256, //使用L.CRS.EPSG4326时需要放开这两个参数
                zoomOffset: 1, //使用L.CRS.EPSG4326时需要放开这两个参数
                zIndex: 3,
            }
        );
        //天地图图组
        const tiandiMap = L.layerGroup([image, cia]);
        //底图
        const terImage = L.tileLayer(
            `http://t{s}.tianditu.gov.cn/ter_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${token}`,
            {
                subdomains: [0, 1, 2, 3, 4, 5, 6, 7],
                tileSize: 256, //使用L.CRS.EPSG4326时需要放开这两个参数
                zoomOffset: 1, //使用L.CRS.EPSG4326时需要放开这两个参数
            }
        );
        //注记
        const terCia = L.tileLayer(
            `http://t{s}.tianditu.gov.cn/cva_c/wmts?layer=cva&style=default&tilematrixset=c&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix={z}&TileCol={x}&TileRow={y}&tk=${token}`,
            {
                subdomains: [0, 1, 2, 3, 4, 5, 6, 7],
                transparent: true,
                tileSize: 256, //使用L.CRS.EPSG4326时需要放开这两个参数
                zoomOffset: 1, //使用L.CRS.EPSG4326时需要放开这两个参数
                zIndex: 3,
            }
        );
        //天地图图组
        const tiandiTerMap = L.layerGroup([terCia, terImage]);

        new L.basemapsSwitcher(
            [
                {
                    layer: tiandiMap.addTo(map), //默认显示影像图
                    icon: require("@/assets/map/wxt.png"),
                    name: "影像地图",
                },
                {
                    layer: tiandiTerMap,
                    icon: require("@/assets/map/wxt.png"),
                    name: "地形地图",
                },
            ],
            { position: "bottomright" }
        ).addTo(map);
        return map;
    }

    destroy() {
        //销毁地图
        this.mapSdk && this.mapSdk.destroy();
    }

    layerControl(options = {}) {
        const { group, visible, name } = options;
        if (!group) return;

        if (this.layerMap.has(group)) {
            const groupMap = this.layerMap.get(group);
            groupMap.set(name, visible);
        } else {
            const groupMapTemp = new Map();
            groupMapTemp.set(name, visible);
            this.layerMap.set(group, groupMapTemp);
        }
    }
}
