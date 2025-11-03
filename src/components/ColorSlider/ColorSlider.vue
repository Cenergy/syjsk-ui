<template>
  <div class="color-slider-container">
    <el-row>
      <el-form :model="sliderData" :label-width="labelWidth" :label-position="labelPosition">
        <el-col :span="colSpan" style="position: relative;">
          <el-form-item :label="label">
            <el-slider 
              @input="handleSliderChange" 
              :show-tooltip="showTooltip" 
              :marks="marks" 
              v-model="sliderData.val"
              :show-input="showInput"
              :show-input-controls="showInputControls"
              :show-stops="showStops"
              :show-marks="showMarks"
              :max="sliderData.total" 
              :min="sliderData.min"
              :step="step"
              :disabled="disabled"
              :vertical="vertical"
              :height="sliderHeight"
              :debounce="debounce"
              :tooltip-class="tooltipClass"
              :format-tooltip="formatTooltip"
              :range="range">
            </el-slider>
          </el-form-item>
          <el-button v-if="showMinMaxButtons" class="maxClass" :disabled="true">{{ sliderData.total }}</el-button>
          <el-button v-if="showMinMaxButtons" class="minClass" :disabled="true">{{ sliderData.min }}</el-button>
        </el-col>
      </el-form>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'ColorSlider',
  props: {
    // 基础属性
    label: {
      type: String,
      default: 'Value'
    },
    value: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 100
    },
    min: {
      type: Number,
      default: 0
    },
    allocatedValue: {
      type: Number,
      default: 0
    },
    
    // Element UI Slider 原生属性
    step: {
      type: Number,
      default: 1
    },
    showInput: {
      type: Boolean,
      default: true
    },
    showInputControls: {
      type: Boolean,
      default: true
    },
    showStops: {
      type: Boolean,
      default: false
    },
    showMarks: {
      type: Boolean,
      default: true
    },
    showTooltip: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    range: {
      type: Boolean,
      default: false
    },
    vertical: {
      type: Boolean,
      default: false
    },
    sliderHeight: {
      type: String,
      default: null
    },
    debounce: {
      type: Number,
      default: 300
    },
    tooltipClass: {
      type: String,
      default: ''
    },
    formatTooltip: {
      type: Function,
      default: null
    },
    
    // 布局属性
    labelWidth: {
      type: String,
      default: '80px'
    },
    labelPosition: {
      type: String,
      default: 'left'
    },
    colSpan: {
      type: Number,
      default: 22
    },
    showMinMaxButtons: {
      type: Boolean,
      default: true
    },
    
    // 颜色配置属性
    colorConfig: {
      type: Object,
      default: () => ({
        allocatedColor: 'rgb(94, 203, 115)', // 已分配颜色 - 绿色
        exceedColor: 'rgb(64, 148, 255)',    // 超出颜色 - 蓝色
        tooltipBgColor: 'rgb(64, 148, 255)', // tooltip背景色
        tooltipTextColor: 'white',           // tooltip文字颜色
        trackColor: '#E4E7ED',               // 轨道颜色
        buttonBorderColor: 'rgb(64, 148, 255)' // 滑块边框颜色
      })
    },
    
    // 多颜色段配置
    colorSegments: {
      type: Array,
      default: () => []
      // 格式: [{ start: 0, end: 30, color: '#67C23A' }, { start: 30, end: 70, color: '#E6A23C' }]
    },
    
    // 自定义样式
    customStyles: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      sliderData: {
        val: this.value,
        total: this.total,
        min: this.min
      },
      marks: {}
    }
  },
  mounted() {
    this.initSlider()
    // 确保初始渲染正确
    this.$nextTick(() => {
      setTimeout(() => {
        this.updateSliderStyle()
      }, 100)
    })
  },
  watch: {
    value(newVal) {
      this.sliderData.val = newVal
      this.updateSliderStyle()
    },
    total(newVal) {
      this.sliderData.total = newVal
      this.updateSliderStyle()
    },
    allocatedValue(newVal) {
      this.updateMarks()
      this.updateSliderStyle()
    },
    colorConfig: {
      handler() {
        this.updateSliderStyle()
      },
      deep: true
    },
    colorSegments: {
      handler() {
        this.updateSliderStyle()
      },
      deep: true
    }
  },
  methods: {
    initSlider() {
      this.updateMarks()
      this.$nextTick(() => {
        this.updateSliderStyle()
      })
    },
    updateMarks() {
      this.marks = {}
      if (this.allocatedValue > 0) {
        this.$set(this.marks, this.allocatedValue, '已分配' + this.allocatedValue)
      }
    },
    handleSliderChange(val) {
      this.sliderData.val = val
      this.$emit('input', val)
      this.$emit('change', val)
      // 移除延迟更新，避免滑动时颜色变化
      // 只在必要时更新tooltip显示
      this.$nextTick(() => {
        const { sliderButton } = this.getCurrentSliderElements()
        if (sliderButton) {
          sliderButton.setAttribute("data-attr", this.sliderData.val)
        }
      })
    },
    
    // 获取当前滑块元素（支持多实例）
    getCurrentSliderElements() {
      const sliderElements = this.$el.querySelectorAll('.el-slider__bar')
      const buttonElements = this.$el.querySelectorAll('.el-slider__button-wrapper')
      const runwayElements = this.$el.querySelectorAll('.el-slider__runway')
      
      return {
        sliderBar: sliderElements[0],
        sliderButton: buttonElements[0],
        sliderRunway: runwayElements[0]
      }
    },
    
    // 生成完整的多颜色段渐变（用于轨道背景）
    generateFullColorSegmentGradient() {
      if (!this.colorSegments || this.colorSegments.length === 0) {
        return this.colorConfig.allocatedColor
      }
      
      const totalRange = this.sliderData.total - this.sliderData.min
      let gradientStops = []
      
      // 生成完整的颜色段渐变
      this.colorSegments.forEach(segment => {
        const startPercent = ((segment.start - this.sliderData.min) / totalRange) * 100
        const endPercent = ((segment.end - this.sliderData.min) / totalRange) * 100
        
        gradientStops.push(`${segment.color} ${Math.max(0, startPercent)}%`)
        gradientStops.push(`${segment.color} ${Math.min(100, endPercent)}%`)
      })
      
      return gradientStops.length > 0 ? `linear-gradient(to right, ${gradientStops.join(', ')})` : this.colorConfig.allocatedColor
    },
    
    // 生成多颜色段渐变
    generateColorSegmentGradient(currentValue) {
      if (!this.colorSegments || this.colorSegments.length === 0) {
        return null
      }
      
      const totalRange = this.sliderData.total - this.sliderData.min
      const currentPercent = ((currentValue - this.sliderData.min) / totalRange) * 100
      
      let gradientStops = []
      
      // 按照滑块当前位置生成渐变
      this.colorSegments.forEach(segment => {
        const startPercent = ((segment.start - this.sliderData.min) / totalRange) * 100
        const endPercent = ((segment.end - this.sliderData.min) / totalRange) * 100
        
        // 只显示当前值范围内的颜色
        if (startPercent <= currentPercent) {
          const actualEndPercent = Math.min(currentPercent, endPercent)
          if (actualEndPercent > startPercent) {
            gradientStops.push(`${segment.color} ${Math.max(0, startPercent)}%`)
            gradientStops.push(`${segment.color} ${actualEndPercent}%`)
          }
        }
      })
      
      // 如果没有渐变停止点，使用第一个颜色段的颜色
      if (gradientStops.length === 0 && this.colorSegments.length > 0) {
        return this.colorSegments[0].color
      }
      
      return gradientStops.length > 0 ? `linear-gradient(to right, ${gradientStops.join(', ')})` : null
    },
    
    updateSliderStyle() {
      const that = this
      this.$nextTick(() => {
        const { sliderBar, sliderButton, sliderRunway } = this.getCurrentSliderElements()

        if (sliderButton) {
          // 设置tooltip永久显示
          sliderButton.setAttribute("data-attr", this.sliderData.val)
        }

        // 值为0的时候滑块位于最右端
        if (that.sliderData.total == 0 && sliderBar && sliderButton) {
          sliderBar.style.width = "100%"
          sliderButton.style.left = "100%"
        }

        // 首先设置轨道的完整背景色，确保右边有颜色
        if (sliderRunway) {
          if (this.colorSegments && this.colorSegments.length > 0) {
            // 多颜色段：显示完整的颜色段
            const fullGradient = this.generateFullColorSegmentGradient()
            sliderRunway.style.background = fullGradient
          } else if (this.allocatedValue > 0) {
            // 双色模式：显示完整的分配和超出颜色
            let allocatedPercent = (this.allocatedValue / this.sliderData.total) * 100 + "%"
            sliderRunway.style.background = `linear-gradient(to right, ${this.colorConfig.allocatedColor} 0%, ${this.colorConfig.allocatedColor} ${allocatedPercent}, ${this.colorConfig.exceedColor} ${allocatedPercent}, ${this.colorConfig.exceedColor} 100%)`
          } else {
            // 单色模式：使用分配颜色作为轨道背景
            sliderRunway.style.background = this.colorConfig.allocatedColor
          }
        }

        // 设置滑块条的颜色（当前值部分）
        if (sliderBar) {
          if (this.colorSegments && this.colorSegments.length > 0) {
            // 多颜色段：只显示当前值范围内的颜色
            const segmentGradient = this.generateColorSegmentGradient(this.sliderData.val)
            if (segmentGradient) {
              sliderBar.style.background = segmentGradient
            }
          } else {
            // 单色或双色：使用透明色，让轨道颜色透过
            sliderBar.style.background = 'transparent'
          }
        }
        
        // 应用自定义样式
        this.applyCustomStyles()
      })
    },
    
    // 应用自定义样式
    applyCustomStyles() {
      if (Object.keys(this.customStyles).length === 0) return
      
      const { sliderBar, sliderButton, sliderRunway } = this.getCurrentSliderElements()
      
      if (this.customStyles.sliderBar && sliderBar) {
        Object.assign(sliderBar.style, this.customStyles.sliderBar)
      }
      
      if (this.customStyles.sliderButton && sliderButton) {
        Object.assign(sliderButton.style, this.customStyles.sliderButton)
      }
      
      if (this.customStyles.sliderRunway && sliderRunway) {
        Object.assign(sliderRunway.style, this.customStyles.sliderRunway)
      }
    }
  }
}
</script>

<style scoped>
.color-slider-container {
  width: 100%;
}

.maxClass {
  position: absolute;
  right: -50px;
  top: 0;
  width: 40px;
  height: 32px;
  font-size: 12px;
  border: none;
  background: transparent;
  color: #606266;
}

.minClass {
  position: absolute;
  left: -50px;
  top: 0;
  width: 40px;
  height: 32px;
  font-size: 12px;
  border: none;
  background: transparent;
  color: #606266;
}

/* 滑块Tooltip永久显示 */
::v-deep .el-slider__button-wrapper::before {
  content: attr(data-attr);
  position: absolute;
  width: 20px;
  height: 25px;
  line-height: 25px;
  border-radius: 5px;
  text-align: center;
  top: -30px;
  left: -10px;
  background: v-bind('colorConfig.tooltipBgColor');
  color: v-bind('colorConfig.tooltipTextColor');
  font-size: 12px;
}

/* 滑块样式优化 */
::v-deep .el-slider__runway {
  height: 6px;
  background-color: v-bind('colorConfig.trackColor');
  border-radius: 3px;
}

::v-deep .el-slider__bar {
  height: 6px;
  background-color: v-bind('colorConfig.allocatedColor');
  border-radius: 3px;
}

::v-deep .el-slider__button {
  width: 16px;
  height: 16px;
  border: 2px solid v-bind('colorConfig.buttonBorderColor');
  background-color: #fff;
}

::v-deep .el-slider__button:hover {
  transform: scale(1.2);
}

::v-deep .el-slider__marks-text {
  font-size: 12px;
  color: #606266;
}
</style>