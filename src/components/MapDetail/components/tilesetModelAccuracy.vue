<template>
  <div>
   

  
  </div>
</template>

<script>

import { constant } from "@/map";
import { translate } from "@/map/cesium/helps/modelHandle";

const tiles = constant.MODEL_3DTILES_INFO_LIST;

export default {
  data() {
    return {
      // 原有数据
      query: {
        hdnm: "",
        keyword: "",
      },
      data: [],
      rawData: [],
      
      // 新增的模型偏移相关数据
      modelList: tiles, // 3D Tiles模型列表
      selectedModel: null, // 当前选中的模型名称
      selectedModelInfo: null, // 当前选中模型的详细信息
      offsetValues: {
        x: 0,
        y: 0,
        z: 0
      },
      originalModelMatrix: null, // 保存原始模型矩阵
      currentTileset: null // 当前操作的tileset对象
    };
  },
  methods: {

  },
  created() {
    this.getData();
  },
  mounted() {
    // 监听来自地图组件的tileset对
  },
  beforeDestroy() {
    // 清理事件监听
    this.$bus.off("tilesetReady");
    this.$bus.off("tilesetResponse");
  }
};
</script>

<style scoped>
.model-info {
  background: rgba(0, 0, 0, 0.3);
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #333;
}

.model-info p {
  margin: 5px 0;
  color: #fff;
  font-size: 12px;
}

.model-info strong {
  color: #409eff;
}

/* 确保输入框在暗色主题下可见 */
.dark .el-input-number {
  background: rgba(0, 0, 0, 0.3);
}

.dark .el-input-number .el-input__inner {
  background: rgba(0, 0, 0, 0.5);
  border-color: #333;
  color: #fff;
}

.dark .el-select .el-input__inner {
  background: rgba(0, 0, 0, 0.5);
  border-color: #333;
  color: #fff;
}
</style>
