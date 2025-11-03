import eventBus from "@/utils/EventBus";
import BaseLayer from "./baseLayer";
import {constant}  from "@/map";

const showList=constant.MODEL_3DTILES_INFO_LIST;
const sss=showList.map((item,index) => {
        return {
          id: item.id||`reservoir_${index+2}`,
          name: item.name||`reservoir_${index+2}`,
          longitude: item.center[0]||0,
          latitude: item.center[1]||0,
          capacity: item.capacity||"",
          type: item.type||"",
          pointType: "taper",
        };
      })

      console.log(sss);
class ReservoirPointsLayer extends BaseLayer {
  constructor(options) {
    super(options);
    this.dataSource = null;
    this.isVisible = false;
    this.entities = [];

    // 默认水库数据 - 可以从API获取
    this.reservoirData = [
      {
        id: "reservoir_1",
        name: "上犹江水库",
        longitude: 114.36371819272142,
        latitude: 25.852494116267355,
        capacity: "1200万立方米",
        type: "大型水库",
        pointType: "taper",
      },
      ...sss,
    ];
  }

  /**
   * 显示水库点位图层
   * @param {Object} options 配置选项
   */
  async show(options = {}) {
    if (this.isVisible) return;

    try {
      // 创建数据源
      if (!this.dataSource) {
        this.dataSource = new Cesium.CustomDataSource("reservoirPoints");
        this.viewer.dataSources.add(this.dataSource);
      }

      // 清除现有实体
      this.dataSource.entities.removeAll();
      this.entities = [];

      // 添加水库点位
      this.reservoirData.forEach((reservoir) => {
        this.addReservoirPoint(reservoir);
      });

      this.isVisible = true;
      this.hasLoaded = true;

      console.log("水库点位图层显示成功");
    } catch (error) {
      console.error("显示水库点位图层失败:", error);
    }
  }

  /**
   * 添加单个水库点位
   * @param {Object} reservoir 水库数据
   */
  addReservoirPoint(reservoir) {
    const position = Cesium.Cartesian3.fromDegrees(
      reservoir.longitude,
      reservoir.latitude,
      reservoir.height || 50 // 使用配置的高度或默认50米
    );

    // 根据pointType决定渲染方式
    let entityConfig = {
      id: reservoir.id,
      position: position,
      // 文字标签
      label: {
        text: reservoir.name,
        font: "bold 24pt Microsoft YaHei",
        fillColor: Cesium.Color.BLACK,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 3,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        backgroundColor: Cesium.Color.fromCssColorString('rgba(255, 255, 255, 0.9)'),
        backgroundPadding: new Cesium.Cartesian2(12, 8),
        pixelOffset: new Cesium.Cartesian2(0, -40),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        scaleByDistance: new Cesium.NearFarScalar(1000, 1.0, 50000, 0.3),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
      // 自定义属性
      properties: {
        name: reservoir.name,
        capacity: reservoir.capacity,
        type: reservoir.type,
        longitude: reservoir.longitude,
        latitude: reservoir.latitude,
        pointType: reservoir.pointType,
      },
    };

    // 根据pointType选择渲染方式
    if (
      reservoir.pointType === "downTaper" ||
      reservoir.pointType === "taper"
    ) {
      // 根据类型决定锥子方向
      let topRadius, bottomRadius, labelOffset;

      if (reservoir.pointType === "taper") {
        // 正锥子形式 - 尖端向上
        topRadius = 30.0; // 顶部半径
        bottomRadius = 0.0; // 底部半径为0，形成锥形
        labelOffset = new Cesium.Cartesian2(0, -40); // 标签在锥子下方
      } else {
        // 倒锥子形式 - 尖端向下
        topRadius = 0.0; // 顶部半径为0，形成锥形
        bottomRadius = 30.0; // 底部半径
        labelOffset = new Cesium.Cartesian2(0, -120); // 标签在锥子上方
      }

      entityConfig.cylinder = {
        length: 100.0, // 锥子高度
        topRadius: topRadius,
        bottomRadius: bottomRadius,
        material: Cesium.Color.CYAN.withAlpha(0.8),
        outline: true,
        outlineColor: Cesium.Color.WHITE,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        extrudedHeight: 100.0, // 拉伸高度
      };
      // 调整标签位置
      entityConfig.label.pixelOffset = labelOffset;
    } else {
      // 默认图片形式 - 使用billboard
      entityConfig.billboard = {
        image: this.getReservoirIcon(reservoir.type), // 根据水库类型获取图标
        width: 32,
        height: 32,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        scaleByDistance: new Cesium.NearFarScalar(1000, 1.0, 50000, 0.5),
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      };
      // 调整标签位置
      entityConfig.label.pixelOffset = new Cesium.Cartesian2(0, -50);
    }

    // 创建水库点位实体
    const entity = this.dataSource.entities.add(entityConfig);
    this.entities.push(entity);
  }

  /**
   * 根据水库类型获取对应的图标
   * @param {String} type 水库类型
   * @returns {String} 图标路径
   */
  getReservoirIcon(type) {
    // 这里可以根据不同的水库类型返回不同的图标
    // 目前使用一个通用的水库图标，您可以根据需要添加不同的图标
    switch (type) {
      case "大型水库":
        return (
          "data:image/svg+xml;base64," +
          btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="14" fill="#0080ff" stroke="#ffffff" stroke-width="2"/>
            <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-family="Arial">大</text>
          </svg>
        `)
        );
      case "中型水库":
        return (
          "data:image/svg+xml;base64," +
          btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="12" fill="#00a0ff" stroke="#ffffff" stroke-width="2"/>
            <text x="16" y="20" text-anchor="middle" fill="white" font-size="10" font-family="Arial">中</text>
          </svg>
        `)
        );
      case "小型水库":
        return (
          "data:image/svg+xml;base64," +
          btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="10" fill="#00c0ff" stroke="#ffffff" stroke-width="2"/>
            <text x="16" y="20" text-anchor="middle" fill="white" font-size="8" font-family="Arial">小</text>
          </svg>
        `)
        );
      default:
        return (
          "data:image/svg+xml;base64," +
          btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="12" fill="#00ffff" stroke="#ffffff" stroke-width="2"/>
            <text x="16" y="20" text-anchor="middle" fill="white" font-size="10" font-family="Arial">水</text>
          </svg>
        `)
        );
    }
  }

  /**
   * 隐藏水库点位图层
   */
  hide() {
    if (!this.isVisible) return;

    try {
      if (this.dataSource) {
        this.dataSource.entities.removeAll();
      }

      this.isVisible = false;
      console.log("水库点位图层已隐藏");
    } catch (error) {
      console.error("隐藏水库点位图层失败:", error);
    }
  }

  /**
   * 更新水库数据
   * @param {Array} newData 新的水库数据
   */
  updateReservoirData(newData) {
    this.reservoirData = newData;
    if (this.isVisible) {
      this.hide();
      this.show();
    }
  }

  /**
   * 定位到指定水库
   * @param {String} reservoirId 水库ID
   */
  flyToReservoir(reservoirId) {
    const reservoir = this.reservoirData.find((r) => r.id === reservoirId);
    if (!reservoir) {
      console.warn(`未找到ID为 ${reservoirId} 的水库`);
      return;
    }

    const position = Cesium.Cartesian3.fromDegrees(
      reservoir.longitude,
      reservoir.latitude,
      2000 // 飞行高度
    );

    this.viewer.camera.flyTo({
      destination: position,
      duration: 2.0,
    });
  }

  /**
   * 获取水库信息
   * @param {String} reservoirId 水库ID
   * @returns {Object} 水库信息
   */
  getReservoirInfo(reservoirId) {
    return this.reservoirData.find((r) => r.id === reservoirId);
  }

  /**
   * 检查图层是否可见
   * @returns {Boolean}
   */
  isShown() {
    return this.isVisible;
  }

  /**
   * 销毁图层
   */
  destroy() {
    try {
      if (this.dataSource) {
        this.viewer.dataSources.remove(this.dataSource);
        this.dataSource = null;
      }

      this.entities = [];
      this.isVisible = false;
      this.hasLoaded = false;

      console.log("水库点位图层已销毁");
    } catch (error) {
      console.error("销毁水库点位图层失败:", error);
    }
  }
}

export default new ReservoirPointsLayer();
