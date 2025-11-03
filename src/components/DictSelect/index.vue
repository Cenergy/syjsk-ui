<template>
<el-select
v-model="value"
:size="size"
class="dark"
popper-class="dark"
@change="handleChange">
    <el-option
    v-for="option of options"
    popper-class="dark"
    :key="option.dictLabel"
    :value="option.dictValue"
    :label="option.dictLabel" />
</el-select>
</template>
<script>
export default {
    model: {
        prop: 'modelValue',
        event: 'update:modelValue'
    },
    emits: ["update:modelValue", "change"],
    props: {
        modelValue: {
            type: String,
            required: true
        },
        dictName: {
            type: String,
            required: true
        },
        size: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            value: null,
            options: []
        }
    },
    watch: {
        modelValue: {
            handler(val, _) {
                this.value = val
            },
            immediate: true
        },
        dictName: {
            handler(val, _) {
                this.getDicts(val, true)
                .then(res=>{
                    this.options = res.data
                })
            },
            immediate: true
        }
    },
    methods: {
        handleChange(val) {
            this.$emit("update:modelValue", this.value)
            this.$emit("change", val)
        }
    }
}
</script>
<style scoped>

</style>