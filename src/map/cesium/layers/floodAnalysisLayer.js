import BaseLayer from "./baseLayer";
import eventBus from "@/utils/EventBus";
import SubmergenceAnalysis from "../helps/SubmergenceAnalysis";

const regoinFeatures = {
  type: "Feature",
  properties: {},
  geometry: {
    coordinates: [
      [
        [113.90339095544039, 22.803223776303625],
        [113.90318993050329, 22.802977815061453],
        [113.90298037723682, 22.80316200525725],
        [113.90276838730523, 22.802964337720013],
        [113.9031460705171, 22.802674574562502],
        [113.90325328381635, 22.802771162350112],
        [113.90369919367515, 22.803354056964793],
        [113.90359685370805, 22.803446151839182],
        [113.90343116042618, 22.803558462578238],
        [113.9033434404555, 22.803513538293416],
        [113.90346892874834, 22.80337314980936],
        [113.90339095544039, 22.803223776303625],
      ],
    ],
    type: "Polygon",
  },
};

class FloodAnalysisLayer extends BaseLayer {
  constructor(options) {
    super(options);
    this.submergenceAnalysis = null;
    this.floodLevel = 1; // 淹没水位等级 (1-5)
    this.floodColors = {
      1: Cesium.Color.fromBytes(64, 157, 253, 100),
      2: Cesium.Color.fromBytes(54, 147, 243, 120),
      3: Cesium.Color.fromBytes(44, 137, 233, 140),
      4: Cesium.Color.fromBytes(34, 127, 223, 160),
      5: Cesium.Color.fromBytes(24, 117, 213, 180),
    };

    // 绑定dat.gui事件监听器
    this.bindDatGuiEvents();
    this.legend = {
      label: "淹没分析",
      levels: [
        { level: 1, color: "#409EFD", label: "轻度淹没 (0-4m)" },
        { level: 2, color: "#3693F3", label: "中度淹没 (4-8m)" },
        { level: 3, color: "#2C89E9", label: "重度淹没 (8-12m)" },
        { level: 4, color: "#227FDF", label: "严重淹没 (12-16m)" },
        { level: 5, color: "#1875D5", label: "极度淹没 (>16m)" },
      ],
    };
    // 淹没区域坐标
    this.floodCoordinates =
      this.convertGeoJsonToFlatCoordinates(regoinFeatures);
  }

  /**
   * 将GeoJSON Feature格式的坐标转换为扁平数组格式
   * @param {Object} geoJsonFeature - GeoJSON Feature对象
   * @returns {Array} 扁平的坐标数组 [lng1, lat1, lng2, lat2, ...]
   */
  convertGeoJsonToFlatCoordinates(geoJsonFeature) {
    if (!geoJsonFeature || !geoJsonFeature.geometry) {
      console.warn("Invalid GeoJSON Feature: missing geometry");
      return [];
    }

    const { geometry } = geoJsonFeature;

    if (geometry.type !== "Polygon") {
      console.warn("Only Polygon geometry is supported");
      return [];
    }

    if (!geometry.coordinates || !geometry.coordinates[0]) {
      console.warn("Invalid Polygon coordinates");
      return [];
    }

    // 获取外环坐标（第一个数组）
    const outerRing = geometry.coordinates[0];

    // 将二维坐标数组转换为扁平数组
    const flatCoordinates = [];
    outerRing.forEach((coord) => {
      if (Array.isArray(coord) && coord.length >= 2) {
        flatCoordinates.push(coord[0], coord[1]); // lng, lat
      }
    });

    return flatCoordinates;
  }

  async show(options = {}) {
    const { viewer } = this;

    // 设置图例
    this.setLegend();

    // 清除之前的淹没分析
    if (this.submergenceAnalysis) {
      this.submergenceAnalysis.clear();
    }

    eventBus.emit("addMapDetail", {
      value: "floodAnalysis",
      label: "淹没分析",
    });
    // 深度监测
    viewer.scene.globe.depthTestAgainstTerrain = true;
    // 生成随机淹没参数
    const randomHeight = Math.random() * 15 + 5; // 5-20米随机高度（增加高度范围）
    const randomLevel = Math.ceil(randomHeight / 4); // 根据高度计算等级
    this.floodLevel = Math.min(randomLevel, 5); // 确保等级不超过5

    // 创建新的淹没分析实例
    this.submergenceAnalysis = new SubmergenceAnalysis({
      viewer: viewer,
      targetHeight: randomHeight,
      startHeight: 0,
      waterHeight: 0,
      adapCoordi: this.floodCoordinates,
      speed: 5, // 增加淹没速度，让动画更明显
      color: this.floodColors[this.floodLevel],
      changetype: "up",
      speedCallback: (height) => {},
      endCallback: () => {
        console.log(`淹没分析完成`);
      },
    });

    // 开始淹没动画
    this.submergenceAnalysis.start();

    // 飞行到淹没区域
    this.flyToFloodArea();

    this.hasLoaded = true;
  }

  // 获取当前淹没信息
  getCurrentFloodInfo() {
    if (!this.submergenceAnalysis) {
      return null;
    }

    return {
      level: this.floodLevel,
      height: this.submergenceAnalysis.waterHeight,
      targetHeight: this.submergenceAnalysis.targetHeight,
      riskLevel: this.getRiskLevel(this.floodLevel),
    };
  }

  getRiskLevel(level) {
    const riskLevels = {
      1: "低风险",
      2: "中等风险",
      3: "高风险",
      4: "极高风险",
      5: "危险",
    };
    return riskLevels[level] || "未知";
  }

  // 绑定dat.gui事件监听器
  bindDatGuiEvents() {
    // 监听更新淹没高度事件
    eventBus.on("updateFloodHeight", (height) => {
      this.updateFloodHeight(height);
    });

    // 监听更新动画速度事件
    eventBus.on("updateFloodSpeed", (speed) => {
      this.updateFloodSpeed(speed);
    });

    // 监听切换动画状态事件
    eventBus.on("toggleFloodAnimation", (enabled) => {
      this.toggleFloodAnimation(enabled);
    });

    // 监听更新透明度事件
    eventBus.on("updateFloodTransparency", (transparency) => {
      this.updateFloodTransparency(transparency);
    });

    // 监听开始淹没分析事件
    eventBus.on("startFloodAnalysis", (params) => {
      this.startFloodAnalysisWithParams(params);
    });

    // 监听停止淹没分析事件
    eventBus.on("stopFloodAnalysis", () => {
      this.stopFloodAnalysis();
    });
  }

  // 更新淹没高度
  updateFloodHeight(height) {
    if (this.submergenceAnalysis) {
      this.submergenceAnalysis.targetHeight = height;
      this.submergenceAnalysis.waterHeight = height;

      // 重新计算等级
      const newLevel = Math.ceil(height / 4);
      this.floodLevel = Math.min(newLevel, 5);

      // 更新颜色
      if (this.submergenceAnalysis.polygonEntity) {
        this.submergenceAnalysis.polygonEntity.polygon.material =
          this.floodColors[this.floodLevel];
      }

      console.log(
        `淹没高度已更新为: ${height.toFixed(2)}m，等级: ${this.floodLevel}`
      );
    }
  }

  // 更新动画速度
  updateFloodSpeed(speed) {
    if (this.submergenceAnalysis) {
      this.submergenceAnalysis.speed = speed;
      console.log(`动画速度已更新为: ${speed}`);
    }
  }

  // 切换动画状态
  toggleFloodAnimation(enabled) {
    if (this.submergenceAnalysis) {
      if (enabled) {
        if (!this.submergenceAnalysis.timer) {
          this.submergenceAnalysis.start();
          console.log("淹没动画已启动");
        }
      } else {
        this.submergenceAnalysis.clear();
        console.log("淹没动画已停止");
      }
    }
  }

  // 更新透明度
  updateFloodTransparency(transparency) {
    if (this.submergenceAnalysis && this.submergenceAnalysis.polygonEntity) {
      const currentColor = this.floodColors[this.floodLevel];
      const newColor = new Cesium.Color(
        currentColor.red,
        currentColor.green,
        currentColor.blue,
        transparency
      );
      this.submergenceAnalysis.polygonEntity.polygon.material = newColor;
      console.log(`透明度已更新为: ${transparency}`);
    }
  }

  // 使用参数开始淹没分析
  startFloodAnalysisWithParams(params) {
    console.log("startFloodAnalysisWithParams called with params:", params);

    if (!params) {
      console.error("startFloodAnalysisWithParams: params is undefined");
      return;
    }

    const { height, speed, transparency } = params;

    if (
      height === undefined ||
      speed === undefined ||
      transparency === undefined
    ) {
      console.error(
        "startFloodAnalysisWithParams: missing required parameters",
        { height, speed, transparency }
      );
      return;
    }

    if (!this.floodCoordinates || this.floodCoordinates.length === 0) {
      console.error("startFloodAnalysisWithParams: floodCoordinates is empty");
      return;
    }

    console.log(
      "startFloodAnalysisWithParams: all validations passed, starting analysis"
    );

    // 清除之前的分析
    if (this.submergenceAnalysis) {
      this.submergenceAnalysis.clear();
    }

    // 计算等级
    const level = Math.ceil(height / 4);
    this.floodLevel = Math.min(level, 5);

    // 创建新的淹没分析实例
    this.submergenceAnalysis = new SubmergenceAnalysis({
      viewer: this.viewer,
      targetHeight: height,
      startHeight: 0,
      waterHeight: 0,
      adapCoordi: this.floodCoordinates,
      speed: speed,
      color: new Cesium.Color(
        this.floodColors[this.floodLevel].red,
        this.floodColors[this.floodLevel].green,
        this.floodColors[this.floodLevel].blue,
        transparency
      ),
      changetype: "up",
      speedCallback: (currentHeight) => {},
      endCallback: () => {
        console.log(`淹没分析完成`);
      },
    });

    // 开始淹没动画
    this.submergenceAnalysis.start();

    console.log(
      `开始淹没分析 - 高度: ${height}m, 速度: ${speed}, 透明度: ${transparency}`
    );
  }

  // 停止淹没分析
  stopFloodAnalysis() {
    if (this.submergenceAnalysis) {
      this.submergenceAnalysis.clear();
      console.log("淹没分析已停止");
    }
  }

  hide() {
    // 清除淹没分析
    if (this.submergenceAnalysis) {
      this.submergenceAnalysis.clear();
      this.submergenceAnalysis = null;
    }

    // 清除事件监听器
    this.unbindDatGuiEvents();
  }

  // 解绑dat.gui事件监听器
  unbindDatGuiEvents() {
    eventBus.off("updateFloodHeight");
    eventBus.off("updateFloodSpeed");
    eventBus.off("toggleFloodAnimation");
    eventBus.off("updateFloodTransparency");
    eventBus.off("startFloodAnalysis");
    eventBus.off("stopFloodAnalysis");
  }

  hide() {
    // 清除淹没分析
    if (this.submergenceAnalysis) {
      this.submergenceAnalysis.clear();
      this.submergenceAnalysis = null;
    }

    // 清除事件监听器
    this.unbindDatGuiEvents();

    // 移除图例
    this.delLegend();
  }

  setLegend() {
    eventBus.emit("setLegend", {
      type: "floodAnalysis",
      data: this.legend,
    });
  }

  delLegend() {
    eventBus.emit("closeLegend", {
      type: "floodAnalysis",
      data: this.legend,
    });
  }

  // 设置淹没等级（重新生成随机淹没）
  setFloodLevel(level) {
    if (level >= 1 && level <= 5) {
      this.floodLevel = level;
      // 重新显示淹没分析
      this.show();
    }
  }

  // 清除所有淹没分析
  clear() {
    if (this.submergenceAnalysis) {
      this.submergenceAnalysis.clear();
      this.submergenceAnalysis = null;
    }
    this.hasLoaded = false;
    this.delLegend();
  }

  // 导出淹没分析结果
  exportFloodData() {
    const floodInfo = this.getCurrentFloodInfo();
    if (!floodInfo) {
      return null;
    }

    return {
      timestamp: new Date().toISOString(),
      floodLevel: floodInfo.level,
      currentHeight: floodInfo.height,
      targetHeight: floodInfo.targetHeight,
      riskLevel: floodInfo.riskLevel,
      coordinates: this.floodCoordinates,
    };
  }

  // 飞行到淹没区域
  flyToFloodArea() {
    const { viewer } = this;
    if (!viewer) return;

    const caclCoord = this.getFeaturesCenter(regoinFeatures);
    if (!caclCoord) return;
    const [long, lat] = caclCoord;
    console.log(
      "🚀 ~ FloodAnalysisLayer ~ flyToFloodArea ~ caclCoord:",
      caclCoord
    );

    // 飞行到深圳淹没区域的中心位置
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        long, // 经度 (新范围中心点)
        lat - 0.008, // 纬度 (新范围中心点)
        1000 // 高度
      ),
      duration: 2.0, // 飞行时间（秒）
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-45),
        roll: 0.0,
      },
    });
  }
}

export default new FloodAnalysisLayer();
