<template>
<div v-if="isShow" class="fullscreen-iframe__wrapper">
    <button class="fullscreen-iframe__close" @click="handleClose">
        <i class="el-icon-close"></i>
    </button>
    <iframe :src="src" frameborder="0" class="fullscreen-iframe__inner"></iframe>
</div>
</template>
<script>
export default {
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        src: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            isShow: this.visible
        }
    },
    methods: {
        handleClose() {
            this.isShow = false
            this.$emit('update:visible', false)
        }
    },
    watch: {
        visible(val) {
            this.isShow = val
        }
    },
    mounted() {
        document.body.append(this.$el)
    },
}
</script>
<style scoped>
.fullscreen-iframe__wrapper {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    width: 100%;
    height: 100%;
}

.fullscreen-iframe__close {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 24px;
    color: #000;
    background: none;
    outline: none;
    border: none;
    cursor: pointer;
    user-select: none;
}

.fullscreen-iframe__inner {
    display: block;
    width: 100%;
    height: 100%;
}
</style>