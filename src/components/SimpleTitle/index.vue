<template>
    <div class="simple-title-wrap">
        <span class="simple-title-text">{{ title }}</span>
        <slot name="extra">
            <span>{{ extra }}</span>
        </slot>
    </div>
</template>
<script>
export default {
    props: {
        title: {
            type: String,
            default: ''
        },
        extra: {
            type: String,
            default: ''
        }
    },
    data() {
        return {

        }
    }
}
</script>
<style scoped>
.simple-title-wrap {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 7px 0px;
}
.simple-title-text {
    color: #6BA3FD;
}
</style>