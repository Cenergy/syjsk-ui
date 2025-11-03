import BaseLayer from "./baseLayer";
import * as request from "@/api/map";
import { turf } from "swpdmap";

class WeatherGrid extends BaseLayer {
  constructor(options) {
    super(options);
    this.gridEntities = [];
    this.hoveredEntity = null;
  }
  
  async show() {
    const { viewer, id } = this;
    
    // 如果已经加载过，则直接显示
    if (this.hasLoaded && this.gridEntities.length > 0) {
      this.gridEntities.forEach(entity => entity.show = true);
      return;
    }
    
    const { code, data } = await request.getQxGrid({ name: "光明新区" });
    if (code !== 200 || !data.length) return;
    
    const featurePolygon = data
      .filter((item) => {
        return item.areaname === "光明新区";
      })
      .map((item) => {
        const { x1, y1, x2, y2 } = item;
        console.log("🚀 ~ WeatherGrid ~ .map ~ x1, y1, x2, y2:", x1, y1, x2, y2);
        const polygon = turf.polygon(
          [
            [
              [Number(x1), Number(y1)],
              [Number(x1), Number(y2)],
              [Number(x2), Number(y2)],
              [Number(x2), Number(y1)],
              [Number(x1), Number(y1)],
            ],
          ],
          item
        );
        return polygon;
      });
    
    const gridFeatures = turf.featureCollection(featurePolygon);
    
    // 将GeoJSON数据渲染到地图上
    gridFeatures.features.forEach((feature, index) => {
      const coordinates = feature.geometry.coordinates[0];
      
      // 打印四个点的经纬度
      console.log(`网格 ${index} 的四个点经纬度:`);
      coordinates.slice(0, 4).forEach((coord, pointIndex) => {
        console.log(`  点${pointIndex + 1}: 经度=${coord[0]}, 纬度=${coord[1]}`);
      });
      
      const positions = coordinates.map(coord => 
        Cesium.Cartesian3.fromDegrees(coord[0], coord[1])
      );
      
      const entity = viewer.entities.add({
        id: `weather-grid-${index}`,
        name: `气象网格-${index}`,
        polygon: {
          hierarchy: positions,
          material: Cesium.Color.fromCssColorString("#6ba7de").withAlpha(0.01), // 设置极小的透明度，让整个区域可以被鼠标检测
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString("#2f8ffc"),
          outlineWidth: 2,
          height: 0, // 设置固定高度，让所有网格在同一高度层
        },
        properties: {
          originalData: feature.properties,
          isWeatherGrid: true
        }
      });
      
      this.gridEntities.push(entity);
    });
    
    // 添加鼠标悬浮事件
    this.setupMouseEvents(viewer);
    
    this.hasLoaded = true;
  }
  
  setupMouseEvents(viewer) {
    // 鼠标移动事件
    viewer.screenSpaceEventHandler.setInputAction((event) => {
      const pickedObject = viewer.scene.pick(event.endPosition);
      
      if (pickedObject && pickedObject.id && pickedObject.id.properties && 
          pickedObject.id.properties.isWeatherGrid) {
        
        // 如果当前悬浮的实体不是新选中的实体，恢复之前的样式
        if (this.hoveredEntity && this.hoveredEntity !== pickedObject.id) {
          this.resetEntityStyle(this.hoveredEntity);
        }
        
        // 设置新的悬浮样式
        if (this.hoveredEntity !== pickedObject.id) {
          this.setHoverStyle(pickedObject.id);
          this.hoveredEntity = pickedObject.id;
          
          // 打印当前悬浮网格的四个角点坐标
          const originalData = pickedObject.id.properties.originalData;
          if (originalData && originalData.getValue) {
            const data = originalData.getValue();
            if (data.x1 && data.y1 && data.x2 && data.y2) {
              console.log(`悬浮网格的四个角点坐标:`);
              console.log(`  左下角: 经度=${data.x1}, 纬度=${data.y1}`);
              console.log(`  左上角: 经度=${data.x1}, 纬度=${data.y2}`);
              console.log(`  右上角: 经度=${data.x2}, 纬度=${data.y2}`);
              console.log(`  右下角: 经度=${data.x2}, 纬度=${data.y1}`);
            }
          }
        }
        
        viewer.canvas.style.cursor = 'pointer';
      } else {
        // 鼠标离开，恢复样式
        if (this.hoveredEntity) {
          this.resetEntityStyle(this.hoveredEntity);
          this.hoveredEntity = null;
        }
        viewer.canvas.style.cursor = 'default';
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }
  
  setHoverStyle(entity) {
    if (entity.polygon) {
      entity.polygon.material = Cesium.Color.fromCssColorString("red").withAlpha(0.2);
      entity.polygon.outlineColor = Cesium.Color.fromCssColorString("red");
      entity.polygon.outlineWidth = 3;
    }
  }
  
  resetEntityStyle(entity) {
    if (entity.polygon) {
      entity.polygon.material = Cesium.Color.fromCssColorString("#6ba7de").withAlpha(0.01); // 保持极小的透明度
      entity.polygon.outlineColor = Cesium.Color.fromCssColorString("#2f8ffc");
      entity.polygon.outlineWidth = 2;
    }
  }
  
  setLegend() {}

  hide() {
    // 隐藏所有网格实体
    this.gridEntities.forEach(entity => entity.show = false);
    
    // 重置悬浮状态
    if (this.hoveredEntity) {
      this.hoveredEntity = null;
    }
  }
}
export default new WeatherGrid();
