<template>
  <el-form label-width="75px" label-position="right" size="medium">
    <el-form-item label="典型水位" style="color: #fff !important">
      <div style="display: flex; align-items: center">
        <el-checkbox-group
          v-model="model"
          size="medium"
          @change="onGroupChange"
        >
          <el-checkbox-button
            v-for="waterLevel in effectWaterLevelList"
            :key="waterLevel.id"
            :label="waterLevel.label"
          >
            {{ waterLevel.name }}
          </el-checkbox-button>
        </el-checkbox-group>
      </div>
    </el-form-item>
    <el-form-item label="是否单选" style="color: #fff !important" v-if="showSingleCheck">
      <div style="display: flex; align-items: center">
        <el-checkbox v-model="singleCheckModel" label="1">
          <span style="color: #fff">是</span>
        </el-checkbox>
      </div>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: "WaterLevelSelector",
  props: {
    // v-model 绑定的选中水位列表
    value: {
      type: Array,
      default: () => [],
    },
    // 水位配置列表
    effectWaterLevelList: {
      type: Array,
      default: () => [],
    },
    // 是否单选，支持 .sync
    singleCheck: {
      type: Boolean,
      default: false,
    },
    showSingleCheck: {
      type: Boolean,
      default: true,
    },
    // 最少选中数量（默认至少选中 0 个）
    minSelected: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      _prevSelection: [],
    };
  },
  computed: {
    model: {
      get() {
        return this.value || [];
      },
      set(val) {
        this.$emit("input", val);
      },
    },
    singleCheckModel: {
      get() {
        return this.singleCheck;
      },
      set(val) {
        this.$emit("update:singleCheck", val);
      },
    },
  },
  methods: {
    onGroupChange(val) {
      let next = Array.isArray(val) ? [...val] : [];

      // 若单选开启，保留最后一次选择
      if (this.singleCheck && next.length > 1) {
        next = [next[next.length - 1]];
      }

      // 至少选中 minSelected 个（默认 1 个）
      if (this.minSelected > 0 && next.length < this.minSelected) {
        if (this._prevSelection && this._prevSelection.length >= this.minSelected) {
          next = this._prevSelection.slice(0, this.minSelected);
        } else if (this.effectWaterLevelList && this.effectWaterLevelList.length) {
          next = [this.effectWaterLevelList[0].label];
        }
      }

      this._prevSelection = [...next];
      // 同步 v-model 与 change 事件
      this.$emit("input", next);
      this.$emit("change", next);
    },
  },
  mounted() {
    // 初始值为空时，按 minSelected 自动填充一个默认项
    if ((this.value == null || this.value.length === 0) && this.minSelected > 0) {
      if (this.effectWaterLevelList && this.effectWaterLevelList.length) {
        const next = [this.effectWaterLevelList[0].label];
        this._prevSelection = [...next];
        this.$emit("input", next);
        this.$emit("change", next);
      }
    } else {
      this._prevSelection = [...(this.value || [])];
    }
  },
};
</script>

<style scoped>
</style>