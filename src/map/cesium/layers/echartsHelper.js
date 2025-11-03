/**
 * Cesium与ECharts结合使用的辅助函数
 */
import * as echarts from "echarts";

/**
 * 在Cesium中使用ECharts
 * @param {Object} option - ECharts配置项
 * @returns {Object} ECharts实例
 */
export function cesiumUseEcharts(viewer, option) {
    // 确保全局变量可用
    echarts.cesiumViewer = viewer;
    
    // 注册GLMap坐标系统
    registerGLMapCoordSys();
    
    // 创建ECharts实例
    return new HrcEcharts(viewer, option);
}

/**
 * HrcEcharts类 - 在Cesium上创建ECharts图层
 */
class HrcEcharts {
    /**
     * 构造函数
     * @param {Object} mapContainer - Cesium viewer实例
     * @param {Object} option - ECharts配置项
     */
    constructor(mapContainer, option) {
        this._mapContainer = mapContainer;
        this._overlay = this._createChartOverlay();
        this._overlay.setOption(option);
    }

    /**
     * 创建ECharts图层
     * @returns {Object} ECharts实例
     * @private
     */
    _createChartOverlay() {
        const scene = this._mapContainer.scene;
        scene.canvas.setAttribute('tabIndex', 0);
        
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '0px';
        container.style.left = '0px';
        container.style.width = scene.canvas.width + 'px';
        container.style.height = scene.canvas.height + 'px';
        container.style.pointerEvents = 'none';
        
        const randomId = parseInt(Math.random() * 99999);
        const layerCount = document.getElementsByClassName('echartMap').length;
        container.setAttribute('id', 'ysCesium-echarts-' + randomId + '-' + layerCount);
        container.setAttribute('class', 'echartMap');
        
        this._mapContainer.container.appendChild(container);
        this._echartsContainer = container;
        
        return echarts.init(container);
    }

    /**
     * 销毁ECharts实例
     */
    dispose() {
        if (this._echartsContainer) {
            this._mapContainer.container.removeChild(this._echartsContainer);
            this._echartsContainer = null;
        }
        
        if (this._overlay) {
            this._overlay.dispose();
            this._overlay = null;
        }
    }

    /**
     * 更新ECharts配置
     * @param {Object} option - 新的ECharts配置项
     */
    updateOverlay(option) {
        if (this._overlay) {
            this._overlay.setOption(option);
        }
    }

    /**
     * 获取地图容器
     * @returns {Object} 地图容器
     */
    getMap() {
        return this._mapContainer;
    }

    /**
     * 获取ECharts实例
     * @returns {Object} ECharts实例
     */
    getOverlay() {
        return this._overlay;
    }

    /**
     * 显示ECharts图层
     */
    show() {
        if (this._echartsContainer) {
            this._echartsContainer.style.visibility = 'visible';
        }
    }

    /**
     * 隐藏ECharts图层
     */
    hide() {
        if (this._echartsContainer) {
            this._echartsContainer.style.visibility = 'hidden';
        }
    }
}

/**
 * 注册GLMap坐标系统
 */
function registerGLMapCoordSys() {
    // 如果已经注册过，则不再重复注册
    if (echarts.registerCoordinateSystem && echarts.registerCoordinateSystem['GLMap']) {
        return;
    }
    
    // GLMap坐标系统类
    class GLMapCoordSys {
        constructor(viewer, api) {
            this._viewer = viewer;
            this.dimensions = ['lng', 'lat'];
            this._mapOffset = [0, 0];
            this._api = api;
        }

        /**
         * 设置地图偏移
         * @param {Array} offset - 偏移量
         * @returns {Object} 当前实例
         */
        setMapOffset(offset) {
            this._mapOffset = offset;
            return this;
        }

        /**
         * 获取Viewer实例
         * @returns {Object} Cesium Viewer实例
         */
        getViewer() {
            return this._viewer;
        }

        /**
         * 将经纬度转换为屏幕坐标
         * @param {Array} coords - 经纬度坐标 [lng, lat]
         * @returns {Array|boolean} 屏幕坐标 [x, y] 或 false
         */
        dataToPoint(coords) {
            const scene = this._viewer.scene;
            const point = [0, 0];
            const cartesian = Cesium.Cartesian3.fromDegrees(coords[0], coords[1]);
            
            if (!cartesian) {
                return point;
            }
            
            // 如果点在地球背面，则不显示
            if (scene.mode === Cesium.SceneMode.SCENE3D && 
                Cesium.Cartesian3.angleBetween(scene.camera.position, cartesian) > Cesium.Math.toRadians(80)) {
                return false;
            }
            
            const canvasCoords = scene.cartesianToCanvasCoordinates(cartesian);
            if (canvasCoords) {
                return [canvasCoords.x - this._mapOffset[0], canvasCoords.y - this._mapOffset[1]];
            }
            
            return point;
        }

        /**
         * 将屏幕坐标转换为经纬度
         * @param {Array} point - 屏幕坐标 [x, y]
         * @returns {Array} 经纬度坐标 [lng, lat]
         */
        pointToData(point) {
            const offset = this._mapOffset;
            const ellipsoid = this._viewer.scene.globe.ellipsoid;
            const cartesian = new Cesium.Cartesian3(point[0] + offset[0], point[1] + offset[1], 0);
            const cartographic = ellipsoid.cartesianToCartographic(cartesian);
            
            return [cartographic.longitude, cartographic.latitude];
        }

        /**
         * 获取视图矩形
         * @returns {Object} 视图矩形
         */
        getViewRect() {
            const api = this._api;
            return new echarts.graphic.BoundingRect(0, 0, api.getWidth(), api.getHeight());
        }

        /**
         * 获取漫游变换矩阵
         * @returns {Array} 变换矩阵
         */
        getRoamTransform() {
            return echarts.matrix.create();
        }

        /**
         * 创建GLMap坐标系统
         * @param {Object} ecModel - ECharts模型
         * @param {Object} api - ECharts API
         */
        static create(ecModel, api) {
            let coordSys;
            
            ecModel.eachComponent('GLMap', function(glMapModel) {
                coordSys = new GLMapCoordSys(echarts.cesiumViewer, api);
                coordSys.setMapOffset(glMapModel.__mapOffset || [0, 0]);
                glMapModel.coordinateSystem = coordSys;
            });
            
            ecModel.eachSeries(function(seriesModel) {
                if (seriesModel.get('coordinateSystem') === 'GLMap') {
                    seriesModel.coordinateSystem = coordSys;
                }
            });
        }
    }

    // 获取维度
    Object.defineProperty(GLMapCoordSys, 'dimensions', {
        get: function() {
            return ['lng', 'lat'];
        }
    });

    // 注册GLMap组件模型
    echarts.extendComponentModel({
        type: 'GLMap',
        getViewer: function() {
            return echarts.cesiumViewer;
        },
        defaultOption: {
            roam: false
        }
    });

    // 注册GLMap组件视图
    echarts.extendComponentView({
        type: 'GLMap',
        init: function(ecModel, api) {
            this.api = api;
            echarts.cesiumViewer.scene.postRender.addEventListener(this.moveHandler, this);
        },
        moveHandler: function(scene, time) {
            this.api.dispatchAction({
                type: 'GLMapRoam'
            });
        },
        render: function(glMapModel, ecModel, api) {},
        dispose: function(ecModel) {
            echarts.cesiumViewer.scene.postRender.removeEventListener(this.moveHandler, this);
        }
    });

    // 注册坐标系统
    echarts.registerCoordinateSystem('GLMap', GLMapCoordSys);
    
    // 注册GLMapRoam动作
    echarts.registerAction({
        type: 'GLMapRoam',
        event: 'GLMapRoam',
        update: 'updateLayout'
    }, function(payload, ecModel) {});
    
    // 标记已注册
    echarts.registerCoordinateSystem['GLMap'] = true;
}

export default {
    cesiumUseEcharts
};