<template>
    <el-image
    :src="src"
    :preview-src-list="[src]"
    fit="cover"></el-image>
</template>
<script>
export default {
    inject: ["getStcd"],
    data() {
        return {
            
        }
    },
    computed: {
        src() {
            const stcd = this.getStcd()
            return `/map/images/preplan/reservoir/${stcd}.png`
        }
    }
}
</script>
<style scoped>

</style>