<template>
  <div class="custom-slider">
    <!-- 标签显示 -->
    <div v-if="showLabel" class="slider-label">
      {{ label }}
    </div>
    
    <!-- 当前值显示 -->
    <div v-if="showCurrentValue" class="current-value">
      {{ currentValueLabel }}: {{ formatValue(currentValue) }}{{ unit }}
    </div>
    
    <!-- 滑块容器 -->
    <div class="slider-wrapper">
      <el-slider
        ref="sliderRef"
        v-model="currentValue"
        class="enhanced-slider"
        :min="min"
        :max="actualMax"
        :step="step"
        :show-tooltip="showTooltip"
        :show-input="showInput"
        :marks="computedMarks"
        :format-tooltip="formatTooltip"
        @change="handleChange"
        @input="handleInput"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomSlider',
  props: {
    // 基础属性
    value: {
      type: Number,
      default: 0
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 100
    },
    step: {
      type: Number,
      default: 1
    },
    
    // 显示控制
    showTooltip: {
      type: Boolean,
      default: true
    },
    showInput: {
      type: Boolean,
      default: false
    },
    showLabel: {
      type: Boolean,
      default: false
    },
    showCurrentValue: {
      type: Boolean,
      default: true
    },
    
    // 标签和单位
    label: {
      type: String,
      default: ''
    },
    currentValueLabel: {
      type: String,
      default: '当前值'
    },
    unit: {
      type: String,
      default: ''
    },
    
    // 标记点
    marks: {
      type: Object,
      default: () => ({})
    },
    
    // 自定义最大值限制
    customMax: {
      type: Number,
      default: null
    },
    
    // 颜色段配置
    colorSegments: {
      type: Array,
      default: () => []
    }
  },
  
  data() {
    return {
      currentValue: this.value,
      actualMax: this.customMax || this.max
    }
  },
  
  computed: {
    computedMarks() {
      return this.marks
    }
  },
  
  watch: {
    value(newVal) {
      this.currentValue = newVal
    },
    
    currentValue: {
      handler(newVal) {
        this.$emit('input', newVal)
        this.$nextTick(() => {
          this.updateMarksColor(newVal)
        })
      },
      immediate: true
    },
    
    customMax(newVal) {
      this.actualMax = newVal || this.max
    }
  },
  
  mounted() {
    this.$nextTick(() => {
      this.updateMarksColor(this.currentValue)
    })
  },
  
  methods: {
    // 格式化tooltip显示
    formatTooltip(val) {
      // 实现自定义min/max控制 - 参考CSDN文章的实现
      let adjustedVal = val
      
      if (val < this.min) {
        adjustedVal = this.min
        this.currentValue = this.min
        // 延迟更新以避免循环
        this.$nextTick(() => {
          this.$emit('input', this.min)
        })
      }
      
      if (this.customMax && val > this.customMax) {
        adjustedVal = this.customMax
        this.currentValue = this.customMax
        // 延迟更新以避免循环
        this.$nextTick(() => {
          this.$emit('input', this.customMax)
        })
      }
      
      // 更新marks颜色 - 使用调整后的值
      this.updateMarksColor(adjustedVal)
      
      return this.formatValue(adjustedVal) + this.unit
    },
    
    // 格式化数值显示
    formatValue(val) {
      if (typeof val !== 'number') return val
      return Number(val.toFixed(1))
    },
    
    // 更新marks颜色
    updateMarksColor(currentVal) {
      this.$nextTick(() => {
        const marksElements = document.getElementsByClassName('el-slider__marks-text')
        
        for (let i = 0; i < marksElements.length; i++) {
          const element = marksElements[i]
          let markValue = element.innerHTML
          
          // 提取数值（去除单位）
          if (markValue.includes(this.unit)) {
            markValue = markValue.replace(this.unit, '')
          }
          
          const numValue = parseFloat(markValue)
          
          if (!isNaN(numValue)) {
            if (currentVal >= numValue) {
              // 激活状态样式
              element.style.color = '#FFFFFF'
              element.style.fontWeight = 'bold'
              element.style.textShadow = '0 1px 3px rgba(0, 0, 0, 0.5)'
              element.style.background = 'rgba(64, 158, 255, 0.8)'
              element.style.padding = '2px 6px'
              element.style.borderRadius = '3px'
              element.style.transform = 'translateX(-50%) scale(1.1)'
            } else {
              // 未激活状态样式
              element.style.color = '#717171'
              element.style.fontWeight = 'normal'
              element.style.textShadow = 'none'
              element.style.background = 'transparent'
              element.style.padding = '0'
              element.style.borderRadius = '0'
              element.style.transform = 'translateX(-50%) scale(1)'
            }
            
            // 添加过渡动画
            element.style.transition = 'all 0.3s ease'
          }
        }
        
        // 更新颜色段背景
        this.updateColorSegments(currentVal)
      })
    },
    
    // 更新颜色段背景
    updateColorSegments(currentVal) {
      if (!this.colorSegments.length) return
      
      const sliderEl = this.$refs.sliderRef?.$el
      if (!sliderEl) return
      
      const runway = sliderEl.querySelector('.el-slider__runway')
      if (!runway) return
      
      // 清除现有颜色段
      const existingSegments = runway.querySelectorAll('.color-segment')
      existingSegments.forEach(segment => segment.remove())
      
      // 创建颜色段
      this.colorSegments.forEach(segment => {
        const segmentEl = document.createElement('div')
        segmentEl.className = 'color-segment'
        segmentEl.style.position = 'absolute'
        segmentEl.style.height = '100%'
        segmentEl.style.top = '0'
        segmentEl.style.borderRadius = '15px'
        segmentEl.style.pointerEvents = 'none'
        segmentEl.style.zIndex = '0'
        segmentEl.style.transition = 'opacity 0.3s ease'
        
        const startValue = segment.start || segment.min || 0
        const endValue = segment.end || segment.max || 100
        
        // 计算位置
        const startPercent = ((startValue - this.min) / (this.actualMax - this.min)) * 100
        const endPercent = ((endValue - this.min) / (this.actualMax - this.min)) * 100
        
        segmentEl.style.left = `${Math.max(0, startPercent)}%`
        segmentEl.style.width = `${Math.min(100, endPercent) - Math.max(0, startPercent)}%`
        
        // 根据当前值调整透明度
        if (currentVal >= startValue && currentVal <= endValue) {
          segmentEl.style.background = segment.color
          segmentEl.style.opacity = '0.8'
        } else if (currentVal > endValue) {
          segmentEl.style.background = segment.color
          segmentEl.style.opacity = '0.4'
        } else {
          segmentEl.style.background = segment.color
          segmentEl.style.opacity = '0.2'
        }
        
        runway.appendChild(segmentEl)
      })
    },
    
    // 处理值变化
    handleChange(val) {
      this.$emit('change', val)
    },
    
    // 处理输入
    handleInput(val) {
      this.updateMarksColor(val)
      this.$emit('input', val)
    }
  }
}
</script>

<style lang="scss" scoped>
.custom-slider {
  width: 100%;
  
  .slider-label {
    margin-bottom: 8px;
    font-size: 14px;
    color: #606266;
    font-weight: 500;
  }
  
  .current-value {
    margin-bottom: 12px;
    font-size: 16px;
    color: #409EFF;
    font-weight: bold;
    text-align: center;
    padding: 8px;
    background: rgba(64, 158, 255, 0.1);
    border-radius: 4px;
    border: 1px solid rgba(64, 158, 255, 0.2);
  }
  
  .slider-wrapper {
    padding: 0 12px;
  }
}

// 深度选择器修改Element UI样式
::v-deep .enhanced-slider {
  .el-slider__input {
    margin-top: 0;
  }
  
  .el-slider__runway {
    height: 32px;
    margin-top: 0;
    margin-bottom: 0 !important;
    background-color: #FFFFFF;
    border: 1px solid #DCDFE6;
    border-radius: 16px;
  }
  
  .el-slider__bar {
    height: 31px;
    background: linear-gradient(90deg, #409EFF 0%, #67C23A 100%);
    border-radius: 15px;
  }
  
  .el-slider__button-wrapper {
    top: 0;
    height: 32px;
    
    .el-slider__button {
      width: 6px;
      height: 31px;
      border-radius: 3px;
      background: #FFFFFF;
      border: solid 2px #409EFF;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
    }
  }
  
  .el-slider__stop {
    width: 2px;
    height: 31px;
    border-radius: 1px;
    background-color: #DCDFE6;
  }
  
  .el-slider__marks-text {
    color: #717171;
    margin-top: 8px;
    transform: translateX(-50%);
    font-size: 12px;
    white-space: nowrap;
    transition: all 0.3s ease;
    
    &:hover {
      color: #409EFF;
    }
  }
}
</style>