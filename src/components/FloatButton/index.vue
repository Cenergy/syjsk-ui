<template>
<div class="float-btn"
    ref="floatBtnRef"
    draggable="true"
    @dragstart.prevent.stop
    @dragend.prevent.stop
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseUp">
    <slot class="float-btn__inner"></slot>
</div>
</template>
<script>
export default {
    data() {
        return {
            isDragging: false,
            xOffset: 0,
            yOffset: 0
        }
    },
    methods: {
        handleMouseDown(e) {
            const button = this.$refs.floatBtnRef;
            this.isDragging = true;
            button.style.cursor = 'grabbing';
            
            // 获取按钮的初始位置和鼠标的初始位置
            const rect = button.getBoundingClientRect();
            this.xOffset = e.clientX - rect.left;
            this.yOffset = e.clientY - rect.top;
        },
        handleMouseMove(e) {
            if (!this.isDragging) return;
            const button = this.$refs.floatBtnRef;
            
            // 计算新的位置
            let newX = e.clientX - this.xOffset;
            let newY = e.clientY - this.yOffset;
            
            // 限制按钮在视口内移动
            let maxX = window.innerWidth - button.offsetWidth;
            let maxY = window.innerHeight - button.offsetHeight;
            
            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));
            console.log(newX, newY)
            // 更新按钮位置
            button.style.left = `${newX}px`;
            button.style.top = `${newY}px`;
        },
        handleMouseUp(e) {
            const button = e.target;
            this.isDragging = false;
            button.style.cursor = 'pointer';
            this.xOffset = 0;
            this.yOffset = 0;
        }
    }
}
</script>
<style lang="scss" scoped>

.float-btn {
    position: fixed;
    top: calc(100% - 150px);
    left: calc(100% - 450px);
    width: 80px;
    height: 80px;
    z-index: 10;
    // cursor: move;
    cursor: pointer;

    .float-btn__inner {
        width: 100%;
    }

}
</style>