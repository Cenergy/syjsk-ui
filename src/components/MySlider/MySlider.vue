<template>
  <div class="my-slider-container">
    <el-slider
      ref="sliderRef"
      class="custom-slider"
      v-model="currentValue"
      :min="min"
      :step="step"
      :max="max"
      size="small"
      :marks="marks"
      :show-tooltip="false"
      @input="handleInput"
    />
    <!-- 自定义永久显示的tooltip -->
    <div 
      ref="customTooltip"
      class="custom-tooltip"
      :style="tooltipStyle"
    >
      {{ tooltipText }}
    </div>
  </div>
</template>

<script>
export default {
  name: "MySlider",
  props: {
    // 滑块的值
    value: {
      type: Number,
      default: 25,
    },
    // 最小值
    min: {
      type: Number,
      default: 0,
    },
    // 最大值
    max: {
      type: Number,
      default: 50,
    },
    // 步长
    step: {
      type: Number,
      default: 0.1,
    },
    // 颜色分段配置
    colorSegments: {
      type: Array,
      default() {
        return [
          { start: 0, end: 16.7, color: "#67C23A", label: "低" }, // 绿色
          { start: 16.7, end: 33.3, color: "#E6A23C", label: "中" }, // 黄色
          { start: 33.3, end: 50, color: "#F56C6C", label: "高" }, // 红色
        ];
      },
    },
    marks: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      currentValue: this.value,
      tooltipPosition: 0, // tooltip位置百分比
    };
  },
  computed: {
    // 计算tooltip显示文本
    tooltipText() {
      const value = this.currentValue;
      // 检查是否有对应的mark
      if (this.marks && this.marks[value]) {
        const mark = this.marks[value];
        
        // 如果mark是一个对象（包含label属性）
        if (typeof mark === 'object' && mark !== null) {
          if (mark.label) {
            return `${this.extractTextFromVNode(mark.label)}: ${value}米`;
          }
          // 如果对象没有label属性，但有其他属性，显示对象信息
          else {
            return `${JSON.stringify(mark)}: ${value}米`;
          }
        }
        // 如果mark是字符串或数字
        else {
          return `${mark}: ${value}米`;
        }
      }
      return `水位:${value.toString()}米`;
    },
    // 计算tooltip样式
    tooltipStyle() {
      const percent = ((this.currentValue - this.min) / (this.max - this.min)) * 100;
      return {
        left: `${percent}%`,
        transform: 'translateX(-50%)'
      };
    }
  },
  watch: {
    value(newVal) {
      this.currentValue = newVal;
    },
    colorSegments: {
      handler() {
        this.$nextTick(() => {
          this.initColorSegments();
        });
      },
      deep: true,
    },
    marks: {
      handler() {
        this.$nextTick(() => {
          this.addMarkClickListeners();
        });
      },
      deep: true,
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.initColorSegments();
      this.updateTooltip();
      this.addMarkClickListeners();
    });
  },
  methods: {
    /** 处理输入事件 */
    handleInput(value) {
      this.$emit("input", value);
      this.$emit("change", value);
      // 更新Tooltip显示
      this.$nextTick(() => {
        this.updateTooltip();
      });
    },
    
    /** 更新tooltip位置和显示 */
    updateTooltip() {
      // tooltip位置通过计算属性自动更新，这里可以添加额外的逻辑
      // 例如确保tooltip不会超出容器边界等
      if (this.$refs.customTooltip) {
        // 可以在这里添加更多的tooltip定位逻辑
        console.log('Tooltip updated for value:', this.currentValue);
      }
    },

    /** 从VNode或其他类型的label中提取文本内容 */
    extractTextFromVNode(label) {
      // 如果label是字符串或数字，直接返回
      if (typeof label === 'string' || typeof label === 'number') {
        return String(label);
      }
      
      // 如果label是VNode对象
      if (typeof label === 'object' && label !== null) {
        // 检查是否有text属性
        if (label.text) {
          return label.text;
        }
        // 检查是否有children属性
        else if (label.children) {
          if (Array.isArray(label.children)) {
            return label.children.map(child => this.extractTextFromVNode(child)).join('');
          } else {
            return this.extractTextFromVNode(label.children);
          }
        }
        // 检查是否有componentOptions（Vue组件）
        else if (label.componentOptions && label.componentOptions.children) {
          return label.componentOptions.children.map(child => this.extractTextFromVNode(child)).join('');
        }
        // 如果是createElement创建的VNode，尝试获取其内容
        else if (label.tag) {
          return label.tag; // 返回标签名作为fallback
        }
      }
      
      // 其他情况，尝试转换为字符串
      return String(label);
    },
    /** 添加mark点击事件监听器 */
    addMarkClickListeners() {
      this.$nextTick(() => {
        try {
          const sliderEl = this.$refs.sliderRef.$el;
          const markTexts = sliderEl.querySelectorAll('.el-slider__marks-text');
          
          markTexts.forEach((markText, index) => {
            // 移除可能存在的旧事件监听器
            markText.removeEventListener('click', this.handleMarkClick);
            
            // 添加点击事件监听器
            markText.addEventListener('click', (event) => {
              this.handleMarkClick(event, markText);
            });
            
            // 添加样式，使mark可点击
            markText.style.cursor = 'pointer';
            markText.style.userSelect = 'none';
          });
        } catch (error) {
          console.error('添加mark点击事件监听器失败:', error);
        }
      });
    },

    /** 处理mark点击事件 */
    handleMarkClick(event, markElement) {
      event.stopPropagation();
      
      try {
        // 获取mark对应的值
        const markValue = this.getMarkValueFromElement(markElement);
        
        if (markValue !== null) {
          // 更新滑块值
          this.currentValue = markValue;
          
          // 触发事件
          this.$emit("input", markValue);
          this.$emit("change", markValue);
          
          // 更新tooltip
          this.$nextTick(() => {
            this.updateTooltip();
          });
        }
      } catch (error) {
        console.error('处理mark点击事件失败:', error);
      }
    },

    /** 从mark元素获取对应的数值 */
    getMarkValueFromElement(markElement) {
      try {
        // 获取mark元素的位置信息
        const sliderEl = this.$refs.sliderRef.$el;
        const runway = sliderEl.querySelector('.el-slider__runway');
        
        if (!runway || !markElement) return null;
        
        // 计算mark元素相对于滑块的位置
        const runwayRect = runway.getBoundingClientRect();
        const markRect = markElement.getBoundingClientRect();
        
        // 计算相对位置百分比
        const relativePosition = (markRect.left + markRect.width / 2 - runwayRect.left) / runwayRect.width;
        
        // 根据百分比计算对应的值
        const calculatedValue = this.min + (this.max - this.min) * relativePosition;
        
        // 查找最接近的mark值
        let closestMarkValue = null;
        let minDistance = Infinity;
        
        Object.keys(this.marks).forEach(key => {
          const markValue = parseFloat(key);
          const distance = Math.abs(markValue - calculatedValue);
          
          if (distance < minDistance) {
            minDistance = distance;
            closestMarkValue = markValue;
          }
        });
        
        return closestMarkValue;
      } catch (error) {
        console.error('获取mark值失败:', error);
        return null;
      }
    },

    /** 初始化颜色分段 */
    initColorSegments() {
      try {
        const sliderEl = this.$refs.sliderRef.$el;
        const runway = sliderEl.querySelector(".el-slider__runway");

        if (!runway) return;

        // 清除可能存在的旧元素
        const existingBars = runway.querySelectorAll(".color-segment");
        existingBars.forEach((bar) => bar.remove());
        // 创建颜色分段
        this.createColorSegments(runway);
      } catch (error) {
        console.error("初始化颜色分段失败:", error);
      }
    },

    /** 创建颜色分段 */
    createColorSegments(runway) {
      console.log("创建颜色分段:", this.colorSegments);
      console.log("滑块范围:", this.min, "-", this.max);

      this.colorSegments.forEach((segment, index) => {
        const segmentDiv = document.createElement("div");
        segmentDiv.className = `color-segment segment-${index}`;

        const startPercent = ((segment.start - this.min) / (this.max - this.min)) * 100;
        const widthPercent =
          ((segment.end - segment.start) / (this.max - this.min)) * 100;

        segmentDiv.style.cssText = `
          position: absolute;
          height: 100%;
          background-color: ${segment.color};
          left: ${startPercent}%;
          width: ${widthPercent}%;
          z-index: 1;
          border-radius: 3px;
          top: 0;
        `;

        runway.appendChild(segmentDiv);
      });

      // 确保颜色分段在滑块轨道内显示
      runway.style.overflow = "visible";
    },
  },
};
</script>

<style lang="scss" scoped>
.my-slider-container {
  position: relative;
}

::v-deep .el-slider__marks-text {
    width:22px;
    white-space: normal !important; // 允许换行
    word-wrap: break-word !important; // 单词换行
    word-break: break-all !important; // 强制换行
    max-width: 80px !important; // 限制最大宽度
    line-height: 1.2 !important; // 行高
    font-size: 10px !important; // 字体大小
}
::v-deep .el-slider__stop {
    background-color: transparent;
}

.el-slider {
  --el-slider-border-radius: 2px;
  --el-slider-height: 4px;
  --el-slider-button-size: 14px;
  
  // 修改mark标记的样式
  :deep(.el-slider__marks-text) {
    width:40px;
    white-space: normal !important; // 允许换行
    word-wrap: break-word !important; // 单词换行
    word-break: break-all !important; // 强制换行
    max-width: 80px !important; // 限制最大宽度
    line-height: 1.2 !important; // 行高
    font-size: 12px !important; // 字体大小
    
    // 限制最多显示3行，超过的用省略号
    display: -webkit-box !important;
    -webkit-line-clamp: 3 !important;
    -webkit-box-orient: vertical !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    
    // 调整位置，避免与滑块重叠
    transform: translateX(-50%) translateY(8px) !important;
  }
}

.custom-tooltip {
  position: absolute;
  top: -20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.8);
  }
}
</style>
