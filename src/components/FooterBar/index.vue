<template>
    <div class="footer-bar">
        <div class="list">
            <div
                v-for="(item, idx) of tabList"
                :key=idx
                :class="['list-item', idx == activeIndex && 'active']"
                @click="handleSwitch(idx)"
            >
                <el-badge v-if="item.code==='gzwr'" :value="noticeNum" class="item" :hidden="noticeNum==0?true:false">
                    <img
                        :src="(item.noSelected || idx != activeIndex) ? item.icon : item.activeIcon"
                        alt=""
                        @click="handleNoticeNum"
                    >
                </el-badge>
                <img v-else
                    :src="(item.noSelected || idx != activeIndex) ? item.icon : item.activeIcon"
                    alt=""
                >
                <span>{{ item.text }}</span>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    model: {
        prop: 'modelValue',
        event: 'update:modelValue'
    },
    emits: ["update:modelValue", "click"],
    props: {
        tabList: {
            type: Array,
            default() {
                return []
            }
        },
        modelValue: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            activeIndex: 0,
            noticeNum: 0
        }
    },
    methods: {
        handleSwitch(idx) {
            const item = this.tabList[idx]
            if(!item.noSelected) {
                if(this.activeIndex == idx) {
                    this.activeIndex = -1
                } else {
                    this.activeIndex = idx
                }
                this.$emit("update:modelValue", this.activeIndex)
            }
            this.$emit("click", idx)
        },
        handleNoticeNum() {
            this.noticeNum = 0
        }
    },
    watch: {
        modelValue: {
            handler(val) {
                this.activeIndex = val
            },
            immediate: true
        }
    },
    mounted() {
        this.noticeNum = []
    }
}
</script>
<style lang="scss" scoped>

.footer-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: center;
    width: 100%;
    height: 50px;
    background: url(../../assets/images/footer.png) center/100% 100%;
    .list {
        position: absolute;
        bottom: 0px;
        left: 50%;
        width: 40%;
        display: flex;
        justify-content: center;
        transform: translateX(-50%);
        > div {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            margin: 0 5px;
            cursor: pointer;
            > img {
                width: 75px;
            }
        }
    }
}
</style>