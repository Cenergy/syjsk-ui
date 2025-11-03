<template>
    <div style="width: 100%; height: 100%;">
        <div id="smallMap"></div>
    </div>
</template>
<script>
import { smallMap as mapBus } from "@/map";

export default {
    components: {
    },
    props: {
        mapBus: {
            type: Object,
            default() {
                return mapBus;
            }
        }
    },
    mounted() {
        // 地图初始化
        this.mapBus.startup && this.mapBus.startup();
    },
    destroyed() {
        // 地图销毁
        this.mapBus.destroy && this.mapBus.destroy();
    },
    activited(){
    console.log("🚀 ~ activited ~ activited:", );
    },
    methods: {
    }

};
</script>
<style lang="scss" scoped>
#smallMap {
    /* position: absolute !important;
    top: 0;
    left: 0; */
    width: 100%;
    height: 100%;
    min-height: 300px;
    z-index: 0;
    /* z-index: 1; */
}
</style>
  