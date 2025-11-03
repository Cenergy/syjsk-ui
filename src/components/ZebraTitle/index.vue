<template>
    <div :class="['zebra-title', border && 'bordered']">
        <!-- <div class="zebra-wrapper">
            <div class="arrow"></div>
            <div class="arrow"></div>
            <div class="arrow"></div>
            <div class="arrow"></div>
            <div class="arrow-right"></div>
            <div class="arrow-right"></div>
            <div class="arrow-right"></div>
            <div class="arrow-right"></div>
        </div> -->
        <slot>{{ text }}</slot>
        <slot name="extra"></slot>
    </div>
</template>
<script>
export default {
    props: {
        text: {
            type: String,
            default: ''
        },
        border: {
            type: Boolean,
            default: true
        }
    }
}
</script>
<style lang="scss" scoped>
.zebra-title {
    background: linear-gradient(180deg, rgba(190, 243, 255, 0) 0%, rgba(202, 222, 255, 0.175) 81.25%, rgba(53, 101, 222, 0.15) 100%);

    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    // color: white;
    color: #000;
    padding: 5px;
    overflow: hidden;
    position: relative;
    backdrop-filter: blur(10px);
     box-shadow: 0px 0px 6px 0px rgba(85, 224, 255, 0.4) inset;

    // &.bordered {
    //     border: 1px dashed #5499B0;
    // }
}

.zebra-wrapper {
    position: absolute;
    top: 0;
    left: 0px;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
}

.arrow,
.arrow-right {}

.arrow {
    transform: translateY(-30%);
    width: 30px;
    height: 40px;
    clip-path: polygon(0 0, 60% 0, 100% 100%, 40% 100%);
    float: left;
    margin-left: 5px;
    background-image: linear-gradient(#ffffff30, #ffffff00 80%);
}

.arrow-right {
    transform: translateY(30%);
    width: 30px;
    height: 40px;
    clip-path: polygon(0 0, 60% 0, 100% 100%, 40% 100%);
    float: right;
    margin-right: 5px;
    background-image: linear-gradient(180deg, #38CEFF30, #38CEFF00 80%);
}
</style>