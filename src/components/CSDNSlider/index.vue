<template>
  <div class="csdn-slider-container">
    <el-slider 
      v-model="sliderValue" 
      :step="step"
      :max="max" 
      :min="min"
      :marks="marks" 
      :show-input="showInput"
      :format-tooltip="formatTooltip" 
      @change="handleChange"
      class="csdn-slider"
    />
  </div>
</template>

<script>
export default {
  name: 'CSDNSlider',
  props: {
    value: {
      type: Number,
      default: 50
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 3050
    },
    step: {
      type: Number,
      default: 50
    },
    marks: {
      type: Object,
      default: () => ({
        500: '500M',
        1000: '1000M',
        1500: '1500M',
        2000: '2000M',
        2500: '2500M',
        3000: '3000M'
      })
    },
    showInput: {
      type: Boolean,
      default: true
    },
    customMin: {
      type: Number,
      default: 50
    },
    customMax: {
      type: Number,
      default: 3000
    },
    unit: {
      type: String,
      default: 'M'
    }
  },
  data() {
    return {
      sliderValue: this.value
    }
  },
  watch: {
    value(newVal) {
      this.sliderValue = newVal
    },
    sliderValue(newVal) {
      this.$emit('input', newVal)
    }
  },
  methods: {
    // 完全按照CSDN博客文章的实现
    formatTooltip(val) {
      // 限制最小值
      if (val < this.customMin) {
        this.sliderValue = this.customMin
        this.$emit('input', this.customMin)
      } 
      // 限制最大值  
      else if (val > this.customMax) {
        this.sliderValue = this.customMax
        this.$emit('input', this.customMax)
      }

      // 动态修改marks颜色 - 完全按照博客文章的代码
      const customClassValue = document.getElementsByClassName('el-slider__marks-text')
      for (let i = 0; i < customClassValue.length; i++) {
        let value = customClassValue[i].innerHTML
        value = value.substring(0, value.length - 1) // 去掉单位
        if (val >= value) {
          customClassValue[i].style.color = '#FFFFFF'
        } else {
          customClassValue[i].style.color = '#717171'
        }
      }
      
      return val + this.unit
    },
    
    handleChange(val) {
      this.$emit('change', val)
    }
  },
  
  mounted() {
    // 初始化时更新标记颜色
    this.formatTooltip(this.sliderValue)
  }
}
</script>

<style scoped>
.csdn-slider-container {
  width: 100%;
}

/* 完全按照CSDN博客文章的样式实现 */
.csdn-slider-container ::v-deep .el-slider {
  .el-slider__input {
    margin-top: 0;
  }
  
  .el-slider__runway {
    height: 32px;
    margin-top: 0;
    margin-bottom: 0 !important;
    background-color: #FFFFFF;
    border: 1px solid #DCDFE6;
    
    .el-slider__bar {
      height: 31px;
    }
    
    .el-slider__button-wrapper {
      top: 0;
      height: 32px;
      
      .el-slider__button {
        width: 4px;
        height: 31px;
        border-radius: 0;
        background: #FFFFFF;
        border: solid 2px #0068A5;
      }
    }
    
    .el-slider__stop {
      width: 1px;
      height: 31px;
      border-radius: 0;
      background-color: #DCDFE6;
    }
    
    .el-slider__marks-text {
      color: #717171;
      margin-top: 0;
      transform: translateX(-115%);
    }
  }
}

/* 深色主题适配 */
.csdn-slider-container ::v-deep .el-slider__runway {
  background-color: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

.csdn-slider-container ::v-deep .el-slider__bar {
  background-color: #409EFF !important;
}

.csdn-slider-container ::v-deep .el-slider__button {
  background: #FFFFFF !important;
  border: solid 2px #409EFF !important;
}

.csdn-slider-container ::v-deep .el-slider__stop {
  background-color: rgba(255, 255, 255, 0.3) !important;
}
</style>