import BaseMapBus from "./base";
import eventBus from "@/utils/EventBus";
import * as layers from "../layers";
// 复选框中label与layer对象的关系
const layerMap = new Map([]);
/**
 * 首页中的地图业务类
 */
class MapBus extends BaseMapBus {
    constructor(options) {
        super(options);
    }
    /**
    * 一进入地图需要加载的函数
    */
    startup() {
        // 初始化地图,传递options参数
        this.init({
            layerConfig: { showPanle: false },
            legendConfig: {
                title: "地图图例",
            },
        });
        //事件监听
        this.subscribe();
        // 首页显示的内容
    }
    subscribe() {
        // 监听定位
        eventBus.on("mapLocate", (res) => {
            this._mapLocate(res);
        });
        // 监听的是复选框的状态
        eventBus.on("addMapLayer", (checkItem = {}) => {
            const checkObject = { checkItem, checkStatus: true };
            this._checkboxMapChange(checkObject);
            console.log("🚀 ~ MapBus ~ eventBus.on ~ checkObject:", checkObject);
        });
        // 监听的是复选框的状态
        eventBus.on("removeMapLayer", (checkItem = {}) => {
            console.log("🚀 ~ MapBus ~ eventBus.on ~ checkItem:", checkItem);
            const checkObject = { checkItem, checkStatus: false };
            this._checkboxMapChange(checkObject);
        });
    }
    _mapLocate(res) {
        const { data } = res;
        const { lttd: LAT, lgtd: LON } = data;
        if (!LAT && !LON) return;
        // 扩散圈
        this.mapSdk.showPulse({
            latlng: [LAT, LON],
            fillColor: "rgba(0,0,0,0)",
            animate: true,
            count: 3,
        });
        // 收缩十字架
        this.mapSdk.showPulse({
            id: "crosss",
            latlng: [LAT, LON],
            fillColor: "rgba(0,0,0,0)",
            animate: true,
            width: 20,
            type: "row",
            html: `<div class="addPlus scale-up-center"></div>`,
        });
        this.mapSdk.map.flyTo([LAT, LON], 12);
    }
}
export default new MapBus();