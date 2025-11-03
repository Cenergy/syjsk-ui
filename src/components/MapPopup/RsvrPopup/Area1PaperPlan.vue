<template>
    <div>
        <object v-if="planFile" type="application/pdf" :data="planFile" width="100%" height="700"></object>
        <div v-else style="height: 700px; text-align: center;line-height: 100px;">
            <div style="color: #00E5FF;margin: auto;font-size: 20px">
                暂无当前水库一页纸抢险预案，请联系管理员添加相关附件
            </div>
        </div>
    </div>
</template>

<script>
  // import { getPaperPlan } from "@/api/map/reservoir";
  export default {
    inject: [
      "getStcd",
      "baseInfo"
    ],
    name: 'PaperPlan',
    props: {
     /* id: {
        type: [Number],
        required: true
      }*/
    },
    created() {
      this.getData()
    },

    data(){
      return{
        data:[],
        planFile: '',
        baseUrl: process.env.VUE_APP_BASE_API,
      }
    },
    methods:{
      getData() {
        this.planFile = "/geodata/preplans/抢险应急预案.pdf"
      },
    }
  }
</script>

<style scoped>

</style>
