<template>
    <div style="flex: 1;  padding: 10px 0;">
                     <div class="panelTitle">
                            <div class="line">
                            </div>
                            <span>实时监测</span>
                        </div> 
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <DarkRadio v-model="activeName" :items="radioItems" />
            <el-checkbox v-model="isShowPano" label="数字孪生实景" border @change="handleChange"></el-checkbox>
        </div>
        <component :is="activeName"></component>
    </div>
</template>
<script>
import DarkRadio from "@/components/DarkRadio"

import Dynamic from "./Dynamic.vue";
import History from "./History.vue";

export default {
    props: {
        id: {
            type: [String, Number],
            default: ""
        }
    },
    components: {
        DarkRadio,
        Dynamic,
        History
    },
    data() {
        return {
            isShowPano: true,
            activeName: "Dynamic",
            radioItems: [
                { label: "动态", value: "Dynamic" },
                { label: "历史降雨-积水淹没", value: "History" },
                { label: "AI积水识别", value: "AI" }
            ],
        }
    },
    methods: {
        handleChange(val) {
            // this.isShowPano = val
            this.$bus.emit("changePano", val)
        }
    },
    created() {

    },
    beforeDestroy() {

    }
}
</script>
<style scoped>
.panelTitle {
    display: flex;
    align-items: center;
    padding: 5px 3px;
    margin: 10px 0;
    background: rgba(24, 144, 255, 0.2);
    font-size: 25px;
    font-weight: 600;

    .line {
        width: 3px;
        height: 22px;
        margin-right: 7px;
        border-radius: 10px;
        background: #1890ff;
    }
}
</style>