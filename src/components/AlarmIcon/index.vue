<template>
    <img
    :src="iconUrl"
    class="alarm-icon">
</template>
<script>
export default {
    props: {
        icon: {
            type: String,
            default: ''
        },
        alt: {
            type: String,
            default: ''
        }
    },
    computed: {
        iconUrl() {
            return `https://weather.sz.gov.cn/alarmIcon/${this.icon}.png`;
        }
    }
}
</script>
<style scoped>
.alarm-icon {
    width: 50px;
}

.alarm-icon + .alarm-icon {
    margin-left: 10px;
}
</style>