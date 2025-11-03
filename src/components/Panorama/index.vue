<template>
    <div class="container">
        <div ref="containerRef">
        </div>
        <!-- <div class="metaData">
            <span>地点：{{ "莲塘龙大高速桥底" }}</span>
          
            <span>当前水深：{{ "0cm" }}</span>
            <span>未来一小时水深：{{ "0cm" }}</span>
            <span>未来三小时水深：{{ "0cm" }}</span>
            
        </div> -->
        <!-- <div class="time">
            <span>采集时间：{{ "2025-06-19" }}</span>
        </div> -->
    </div>

</template>
<script>
import { nanoid } from "@/utils/nanoid"

export default {
    data() {
        return {

        }
    },
    props: {
        type: {
            type: String,
            default: "equirectangular"
        },
        src: {
            type: String,
            default: ""
        },
        autoLoad: {
            type: Boolean,
            default: true
        },
        scenes: {
            type: Object,
            default() {
                return {}
            }
        }
    },
    data() {
        return {
            viewer: null
        }
    },
    methods: {
        reinit() {
           this.viewer.setUpdate()
        },
        init() {
            if (this.viewer) {
                this.viewer.destroy()
                this.viewer = null
            }
            if (this.src) {
                this.viewer = pannellum.viewer(this.$refs.containerRef, {
                    type: this.type,
                    panorama: this.src,
                    autoLoad: this.autoLoad,
                    minPitch: -80
                });
            } else {
                this.viewer = pannellum.viewer(this.$refs.containerRef, {
                    autoLoad: this.autoLoad,
                    minPitch: -80,
                    sceneFadeDuration: 1000,
                    compass: false,
                    // hotSpotDebug: true,
                    default: {
                        firstScene: "poi1"
                    },
                    scenes: this.scenes
                });
            }
        }
    },
    watch: {
        src(val) {
            if (val) {
                this.init()
            }
        },
        // scenes: {
        //     handler(val) {
        //         console.trace()
        //         this.init()
        //     },
        //     deep: true
        // }
    },
    mounted() {
        if (window.viewerPool === undefined) {
            window.viewerPool = new Map()
        }
        this.init()
    },
    beforeDestroy() { 
        this.viewer.destroy()
    }
}
</script>
<style scoped>
.container {
    .metaData {
        position: relative;
        bottom: 60vh;
        font-size: 18px;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        left: 10vw;
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
        -ms-flex-direction: column;
        flex-direction: column;
        width: 280px;
        background: rgb(243 187 78 / 80%);
        padding: 5px 19px;
        color: #000;
        font-weight: 600;
        border-radius: 5px;
    }
    .time{
          position: relative;
          bottom: 0;
    }
}
</style>