<template>
    <div style="min-height: 300px;width: 100%;height: 100%;">
        <img :src="imgUrl" alt="" style="width: 100%; height: auto;">
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
      imgUrl: {
        type: String,
        default: ''
      }
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
