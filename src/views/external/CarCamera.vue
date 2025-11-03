<template>
<LivePlayer :url="cameraUrl" style="width: 100%; height: 100%;" />
</template>
<script>
import LivePlayer from '@/components/LivePlayer'
import { findFxsbList, findVehicleVideoUrl } from "@/api/nljc/index"

export default {
    components: {
        LivePlayer
    },

    data() {
        return {
            cameraUrl: ""
        }
    },
    mounted() {
        const { code } = this.$route.params
        // if (!code) {
        //     this.$message.error("请传递车牌号")
        //     return
        // }
        // findFxsbList(462)
        // .then(res => {
        //     const car = res.vehic.find((item) => item.carcode === code)
        //     if (car) {
        //         return findVehicleVideoUrl(car.carcode, car.sources, car.device_id)
        //     }
        //     return Promise.reject("未找到车辆")
        // })
        // .then(res => {
        //     this.cameraUrl = res.data.url
        // })
        // .catch(err => {
        //     this.$message.error(err)
        // })
    }
}
</script>
<style scoped>
    
</style>