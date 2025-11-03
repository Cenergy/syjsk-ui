<template>
<div class="check-box-group">
    <el-checkbox
    v-if="selectAll"
    :value="isSelectdAll"
    :indeterminate="isIndeterminate"
    class="dark controller"
    @change="handleSelectAll">{{ title }}</el-checkbox>
    <span v-else>{{ title }}</span>
    <el-checkbox-group
    v-model="value"
    @change="handleChange">
        <el-checkbox
        v-for="(item, idx) of items"
        ref="checkboxs"
        :key="idx"
        :label="item.value"
        class="dark"
        @change="val => handleSelect(val, idx)">{{ item.label }}</el-checkbox>
    </el-checkbox-group>
</div>
</template>
<script>
export default {
    emits: ["select", "update:modelValue"],
    props: {
        modelValue: {
            type: Array,
            default:() => []
        },
        title: {
            type: String,
            default: ''
        },
        selectAll: {
            type: Boolean,
            default: true
        },
        items: {
            type: Array,
            default:() => []
        }
    },
    data() {
        return {
            value: [],
            itemsValue: []
        }
    },
    methods: {
        handleSelectAll(isSelected) {
            if(isSelected) {
                this.value = this.itemsValue
            } else {
                this.value = []
            }
            const checkboxs = this.$refs.checkboxs
            checkboxs.forEach((item, idx)=>{
                if(item.isChecked != isSelected) {
                    this.handleSelect(isSelected, idx)
                }
            })
        },
        handleChange() {
            // todo
            // console.log(event)
            this.$emit("update:modelValue", this.value)
        },
        handleSelect(isChecked, idx) {
            const item = this.items[idx]
            this.$emit("select", isChecked, item)
        },
        onChangeItems() {
            this.itemsValue = []
            // console.log(items)
            this.items.forEach((item, idx)=>{
                this.itemsValue.push(item.value)
                if(item.check) {
                    this.value.push(item.value)
                    this.handleSelect(true, idx)
                }
            })
        }
    },
    computed: {
        isSelectdAll() {
            return this.value.length === this.items.length
        },
        isIndeterminate() {
            return this.value.length != this.items.length
            && this.value.length > 0
        }
    },
    watch: {
        items() {
            this.onChangeItems()
        }
    },
    mounted() {
        this.onChangeItems()
    }
}
</script>
<style lang="scss" scoped>
.check-box-group {
  padding-top: 7px;
  margin-top: 10px;
  box-shadow: 0px 0px 26px 0px rgba(255, 255, 255, 0.25) inset;
  background: linear-gradient(0deg, rgba(56, 206, 255, 0.25) 0%, rgba(56, 206, 255, 0) 7.77%);
  
}

.controller {
    border-left: 2px solid #8cc6ff;
    padding-left: 7px;
    ::v-deep .el-checkbox__label {
        color: yellow!important;
    }
}

.el-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
  padding: 0px 0px 7px 7px;
  border-left: 1px solid #8CC6FF;
  border-bottom: 1px solid #8CC6FF;
}
::v-deep .el-checkbox {
    margin-right: 15px;
}

</style>