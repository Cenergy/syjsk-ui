<template>
<div
class="pool-statistic__wrapper"
:style="{ width }">
    <div class="pool-statistic__label">{{ label }}</div>
    <div class="pool-statistic__inner">
        <slot>{{ value }}</slot>
    </div>
</div>
</template>
<script>
export default {
    props: {
        label: {
            type: String,
            default: ''
        },
        value: {
            type: [String, Number],
            defualt: ''
        },
        width: {
            type: String,
            defualt: '100px'
        }
    }
}
</script>
<style lang="scss" scoped>
.pool-statistic__wrapper {
    display: flex;
    flex-direction: column;
    width: 84px;
    height: 100px;
    color: white;
    .pool-statistic__label {
        font-size: 12px;
        text-align: center;
    }
    .pool-statistic__inner {
        flex: 1;
        background-position: center;
        background-size: 90% 90%;
        background-repeat: no-repeat;
        background-image: url(./images/background.png);
    }
}
</style>