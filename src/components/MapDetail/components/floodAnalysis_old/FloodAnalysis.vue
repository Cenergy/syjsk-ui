<template>
  <div
    style="
      display: flex;
      flex-direction: column;
      height: calc(100vh - 165px);
      color: #fff !important;
    "
  >
    <ZebraTitle style="margin-bottom: 15px">
      <span
        style="
          font-family: Source Han Sans CN;
          font-weight: 700;
          font-size: 16px;
          line-height: 28px;
          letter-spacing: 0%;
          color: #fff;
        "
        >查询条件</span
      >
    </ZebraTitle>
    <el-form label-width="80px" label-position="right" size="mini">
      <el-form-item label="典型水位" style="color: #fff !important">
        <div style="display: flex; align-items: center">
          <el-select
            v-model="query.value"
            placeholder="选择典型水位"
            style="width: 80%"
            allow-create
            filterable
            @change="handleWaterLevelChange"
          >
            <el-option label="正常蓄水位" value="198.4"></el-option>
            <el-option label="199.1" value="199.1"></el-option>
            <el-option label="199.6" value="199.6"></el-option>
            <el-option label="200.1" value="200.1"></el-option>
            <el-option label="校核洪水位" value="200.6"></el-option>
          </el-select>
          <span style="color: #fff; margin-left: 8px">米</span>
        </div>
      </el-form-item>

      <div style="display: flex; min-height: 70px;margin-top: 25px;">
        <div class="slider_label" style="color: #fff; margin-right: 8px">
          设置水位
        </div>
        <div style="flex: 1; padding: 0 10px 0 0">
          <MySlider
            :value="waterLevelSlider"
            :min="192"
            :max="202.5"
            :step="0.1"
            :color-segments="waterLevelColorSegments"
            :marks="waterLevelMarksArray"
            @input="handleWaterLevelChange"
          />
        </div>
      </div>
    </el-form>
    <ZebraTitle>
      <div style="display: flex; justify-content: space-between; width: 100%">
        <span
          style="
            font-family: Source Han Sans CN;
            font-weight: 700;
            font-size: 16px;
            line-height: 28px;
            letter-spacing: 0%;
            color: #fff;
          "
          >影响区域列表(共{{ data.length }}条记录)</span
        >
        <el-button type="primary" size="mini" @click="handleRowDblClick"
          >查看详情</el-button
        >
      </div>
    </ZebraTitle>
    <div
      class="tableContainer"
      style="flex: 1; overflow: hidden; display: flex; flex-direction: column"
    >
      <el-table :data="data" size="mini" height="60%" @row-click="handleRowClick">
        <el-table-column
          align="center"
          width="150"
          label="名称"
          prop="name"
        ></el-table-column>
        <el-table-column
          align="center"
          width="150"
          label="影响区域"
          prop="area"
        ></el-table-column>
        <el-table-column
          align="center"
          width="150"
          label="最大积水深度(m)"
          prop="depth"
        ></el-table-column>
      </el-table>
      <div class="flood-analysis-info" style="flex: 0; overflow: hidden">
        <div id="dat-gui-container"></div>
      </div>
      <EffectSta style="flex: 1"></EffectSta>
    </div>
  </div>
</template>

<script>
import { constant } from "@/map";
import { GUI } from "lil-gui";
import waterLayer from "@/map/cesium/layers/waterLayer";
import EffectSta from "./EffectSta";
import ColorSegmentSlider from "@/components/ColorSegmentSlider/index.vue";
import CustomSlider from "@/components/CustomSlider/index.vue";
import CSDNSlider from "@/components/CSDNSlider/index.vue";
import MySlider from "@/components/MySlider/MySlider.vue";
import ColorSlider from "@/components/ColorSlider/index.js";


const {EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT} = constant;


export default {
  components: {
    EffectSta,
    ColorSegmentSlider,
    CustomSlider,
    CSDNSlider,
    MySlider,
    ColorSlider,
  },
  data() {
    return {
      query: {
        hdnm: "",
        keyword: "",
        value: "198.4",
        ll: 20,
        sw: 30,
      },
      data: [],
      rawData: [],
      checkboxList: [],
      currentEffectLayer: null, // 当前影响范围线图层
      currentWaterInfo: null, // 当前选中的水位信息
      waterLevelSlider: 198.4, // 滑动块水位值，默认198.4m
      bandWidth: 1000, // 带宽设置，默认1000M
      gui: null,
      isInitialized: false, // 添加初始化标志

      // 水位滑动块的颜色分段配置
      waterLevelColorSegments: [
        { start: 192, end: 198.4, color: "#3c4ae6ff" }, // 安全水位 - 绿色
        { start: 198.4, end: 200.6, color: "#ffff00" }, // 警戒水位 - 橙色
        { start: 200.6, end: 202.5, color: "#F56C6C" }, // 危险水位 - 红色
      ],

      // 水位滑动块的标记点配置
      waterLevelMarks: {
        192: "死水位",
        198.4: "正常蓄水位",
        200.6: "校核洪水位",
        202.5: "最高水位",
      },

      // 水位滑动块的标记点数组格式（用于MySlider组件）
      waterLevelMarksArray: {
        192: {
          style: {
            color: "#00ff00",
          },
          label: "192米",
        },
        198.4: {
          style: {
            color: "#3c4ae6ff",
          },
          label: "正常蓄水位",
        },
        200.6: {
          style: {
            color: "#ffff00",
          },
          label: "校核洪水位",
        },
        202.5: {
          style: {
            color: "#ff0000",
          },
          label: "坝顶高程",
        },
      },

      // 水体渲染参数 - 对应waterLayer.js中的config
      waterParams: {
        waterLevel: 198.4, // 使用计算得到的水位值
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
      },
      // 参数范围定义
      rangeParams: {
        waterLevel: [192, 202.5], // 显示范围：150-300，使用 WaterLayer.convertHeightToWaterLevel 转换为 waterLevel 参数
        waveHeight: [0.0, 1.0],
        waveSpeed: [0.001, 0.1],
        transparency: [0.0, 1.0],
        reflectivity: [0.0, 1.0],
        refraction: [1.0, 2.0],
        textureScale: [0.5, 5.0],
        normalScale: [0.5, 3.0],
        distortionScale: [0.1, 2.0],
        animationSpeed: [0.1, 2.0],
        timeScale: [0.1, 3.0],
      },

      // ColorSlider 组件数据
      cpuSlider: {
        val: 6,
        total: 16,
        min: 0,
        allocated: 8,
      },
      memorySlider: {
        val: 8,
        total: 32,
        min: 0,
        allocated: 16,
      },
    };
  },
  methods: {
    // ColorSlider 事件处理方法
    handleCpuSliderChange(value) {
      console.log("CPU滑块值变化:", value);
      // 这里可以添加具体的业务逻辑
    },
    handleMemorySliderChange(value) {
      console.log("内存滑块值变化:", value);
      // 这里可以添加具体的业务逻辑
    },

    initDatGUI() {
      // 创建lil-gui实例
      this.gui = new GUI({ autoPlace: false });

      // 将GUI添加到指定容器
      const container = document.getElementById("dat-gui-container");
      if (container) {
        container.appendChild(this.gui.domElement);
      }

      // 水体基础参数控制
      const waterFolder = this.gui.addFolder("水体参数");
      waterFolder
        .add(this.waterParams, "waterLevel", ...this.rangeParams.waterLevel)
        .name("水位高度")
        .onChange((value) => {
          if (this.isInitialized) {
            this.updateWaterParams({ waterLevel: value });
          }
        });
      waterFolder
        .add(this.waterParams, "transparency", ...this.rangeParams.transparency)
        .name("透明度")
        .onChange((value) => {
          if (this.isInitialized) {
            this.updateWaterParams({ transparency: value });
          }
        });
      waterFolder
        .add(this.waterParams, "reflectivity", ...this.rangeParams.reflectivity)
        .name("反射率")
        .onChange((value) => {
          if (this.isInitialized) {
            this.updateWaterParams({ reflectivity: value });
          }
        });
      waterFolder
        .add(this.waterParams, "refraction", ...this.rangeParams.refraction)
        .name("折射率")
        .onChange((value) => {
          if (this.isInitialized) {
            this.updateWaterParams({ refraction: value });
          }
        });
      waterFolder.open();

      // 波浪效果控制
      const waveFolder = this.gui.addFolder("波浪效果");
      waveFolder
        .add(this.waterParams, "waveHeight", ...this.rangeParams.waveHeight)
        .name("波浪高度")
        .onChange((value) => {
          if (this.isInitialized) {
            this.updateWaterParams({ waveHeight: value });
          }
        });
      waveFolder
        .add(this.waterParams, "waveSpeed", ...this.rangeParams.waveSpeed)
        .name("波浪速度")
        .onChange((value) => {
          if (this.isInitialized) {
            this.updateWaterParams({ waveSpeed: value });
          }
        });
      waveFolder.open();

      // 纹理和细节控制
      const textureFolder = this.gui.addFolder("纹理细节");
      textureFolder
        .add(this.waterParams, "textureScale", ...this.rangeParams.textureScale)
        .name("纹理缩放")
        .onChange((value) => {
          if (this.isInitialized) {
            this.updateWaterParams({ textureScale: value });
          }
        });
      textureFolder
        .add(this.waterParams, "normalScale", ...this.rangeParams.normalScale)
        .name("法线缩放")
        .onChange((value) => {
          if (this.isInitialized) {
            this.updateWaterParams({ normalScale: value });
          }
        });
      textureFolder
        .add(this.waterParams, "distortionScale", ...this.rangeParams.distortionScale)
        .name("扭曲缩放")
        .onChange((value) => {
          if (this.isInitialized) {
            this.updateWaterParams({ distortionScale: value });
          }
        });
      textureFolder.open();

      // 动画控制
      const animationFolder = this.gui.addFolder("动画控制");
      animationFolder
        .add(this.waterParams, "animationSpeed", ...this.rangeParams.animationSpeed)
        .name("动画速度")
        .onChange((value) => {
          if (this.isInitialized) {
            this.updateWaterParams({ animationSpeed: value });
          }
        });
      animationFolder
        .add(this.waterParams, "timeScale", ...this.rangeParams.timeScale)
        .name("时间缩放")
        .onChange((value) => {
          if (this.isInitialized) {
            this.updateWaterParams({ timeScale: value });
          }
        });
      animationFolder.open();

      // 操作控制
      const actions = {
        showWater: () => this.showWaterLayer(),
        hideWater: () => this.hideWaterLayer(),
        resetParams: () => this.resetWaterParams(),
      };

      const controlFolder = this.gui.addFolder("操作控制");
      controlFolder.add(actions, "showWater").name("显示水体");
      controlFolder.add(actions, "hideWater").name("隐藏水体");
      controlFolder.add(actions, "resetParams").name("重置参数");
      controlFolder.open();

      // 延迟设置初始化标志，避免初始化时触发事件
      setTimeout(() => {
        this.isInitialized = true;
      }, 100);
    },

    getWaterLevelValue(value) {
      const minElevation = 172.7; // 最小显示值
      const maxElevation = 1936.0; // 最大显示值

      // 使用 WaterLayer.convertHeightToWaterLevel 进行转换
      return waterLayer.constructor.convertHeightToWaterLevel(
        value,
        minElevation,
        maxElevation
      );
    },

    // 更新水体参数
    updateWaterParams(params) {
      try {
        // 更新本地参数
        Object.assign(this.waterParams, params);

        // 创建转换后的参数对象，用于传递给waterLayer
        const convertedParams = { ...params };

        // 如果包含waterLevel参数，需要进行数值转换
        if (params.waterLevel !== undefined) {
          // 使用 WaterLayer 的静态方法进行转换
          // 将显示值（150-300）转换为 waterLevel 参数（0-2范围）
          const displayValue = params.waterLevel;
          // 使用 WaterLayer.convertHeightToWaterLevel 进行转换
          convertedParams.waterLevel = this.getWaterLevelValue(displayValue);
          console.log("转换后的参数：", convertedParams);

          console.log("🚀 ~ convertedParams:", convertedParams);
          // 调用waterLayer的更新方法，传递转换后的参数
          waterLayer.updateWaterParams(convertedParams);

          console.log("Water parameters updated:", convertedParams);
        }
      } catch (error) {
        console.error("Failed to update water parameters:", error);
        this.$message.error("更新水体参数失败");
      }
    },

    // 显示水体图层
    showWaterLayer() {
      try {
        // 创建转换后的参数对象
        const convertedParams = { ...this.waterParams };

        // 转换waterLevel显示值为实际值
        if (this.waterParams.waterLevel !== undefined) {
          const displayValue = this.waterParams.waterLevel;
          const actualValue = ((displayValue - 150) / (300 - 150)) * 0.15;
          convertedParams.waterLevel = Math.max(0, Math.min(0.15, actualValue));
        }

        waterLayer.show(convertedParams);
        this.$message.success("水体图层已显示");
      } catch (error) {
        console.error("Failed to show water layer:", error);
        this.$message.error("显示水体图层失败");
      }
    },

    // 隐藏水体图层
    hideWaterLayer() {
      try {
        waterLayer.hide();
        this.$message.success("水体图层已隐藏");
      } catch (error) {
        console.error("Failed to hide water layer:", error);
        this.$message.error("隐藏水体图层失败");
      }
    },

    // 重置水体参数
    resetWaterParams() {
      this.waterParams = {
        waterLevel: 198.4, // 显示值：150，对应实际值：0
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
        timeScale: 1.0,
      };

      // 更新GUI显示
      if (this.gui) {
        this.gui.updateDisplay();
      }

      // 更新水体参数
      this.updateWaterParams(this.waterParams);
      this.$message.success("参数已重置");
    },
    getData() {
      const res = { data: [] }; // await getWaterLoggingPointBaseInfo();
      this.rawData = res.data;
      this.data = res.data;
      //temp
      let tempData = constant.MODEL_3DTILES_INFO_LIST;
      tempData = tempData.map((item) => {
        item.rz = 0;
        item.jjsw = 0.15;
        return item;
      });
      this.data.push(...tempData);
      // getRiverList()
      //     .then(res => {
      //         // console.log(res.data)
      //         this.rawData = res.data
      //         this.data = res.data
      //     })
    },
    isOver(row) {
      if (row.jjsw === null && row.jjsw === undefined) {
        return false;
      }
      return row.rz >= row.jjsw;
    },
    handleSearch() {
      const { keyword } = this.query;
      this.data = this.rawData.filter((item) => {
        return item.name.includes(keyword);
      });
    },
    handleRowClick(row) {
      // const row = this.data[idx]
      this.$bus.emit("mapLocate", {
        type: "River",
        data: row,
      });
    },
    handleRowDblClick(row) {
      this.$bus.emit("openMapDialog", {
        type: "FloodStatistical",
        data: row,
      });
    },
    // 处理水位选择变化
    handleWaterLevelChange(value) {
      console.log("水位选择变化:", value, typeof value);

      // 判断事件来源：字符串来自下拉选择器，数字来自滑块
      const isFromDropdown = typeof value === "string";
      const isFromSlider = typeof value === "number";

      let actualWaterHeight = 0;
      let waterLabel = "";
      this.loadEffectLayer(value);

      if (isFromDropdown) {
        // 来自下拉选择器的变化
        this.query.value = value;

        // 将字符串值转换为数字
        actualWaterHeight = parseFloat(value);

        // 根据实际值设置标签
        switch (value) {
          case "198.4":
            waterLabel = "正常蓄水位";
            break;
          case "199.1":
            waterLabel = "199.1";
            break;
          case "199.6":
            waterLabel = "199.6";
            break;
          case "200.1":
            waterLabel = "200.1";
            break;
          case "200.6":
            waterLabel = "校核洪水位";
            break;
          default:
            waterLabel = `${value}米`;
        }

        // 同步更新滑动块的值
        this.waterLevelSlider = actualWaterHeight;
      } else if (isFromSlider) {
        // 来自滑块的变化
        actualWaterHeight = value;

        // 同步更新下拉选择器
        this.syncDropdownFromSlider(value);

        // 设置水位标签
        waterLabel = `${value}米`;
      }

      // 使用 convertHeightToWaterLevel 转换为 waterLevel 参数
      const minElevation = 172.7; // 最小高程
      const maxElevation = 1936.0; // 最大高程

      const convertedWaterLevel = waterLayer.constructor.convertHeightToWaterLevel(
        actualWaterHeight,
        minElevation,
        maxElevation
      );

      // 更新当前水位信息显示
      this.currentWaterInfo = {
        label: waterLabel,
        height: actualWaterHeight,
        convertedLevel: convertedWaterLevel.toFixed(4),
      };

      // 更新水体参数
      this.updateWaterParams({
        waterLevel: actualWaterHeight, // 保存实际高度用于显示
      });

      // 同时更新转换后的参数到水体渲染
      waterLayer.updateWaterParams({
        waterLevel: convertedWaterLevel,
      });

      console.log(
        `水位转换: ${actualWaterHeight}m -> waterLevel: ${convertedWaterLevel}`
      );
    },
    // 加载影响范围线图层
    async loadEffectLayer(waterLevel) {
      const selectWaterLevelInfo=EFFECT_WATER_LEVEL_COLOR_CONFIG_LSIT.find(item=>{
        return item.value === Number(waterLevel)&&!item.exclude
      })
      if (!selectWaterLevelInfo) {
        if (this.currentEffectLayer) {
          this.$bus.emit("removeMapLayer", {
            layerId: "effect-layer",
          });
        }
        return;
      }
      try {
        // 移除当前图层
        if (this.currentEffectLayer) {
          this.$bus.emit("removeMapLayer", {
            layerId: "effect-layer",
          });
        }

        // 加载新的GeoJSON数据
        const response = await fetch(
          `/datasets/effects/${Number(waterLevel) * 10}.geojson`
        );
        const geoJsonData = await response.json();
        console.log("🚀 ~ geoJsonData:", geoJsonData);

        // 添加到地图
        this.$bus.emit("addGeoJsonLayer", {
          layerId: "effect-layer",
          data: geoJsonData,
          style: {
            color: selectWaterLevelInfo.color,
            weight: 10,
            opacity: 0.8,
            fillColor: selectWaterLevelInfo.color,
            fillOpacity: 0.2,
          },
        });

        this.currentEffectLayer = waterLevel;
      } catch (error) {
        console.error("加载影响范围线数据失败:", error);
        this.$message.error("加载影响范围线数据失败");
      }
    },

    // 滑动块变化处理方法
    handleSliderChange(value) {
      console.log(`滑动块水位变化: ${value}m`);

      // 同步更新下拉选择器的值（如果滑动块值对应某个预设值）
      this.syncDropdownFromSlider(value);

      // 使用统一的updateWaterParams方法，它内部会处理转换和调用waterLayer
      this.updateWaterParams({
        waterLevel: value,
      });

      console.log(`滑动块水位更新: ${value}m`);
    },

    // 根据滑动块值同步下拉选择器
    syncDropdownFromSlider(sliderValue) {
      // 定义容差范围
      const tolerance = 0.05;

      // 检查滑动块值是否接近预设值
      if (Math.abs(sliderValue - 198.4) < tolerance) {
        this.query.value = "198.4";
      } else if (Math.abs(sliderValue - 199.1) < tolerance) {
        this.query.value = "199.1";
      } else if (Math.abs(sliderValue - 199.6) < tolerance) {
        this.query.value = "199.6";
      } else if (Math.abs(sliderValue - 200.1) < tolerance) {
        this.query.value = "200.1";
      } else if (Math.abs(sliderValue - 200.6) < tolerance) {
        this.query.value = "200.6";
      } else {
        // 对于任意值，直接显示数值（保留一位小数）
        this.query.value = sliderValue.toFixed(1);
      }
    },

    // 格式化滑动块提示信息
    formatTooltip(value) {
      return `${value}m`;
    },

    // 处理带宽变化
    handleBandWidthChange(value) {
      console.log("带宽设置变化:", value);
      this.bandWidth = value;
      // 这里可以添加带宽变化后的业务逻辑
      this.$message.success(`带宽已设置为 ${value}M`);
    },
  },
  created() {
    this.getData();
  },
  mounted() {
    // 默认加载正常蓄水位的影响范围线
    this.loadEffectLayer("198.4");

    // 初始化默认水位信息显示
    this.handleWaterLevelChange("198.4");

    this.$nextTick(() => {
      this.initDatGUI();
    });
  },
  beforeDestroy() {
    // 组件销毁时移除图层
    if (this.currentEffectLayer) {
      this.$bus.emit("removeMapLayer", {
        layerId: "effect-layer",
      });
    }
  },
};
</script>

<style scoped>
.tableContainer ::v-deep .el-table {
  background-color: transparent !important;
  background: transparent !important;
}

::v-deep .el-form-item__label {
  color: white;
}

.tableContainer ::v-deep .el-table__header-wrapper {
  background-color: transparent !important;
  background: transparent !important;
}

.tableContainer ::v-deep .el-table__body-wrapper {
  background-color: transparent !important;
  background: transparent !important;
}

.tableContainer ::v-deep .el-table th,
.tableContainer ::v-deep .el-table td {
  background-color: transparent !important;
  background: transparent !important;
  color: white !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
}

.tableContainer ::v-deep .el-table th.el-table__cell {
  background-color: transparent !important;
  background: transparent !important;
}

.tableContainer ::v-deep .el-table td.el-table__cell {
  background-color: transparent !important;
  background: transparent !important;
}

.tableContainer ::v-deep .el-table tr {
  background-color: transparent !important;
  background: transparent !important;
}

.tableContainer ::v-deep .el-table tbody tr {
  background-color: transparent !important;
  background: transparent !important;
}

.tableContainer ::v-deep .el-table thead tr {
  background-color: transparent !important;
  background: transparent !important;
}

.tableContainer ::v-deep .el-table tr:hover > td {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.tableContainer ::v-deep .el-table--enable-row-hover .el-table__body tr:hover > td {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.tableContainer ::v-deep .el-table__empty-block {
  background-color: transparent !important;
  background: transparent !important;
}

.tableContainer ::v-deep .el-table__empty-text {
  color: white !important;
}

/* 确保表格容器本身也是透明的 */
.tableContainer {
  background-color: transparent !important;
  background: transparent !important;
}

/* 覆盖所有可能的白色背景 */
.tableContainer ::v-deep * {
  background-color: transparent !important;
}

.tableContainer ::v-deep .el-table__header {
  background-color: transparent !important;
}

.tableContainer ::v-deep .el-table__body {
  background-color: transparent !important;
}

.slider_label {
  text-align: center;
  vertical-align: middle;
  float: left;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  line-height: 40px;
  width: 70px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}
::v-deep .el-form-item__label {
  text-align: center;
}
</style>
