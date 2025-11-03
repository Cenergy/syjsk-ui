# ColorSlider 多颜色滑块组件

一个支持多颜色显示和丰富属性传递的Vue滑块组件，基于Element UI的Slider组件进行增强。

## 功能特性

- ✅ **多颜色段配置**：支持配置多个颜色段，实现渐变效果
- ✅ **颜色配置**：可自定义已分配、超出、tooltip等各部分颜色
- ✅ **属性传递**：支持Element UI Slider的所有原生属性
- ✅ **永久tooltip**：滑块上方始终显示当前值
- ✅ **自定义样式**：支持传入自定义样式对象
- ✅ **多实例支持**：解决多个滑块实例冲突问题

## 基础用法

```vue
<template>
  <ColorSlider
    label="CPU使用率"
    v-model="value"
    :total="100"
    :min="0"
    :allocated-value="60"
  />
</template>

<script>
import ColorSlider from '@/components/ColorSlider'

export default {
  components: {
    ColorSlider
  },
  data() {
    return {
      value: 45
    }
  }
}
</script>
```

## 多颜色段配置

```vue
<template>
  <ColorSlider
    label="系统负载"
    v-model="value"
    :total="100"
    :color-segments="colorSegments"
  />
</template>

<script>
export default {
  data() {
    return {
      value: 65,
      colorSegments: [
        { start: 0, end: 30, color: '#67C23A' },   // 绿色：正常
        { start: 30, end: 70, color: '#E6A23C' },  // 橙色：警告
        { start: 70, end: 100, color: '#F56C6C' }  // 红色：危险
      ]
    }
  }
}
</script>
```

## 颜色配置

```vue
<template>
  <ColorSlider
    label="内存使用率"
    v-model="value"
    :color-config="colorConfig"
  />
</template>

<script>
export default {
  data() {
    return {
      value: 75,
      colorConfig: {
        allocatedColor: '#409EFF',      // 已分配颜色
        exceedColor: '#E6A23C',         // 超出颜色
        tooltipBgColor: '#67C23A',      // tooltip背景色
        tooltipTextColor: 'white',      // tooltip文字颜色
        trackColor: '#E4E7ED',          // 轨道颜色
        buttonBorderColor: '#409EFF'    // 滑块边框颜色
      }
    }
  }
}
</script>
```

## 属性说明

### 基础属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| label | String | 'Value' | 滑块标签 |
| value / v-model | Number | 0 | 当前值 |
| total | Number | 100 | 最大值 |
| min | Number | 0 | 最小值 |
| allocatedValue | Number | 0 | 已分配值（用于双色模式） |

### Element UI Slider 原生属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| step | Number | 1 | 步长 |
| showInput | Boolean | true | 是否显示输入框 |
| showInputControls | Boolean | true | 是否显示输入框控制按钮 |
| showStops | Boolean | false | 是否显示间断点 |
| showMarks | Boolean | true | 是否显示标记 |
| showTooltip | Boolean | false | 是否显示tooltip |
| disabled | Boolean | false | 是否禁用 |
| range | Boolean | false | 是否为范围选择 |
| vertical | Boolean | false | 是否垂直模式 |
| sliderHeight | String | null | 滑块高度 |
| debounce | Number | 300 | 输入时的去抖延迟 |
| tooltipClass | String | '' | tooltip的类名 |
| formatTooltip | Function | null | 格式化tooltip |

### 布局属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| labelWidth | String | '80px' | 标签宽度 |
| labelPosition | String | 'left' | 标签位置 |
| colSpan | Number | 22 | 栅格占据的列数 |
| showMinMaxButtons | Boolean | true | 是否显示最小最大按钮 |

### 颜色配置属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| colorConfig | Object | 见下方 | 颜色配置对象 |
| colorSegments | Array | [] | 多颜色段配置数组 |
| customStyles | Object | {} | 自定义样式对象 |

#### colorConfig 默认值

```javascript
{
  allocatedColor: 'rgb(94, 203, 115)',    // 已分配颜色 - 绿色
  exceedColor: 'rgb(64, 148, 255)',       // 超出颜色 - 蓝色
  tooltipBgColor: 'rgb(64, 148, 255)',    // tooltip背景色
  tooltipTextColor: 'white',              // tooltip文字颜色
  trackColor: '#E4E7ED',                  // 轨道颜色
  buttonBorderColor: 'rgb(64, 148, 255)'  // 滑块边框颜色
}
```

#### colorSegments 格式

```javascript
[
  { start: 0, end: 30, color: '#67C23A' },
  { start: 30, end: 70, color: '#E6A23C' },
  { start: 70, end: 100, color: '#F56C6C' }
]
```

#### customStyles 格式

```javascript
{
  sliderBar: {
    // 滑块条样式
    borderRadius: '10px',
    height: '8px'
  },
  sliderButton: {
    // 滑块按钮样式
    width: '20px',
    height: '20px'
  },
  sliderRunway: {
    // 滑块轨道样式
    backgroundColor: '#f0f0f0'
  }
}
```

## 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| input | 值改变时触发 | (value: number) |
| change | 值改变时触发 | (value: number) |

## 使用示例

### 完整功能示例

```vue
<template>
  <div>
    <!-- 多颜色段滑块 -->
    <ColorSlider
      label="CPU使用率"
      v-model="cpuValue"
      :total="100"
      :min="0"
      :allocated-value="60"
      :color-segments="[
        { start: 0, end: 30, color: '#67C23A' },
        { start: 30, end: 70, color: '#E6A23C' },
        { start: 70, end: 100, color: '#F56C6C' }
      ]"
      :show-input="true"
      :show-stops="true"
      :step="5"
      @change="handleCpuChange"
    />

    <!-- 自定义颜色配置滑块 -->
    <ColorSlider
      label="内存使用率"
      v-model="memoryValue"
      :total="100"
      :color-config="{
        allocatedColor: '#409EFF',
        exceedColor: '#E6A23C',
        tooltipBgColor: '#67C23A',
        tooltipTextColor: 'white'
      }"
      :show-input="false"
      :custom-styles="{
        sliderBar: { height: '10px', borderRadius: '5px' },
        sliderButton: { width: '24px', height: '24px' }
      }"
      @change="handleMemoryChange"
    />
  </div>
</template>

<script>
import ColorSlider from '@/components/ColorSlider'

export default {
  components: {
    ColorSlider
  },
  data() {
    return {
      cpuValue: 45,
      memoryValue: 75
    }
  },
  methods: {
    handleCpuChange(value) {
      console.log('CPU使用率变化:', value)
    },
    handleMemoryChange(value) {
      console.log('内存使用率变化:', value)
    }
  }
}
</script>
```

## 注意事项

1. **多颜色段优先级**：当同时配置 `colorSegments` 和 `colorConfig` 时，`colorSegments` 优先生效
2. **多实例支持**：组件已优化，支持在同一页面使用多个实例而不会相互干扰
3. **性能优化**：颜色变化使用了 `$nextTick` 确保DOM更新后再应用样式
4. **兼容性**：基于Element UI，需要确保项目中已安装Element UI

## 更新日志

### v2.0.0
- ✅ 新增多颜色段配置支持
- ✅ 新增颜色配置对象
- ✅ 新增自定义样式支持
- ✅ 新增Element UI Slider所有原生属性支持
- ✅ 优化多实例支持
- ✅ 重构样式应用逻辑

### v1.0.0
- ✅ 基础滑块功能
- ✅ 永久tooltip显示
- ✅ 双色模式支持