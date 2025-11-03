<template>
  <div class="color-segment-slider">
    <div class="slider-container">
      <!-- 左侧标签 -->
      <span v-if="showLabels" class="slider-label left-label">{{ formatLabel(min) }}</span>
      
      <!-- 滑动条容器 -->
      <div class="slider-wrapper" ref="sliderWrapper">
        <el-slider
          ref="sliderRef"
          v-model="currentValue"
          :min="min"
          :max="max"
          :step="step"
          :show-tooltip="showTooltip"
          :format-tooltip="formatTooltip"
          :marks="computedMarks"
          @change="handleChange"
          @input="handleInput"
          class="segment-slider"
        />
      </div>
      
      <!-- 右侧标签 -->
      <span v-if="showLabels" class="slider-label right-label">{{ formatLabel(max) }}</span>
    </div>
    
    <!-- 当前值显示 -->
    <div v-if="showCurrentValue" class="current-value">
      {{ currentValueLabel }}: {{ formatValue(currentValue) }}{{ unit }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'ColorSegmentSlider',
  props: {
    // 当前值
    value: {
      type: Number,
      default: 0
    },
    // 最小值
    min: {
      type: Number,
      default: 0
    },
    // 最大值
    max: {
      type: Number,
      default: 100
    },
    // 步长
    step: {
      type: Number,
      default: 1
    },
    // 是否显示tooltip
    showTooltip: {
      type: Boolean,
      default: true
    },
    // 是否显示左右标签
    showLabels: {
      type: Boolean,
      default: true
    },
    // 是否显示当前值
    showCurrentValue: {
      type: Boolean,
      default: true
    },
    // 当前值标签文本
    currentValueLabel: {
      type: String,
      default: '当前值'
    },
    // 单位
    unit: {
      type: String,
      default: ''
    },
    // 标记点配置
    marks: {
      type: Object,
      default: () => ({})
    },
    // 颜色段配置
    colorSegments: {
      type: Array,
      default: () => [
        { start: 0, end: 30, color: '#67C23A' },      // 绿色 - 安全
        { start: 30, end: 70, color: '#E6A23C' },     // 橙色 - 警告
        { start: 70, end: 100, color: '#F56C6C' }     // 红色 - 危险
      ]
    },
    // 自定义格式化函数
    formatter: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      currentValue: this.value,
      observer: null
    }
  },
  computed: {
    // 计算标记点
    computedMarks() {
      const marks = { ...this.marks };
      
      // 如果没有自定义marks，根据颜色段自动生成
      if (Object.keys(marks).length === 0 && this.colorSegments.length > 0) {
        this.colorSegments.forEach(segment => {
          const startValue = segment.start || segment.min || 0;
          const endValue = segment.end || segment.max || 100;
          
          if (startValue > this.min) {
            marks[startValue] = segment.label || `${startValue}${this.unit}`;
          }
        });
        // 添加最大值标记
        const lastSegment = this.colorSegments[this.colorSegments.length - 1];
        if (lastSegment) {
          const endValue = lastSegment.end || lastSegment.max || 100;
          if (endValue <= this.max) {
            marks[endValue] = lastSegment.endLabel || `${endValue}${this.unit}`;
          }
        }
      }
      
      return marks;
    }
  },
  watch: {
    value(newVal) {
      this.currentValue = newVal;
    },
    currentValue() {
      this.updateSliderColors();
    },
    colorSegments: {
      handler() {
        this.$nextTick(() => {
          this.updateSliderColors();
        });
      },
      deep: true
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initSliderColors();
      this.setupMutationObserver();
    });
  },
  beforeDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  },
  methods: {
    // 初始化滑动条颜色
    initSliderColors() {
      this.updateSliderColors();
    },
    
    // 更新滑动条颜色
    updateSliderColors() {
      if (!this.$refs.sliderRef || !this.colorSegments.length) return;
      
      const sliderEl = this.$refs.sliderRef.$el;
      const runway = sliderEl.querySelector('.el-slider__runway');
      const bar = sliderEl.querySelector('.el-slider__bar');
      
      if (!runway || !bar) return;
      
      // 清除现有的颜色段
      const existingSegments = runway.querySelectorAll('.color-segment');
      existingSegments.forEach(segment => segment.remove());
      
      // 设置runway为透明背景，让颜色段显示
      runway.style.background = 'transparent';
      runway.style.border = '1px solid #dcdfe6';
      runway.style.height = '12px'; // 确保高度一致
      
      // 创建颜色段
      this.colorSegments.forEach((segment, index) => {
        const segmentEl = document.createElement('div');
        segmentEl.className = 'color-segment';
        segmentEl.style.position = 'absolute';
        segmentEl.style.height = '100%';
        segmentEl.style.background = segment.color;
        segmentEl.style.borderRadius = '5px'; // 匹配更大的滑动条圆角
        segmentEl.style.pointerEvents = 'none'; // 防止干扰滑块交互
        segmentEl.style.top = '0';
        segmentEl.style.zIndex = '0'; // 确保在最底层
        
        // 计算位置和宽度 - 使用 start/end 属性
        const startValue = segment.start || segment.min || 0;
        const endValue = segment.end || segment.max || 100;
        
        const startPercent = ((startValue - this.min) / (this.max - this.min)) * 100;
        const endPercent = ((endValue - this.min) / (this.max - this.min)) * 100;
        
        segmentEl.style.left = `${Math.max(0, startPercent)}%`;
        segmentEl.style.width = `${Math.min(100, endPercent) - Math.max(0, startPercent)}%`;
        
        runway.appendChild(segmentEl);
      });
      
      // 确保滑块和进度条在最上层，但保持透明
      if (bar) {
        bar.style.zIndex = '1';
        bar.style.background = 'transparent';
        bar.style.height = '12px'; // 确保高度一致
      }
      
      const button = sliderEl.querySelector('.el-slider__button');
      if (button) {
        button.style.zIndex = '2';
        button.style.width = '24px'; // 确保滑块大小
        button.style.height = '24px';
      }
      
      // 调整滑块容器位置
      const buttonWrapper = sliderEl.querySelector('.el-slider__button-wrapper');
      if (buttonWrapper) {
        buttonWrapper.style.top = '-6px'; // 调整位置以适应新高度
      }
    },
    
    // 设置变化监听器
    setupMutationObserver() {
      if (!this.$refs.sliderRef) return;
      
      const sliderEl = this.$refs.sliderRef.$el;
      const bar = sliderEl.querySelector('.el-slider__bar');
      
      if (!bar) return;
      
      // 创建MutationObserver监听样式变化
      this.observer = new MutationObserver(() => {
        this.updateSliderColors();
      });
      
      // 监听bar的style属性变化
      this.observer.observe(bar, {
        attributes: true,
        attributeFilter: ['style']
      });
    },
    
    // 格式化标签
    formatLabel(value) {
      if (this.formatter) {
        return this.formatter(value);
      }
      return `${value}${this.unit}`;
    },
    
    // 格式化值
    formatValue(value) {
      if (this.formatter) {
        return this.formatter(value);
      }
      return value;
    },
    
    // 格式化tooltip
    formatTooltip(value) {
      return this.formatLabel(value);
    },
    
    // 处理值变化
    handleChange(value) {
      this.$emit('change', value);
    },
    
    // 处理输入
    handleInput(value) {
      this.$emit('input', value);
    }
  }
}
</script>

<style lang="scss" scoped>
.color-segment-slider {
  width: 100%;
  
  .slider-container {
    display: flex;
    align-items: center;
    width: 100%;
    
    .slider-label {
      font-size: 12px;
      color: #606266;
      white-space: nowrap;
      
      &.left-label {
        margin-right: 10px;
      }
      
      &.right-label {
        margin-left: 10px;
      }
    }
    
    .slider-wrapper {
      flex: 1;
      position: relative;
    }
  }
  
  .current-value {
    text-align: center;
    margin-top: 8px;
    font-size: 14px;
    color: #409EFF;
    font-weight: bold;
  }
}

// 深度选择器修改Element UI样式
::v-deep .segment-slider {
  .el-slider__runway {
    position: relative;
    background: transparent;
    border: 1px solid #dcdfe6;
    height: 12px !important; // 进一步增加滑动条高度
  }
  
  .el-slider__bar {
    background: transparent !important;
    height: 12px !important; // 确保进度条高度匹配
  }
  
  .el-slider__button {
    border: 2px solid #409EFF;
    background: #fff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
    width: 24px !important; // 进一步增加滑块大小
    height: 24px !important;
  }
  
  .el-slider__button-wrapper {
    top: -6px !important; // 调整滑块位置以适应新高度
  }
  
  .el-slider__marks-text {
    font-size: 12px;
    color: #909399;
  }
}

// 颜色段样式
::v-deep .color-segment {
  transition: all 0.3s ease;
}
</style>