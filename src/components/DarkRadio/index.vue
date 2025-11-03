<template>
    <div class="dark-radio-group" @click="handleTabClick">
        <button v-for="(item, idx) of items" :key="idx"
            :class="['dark-radio-button', isSelected(item.value) && 'active']" :data-index="idx">{{ item.label
            }}</button>
    </div>
</template>
<script>
export default {
    model: {
        prop: 'modelValue',
        event: 'update:modelValue'
    },
    emtis: ['update:modelValue', 'change'],
    props: {
        modelValue: {
            type: [String, Number],
            required: true
        },
        items: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            value: this.modelValue
        }
    },
    methods: {
        isSelected(itemValue) {
            return this.value == itemValue
        },
        handleTabClick(event) {
            console.log(event)
            if (event.target.tagName !== 'BUTTON') {
                return undefined
            }
            const val = this.items[event.target.dataset.index].value
            this.value = val
            this.$emit("update:modelValue", val)
            this.$emit("change", val)
        }
    },
    watch: {
        modelValue(val) {
            this.value = val
        }
    }

}
</script>
<style lang="scss" scoped>
.dark-radio-group {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    /* 防止超出换行 */
}

.dark-radio-button {
        background-color: #fff;
        color: #0b2b68;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        opacity: 0.8;
    }

    &.active {
  background-color: #2b88f0;
  color: #fff;
    }
}
</style>