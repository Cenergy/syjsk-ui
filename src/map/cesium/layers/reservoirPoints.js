import eventBus from "@/utils/EventBus";
import BaseLayer from "./baseLayer";
import { constant } from "@/map";

const showList = constant.MODEL_3DTILES_INFO_LIST;
const sss = showList.map((item, index) => {
  return {
    id: item.id || `reservoir_${index + 2}`,
    name: item.name || `reservoir_${index + 2}`,
    longitude: (item.postion && item.postion[0]) || item.center[0] || 0,
    latitude: (item.postion && item.postion[1]) || item.center[1] || 0,
    capacity: item.capacity || "",
    type: item.type || "",
    fontSize: item.fontSize || 40,
    event: {
      click: (e) => {
        eventBus.emit("openMapDialog", {
          type: "FloodStatistical",
          data: {name: item.name},
        });
      },
    },
  };
});

console.log(sss);
class ReservoirPointsLayer extends BaseLayer {
  constructor(options) {
    super(options);
    this.dataSource = null;
    this.isVisible = false;
    this.entities = [];

    // 标签样式配置
    this.labelConfig = {
      fontSize: options?.fontSize || 40, // 可传参数配置字体大小
      fontFamily: "Microsoft YaHei",
      fontWeight: "bold",
      fillColor: Cesium.Color.BLACK,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 3,
      showBackground: true,
      backgroundColor: Cesium.Color.WHITE.withAlpha(1),
      backgroundPadding: new Cesium.Cartesian2(12, 8),
      fontSize: options?.fontSize || 40, // 可传参数配置字体大小
    };

    // 默认水库数据 - 可以从API获取
    this.reservoirData = [
      {
        id: "reservoir_1",
        name: "上犹江水库",
        longitude: 114.37726877095041,
        latitude: 25.852612997464927,
        capacity: "1200万立方米",
        type: "1",
        // pointType: "taper",
        fontSize: 40,
        event: {
          click: (e) => {
            eventBus.emit("openMapDialog", {
              type: "Reservoir",
              data: e,
            });
          },
        },
      },
      ...sss,
    ];
  }

  /**
   * 移除点击事件处理器
   */
  removeClickHandler() {
    if (this.clickHandler) {
      this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_CLICK
      );
      this.clickHandler = null;
    }
  }

  /**
   * 移除鼠标移动事件处理器
   */
  removeMouseMoveHandler() {
    if (this.mouseMoveHandler) {
      this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.MOUSE_MOVE
      );
      this.mouseMoveHandler = null;
    }
  }

  /**
   * 设置鼠标移动事件处理器（用于鼠标悬停效果）
   */
  setupMouseMoveHandler() {
    if (this.mouseMoveHandler) {
      // 如果已经存在鼠标移动处理器，先移除
      this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.MOUSE_MOVE
      );
    }

    // 添加鼠标移动事件监听器
    this.mouseMoveHandler =
      this.viewer.cesiumWidget.screenSpaceEventHandler.setInputAction(
        (event) => {
          const pickedObject = this.viewer.scene.pick(event.endPosition);

          if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
            const entity = pickedObject.id;

            // 检查是否是水库点位实体
            if (this.entities.includes(entity)) {
              // 设置鼠标样式为手指
              this.viewer.canvas.style.cursor = "pointer";
            } else {
              // 恢复默认鼠标样式
              this.viewer.canvas.style.cursor = "default";
            }
          } else {
            // 恢复默认鼠标样式
            this.viewer.canvas.style.cursor = "default";
          }
        },
        Cesium.ScreenSpaceEventType.MOUSE_MOVE
      );
  }

  /**
   * 设置点击事件处理器
   */
  setupClickHandler() {
    if (this.clickHandler) {
      // 如果已经存在点击处理器，先移除
      this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_CLICK
      );
    }

    // 添加点击事件监听器
    this.clickHandler =
      this.viewer.cesiumWidget.screenSpaceEventHandler.setInputAction(
        (event) => {
          const pickedObject = this.viewer.scene.pick(event.position);
          if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id)) {
            const entity = pickedObject.id;

            // 检查是否是水库点位实体且有点击处理器
            if (
              entity.clickHandler &&
              typeof entity.clickHandler === "function"
            ) {
              entity.clickHandler(event, entity);
            }
          }
        },
        Cesium.ScreenSpaceEventType.LEFT_CLICK
      );
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

      // 添加点击事件监听器
      this.setupClickHandler();

      // 添加鼠标移动事件监听器（用于鼠标悬停效果）
      this.setupMouseMoveHandler();

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
        font: `${this.labelConfig.fontWeight} ${
          reservoir.fontSize || this.labelConfig.fontSize
        }pt ${this.labelConfig.fontFamily}`,
        fillColor: this.labelConfig.fillColor,
        outlineColor: this.labelConfig.outlineColor,
        outlineWidth: this.labelConfig.outlineWidth,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        showBackground: this.labelConfig.showBackground,
        backgroundColor: this.labelConfig.backgroundColor,
        backgroundPadding: this.labelConfig.backgroundPadding,
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
        width: 64,
        height: 64,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        scaleByDistance: new Cesium.NearFarScalar(1000, 1.0, 50000, 0.5),
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      };
      // 调整标签位置
      entityConfig.label.pixelOffset = new Cesium.Cartesian2(0, -70);
    }

    // 创建水库点位实体
    const entity = this.dataSource.entities.add(entityConfig);
    this.entities.push(entity);

    // 如果水库数据中有事件配置，则添加点击事件处理
    if (reservoir.event && reservoir.event.click) {
      // 为实体添加点击事件监听器
      entity.clickHandler = reservoir.event.click;
    }
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
      case "1":
        return require(`@/assets/map/icons/1.png`);
      default:
        return require(`@/assets/map/icons/2.png`);
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

      // 移除点击事件监听器
      this.removeClickHandler();

      // 移除鼠标移动事件监听器
      this.removeMouseMoveHandler();

      // 恢复默认鼠标样式
      if (this.viewer && this.viewer.canvas) {
        this.viewer.canvas.style.cursor = "default";
      }

      // 移除鼠标移动事件监听器
      this.removeMouseMoveHandler();

      // 恢复默认鼠标样式
      if (this.viewer && this.viewer.canvas) {
        this.viewer.canvas.style.cursor = "default";
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
   * 更新字体大小
   * @param {Number} fontSize 新的字体大小
   */
  updateFontSize(fontSize) {
    this.labelConfig.fontSize = fontSize;
    if (this.isVisible) {
      // 重新显示图层以应用新的字体大小
      this.hide();
      this.show();
    }
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
      // 移除点击事件监听器
      this.removeClickHandler();

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
