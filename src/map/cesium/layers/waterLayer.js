import eventBus from "@/utils/EventBus";
import BaseLayer from "./baseLayer";
import WaterErosion from "../helps/WaterErosion";

class WaterLayer extends BaseLayer {
  constructor(options) {
    super(options);
    this.waterPrimitive = null;
    this.geoJsonDataSource = null;
    this.isVisible = false;

    const waterHeight = 198.4;

    // 使用转换方法计算waterLevel
    const calculatedWaterLevel = WaterLayer.convertHeightToWaterLevel(
      waterHeight,
      172.7, // minElevation
      1936.0 // maxElevation
    );

    // 针对真实水库数据优化的默认配置参数
    this.config = {
      minElevation: 162.0,
      maxElevation: 1936.0,
      url: "./static/syjdem.png",
      width: 4376,
      height: 4518,
      center: [114.17759, 25.765831],
      extent: [113.910238, 25.491868, 114.442942, 26.039793],
      noiseUrl: "./static/texture4.png",
      // 水体渲染参数 - 针对真实水库优化
      waterLevel: calculatedWaterLevel, // 使用计算得到的水位值
      waveHeight: 0.001, // 波浪高度，较小以适应水库
      waveSpeed: 0.001, // 波浪速度，较慢更真实
      transparency: 0.0, // 透明度，保持水体透明感
      reflectivity: 0.8, // 反射率，增强水面反射
      refraction: 1.33, // 折射率，水的标准折射率
      color: [0.1, 0.4, 0.8], // 水体颜色，深蓝色
      foamColor: [0.1, 0.4, 0.8], // 泡沫颜色，白色
      // 纹理和细节参数
      textureScale: 1.0, // 纹理缩放，适应水库尺度
      normalScale: 1.0, // 法线贴图缩放
      distortionScale: 1.0, // 扭曲效果缩放
      // 动画参数
      animationSpeed: 0.8, // 动画速度
      timeScale: 1.0, // 时间缩放
    };
  }

  /**
   * 将实际高程值转换为waterLevel参数
   * @param {number} value - 实际高程值（米）
   * @param {number} minElevation - 最小高程值（米）
   * @param {number} maxElevation - 最大高程值（米）
   * @returns {number} waterLevel - 用于shader的水位参数 [0-2]
   */
  static convertHeightToWaterLevel(value, minElevation, maxElevation) {
    // 参数验证
    if (
      typeof value !== "number" ||
      typeof minElevation !== "number" ||
      typeof maxElevation !== "number"
    ) {
      throw new Error("所有参数必须为数字类型");
    }

    if (minElevation >= maxElevation) {
      throw new Error("minElevation必须小于maxElevation");
    }

    // 将实际高程值限制在有效范围内
    const clampedValue = Math.max(minElevation, Math.min(maxElevation, value));

    // 计算归一化值 [0, 1]
    const normalizedValue =
      (clampedValue - minElevation) / (maxElevation - minElevation);

    // 转换为waterLevel范围 [0, 2]
    // 使用非线性映射，让低水位更精细，高水位变化更明显
    const waterLevel = normalizedValue;

    return Math.round(waterLevel * 1000000) / 1000000; // 保留6位小数
  }

  /**
   * 将waterLevel参数转换回实际高程值
   * @param {number} waterLevel - shader水位参数 [0-2]
   * @param {number} minElevation - 最小高程值（米）
   * @param {number} maxElevation - 最大高程值（米）
   * @returns {number} 实际高程值（米）
   */
  static convertWaterLevelToHeight(waterLevel, minElevation, maxElevation) {
    // 参数验证
    if (
      typeof waterLevel !== "number" ||
      typeof minElevation !== "number" ||
      typeof maxElevation !== "number"
    ) {
      throw new Error("所有参数必须为数字类型");
    }

    if (minElevation >= maxElevation) {
      throw new Error("minElevation必须小于maxElevation");
    }

    // 将waterLevel限制在有效范围内 [0, 2]
    const clampedWaterLevel = Math.max(0, Math.min(2, waterLevel));

    // 转换为归一化值 [0, 1]
    const normalizedValue = clampedWaterLevel / 2.0;

    // 转换为实际高程值
    const height =
      minElevation + normalizedValue * (maxElevation - minElevation);

    return Math.round(height * 100) / 100; // 保留2位小数
  }

  // 获取图像资源
  async getImageSource(url) {
    try {
      const image = await Cesium.Resource.fetchImage({ url });
      return {
        minElevation: this.config.minElevation,
        maxElevation: this.config.maxElevation,
        canvas: image,
      };
    } catch (error) {
      console.error("Failed to load height map image:", error);
      throw error;
    }
  }

  // 获取噪声纹理
  async getNoiseTexture(url) {
    try {
      return await Cesium.Resource.fetchImage({ url });
    } catch (error) {
      console.error("Failed to load noise texture:", error);
      // 如果噪声纹理加载失败，返回null，WaterErosion会处理这种情况
      return null;
    }
  }

  async show(options = {}) {
    const { viewer } = this;

    if (this.isVisible && this.waterPrimitive) {
      return;
    }

    try {
      // 加载GeoJSON数据
      const geoJsonDataSource = await Cesium.GeoJsonDataSource.load(
        "/geodata/geojson/shangyoujiangshuiku.geojson",
        {
          stroke: Cesium.Color.BLUE.withAlpha(0.8),
          strokeWidth: 3,
          fill: Cesium.Color.BLUE.withAlpha(0.3),
          clampToGround: true,
          skipLevelOfDetail: true,
        }
      );

      // 添加GeoJSON数据源到viewer（作为水体边界参考）
      // viewer.dataSources.add(geoJsonDataSource);

      // 从GeoJSON获取真实的水库边界范围
      const extent = this.config.extent;
      const center = this.config.center;

      console.log("Water reservoir extent:", extent);
      console.log("Water reservoir center:", center);

      // 合并配置，使用真实数据的中心点
      const config = {
        ...this.config,
        center: center,
        ...options,
      };

      // 获取地形信息和噪声纹理
      const terrainInfo = await this.getImageSource(config.url);
      const noise = await this.getNoiseTexture(config.noiseUrl);

      // 性能优化：延迟创建，避免阻塞主线程
      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          // 创建水体渲染对象，使用真实的水库范围
          this.waterPrimitive = new WaterErosion({
            viewer,
            extent, // 使用真实的GeoJSON边界范围
            ...terrainInfo,
            noise,
            config,
          });

          // 添加到场景中
          viewer.scene.primitives.add(this.waterPrimitive);
          resolve();
        });
      });

      // 设置相机视角到真实的水体区域
      // const rectangle = Cesium.Rectangle.fromDegrees(...extent);
      // viewer.camera.flyTo({
      //   destination: rectangle,
      //   duration: 2.0, // 增加飞行时间以便更好地观察
      // });

      this.isVisible = true;
      this.geoJsonDataSource = geoJsonDataSource; // 保存引用以便后续管理

      // 发送事件通知
      eventBus.$emit("waterLayer:shown", {
        extent,
        primitive: this.waterPrimitive,
        geoJsonDataSource,
      });

      console.log("Water layer shown successfully with real data");
    } catch (error) {
      console.error("Failed to show water layer:", error);
      throw error;
    }
  }

  hide() {
    if (this.waterPrimitive && this.viewer) {
      // 性能优化：异步移除以避免阻塞
      requestAnimationFrame(() => {
        this.viewer.scene.primitives.remove(this.waterPrimitive);
        // 清理资源
        if (this.waterPrimitive.destroy) {
          this.waterPrimitive.destroy();
        }
        this.waterPrimitive = null;
        this.visible = false;
        this.isShowing = false;
      });
    }
  }

  // 更新水体参数
  updateWaterParams(newParams) {
    if (!this.waterPrimitive) return;

    // 性能优化：批量更新参数，减少重复渲染
    const updateBatch = {};
    let hasChanges = false;

    // 检查哪些参数实际发生了变化
    Object.keys(newParams).forEach((key) => {
      if (this.config[key] !== newParams[key]) {
        updateBatch[key] = newParams[key];
        this.config[key] = newParams[key];
        hasChanges = true;
      }
    });

    if (!hasChanges) return; // 没有变化则不更新

    // 使用requestAnimationFrame延迟更新，避免频繁调用
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    this.updateTimeout = setTimeout(() => {
      if (this.waterPrimitive && this.waterPrimitive.updateParams) {
        this.waterPrimitive.updateParams(updateBatch);
      } else {
        // 如果不支持动态更新，重新创建（但这会影响性能）
        this.hide();
        setTimeout(() => this.show(), 100);
      }
    }, 50); // 50ms延迟批量更新
  }

  // 设置配置
  setConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  // 获取当前状态
  isShown() {
    return this.isVisible;
  }

  // 销毁图层
  destroy() {
    this.hide();
    super.destroy && super.destroy();
  }
}

export default new WaterLayer();
