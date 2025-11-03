<template>
<div :class="['circle-radio-group', direction === 'vertical'?'vertical' : 'horizontal']">
    <div v-for="(item) in options"
    :key="item.value"
    :class="['circle-radio-group__item', item.value === value && 'active']"
    @click="() => handleChange(item.value)"><span>{{ item.label }}</span></div>
</div>
</template>
<script>
export default {
    model: {
        prop: 'modelValue',
        event: 'update:modelValue'
    },
    emits: ['update:modelValue', "change"],
    props: {
        modelValue: {
            type: [String, Number],
            default: false
        },
        direction: {
            type: String,
            default: 'horizontal'
        },
        options: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            value: this.modelValue
        }
    },
    watch: {
        modelValue: {
            handler(newVal) {
                this.value = newVal
            },
            immediate: true
        }
    },
    methods: {
        handleChange(value) {
            this.value = value
            this.$emit('update:modelValue', value)
            this.$emit('handleTabChange', value)
        }
    },
}
</script>
<style lang="scss" scoped>
.circle-radio-group {
    display: flex;
}

.circle-radio-group.horizontal { 
    flex-direction: row;
    > .circle-radio-group__item + .circle-radio-group__item {
        margin-left: 10px;
    }
}
.circle-radio-group.vertical {
    flex-direction: column;
    > .circle-radio-group__item + .circle-radio-group__item {
        margin-top: 10px;
    }
}

.circle-radio-group__item {
    width: 75px;
    height: 40px;
    // background-color: #194191;
    // border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    user-select: none;
    color: #000;
    font-size: 14px;
    white-space: break-spaces;
    // word-break: break-all;
    // transform: scale(0.9);
    &.active {
        background-color: rgb(232, 243, 255);
        color: rgb(22,93,255);
         border-right: 4px solid rgb(22,93,255);
    }
    &:hover{
        background-color: rgb(232, 243, 255);
    }
}
</style>