<template>
    <el-radio-group
    :size="size"
    @change="handleChange">
        <el-radio
        v-for="option of options"
        :key="option.dictLabel"
        :label="option.dictValue">{{ option.dictLabel }}</el-radio>
    </el-radio-group>
</template>
<script>
export default {
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
                this.$getDicts(val)
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