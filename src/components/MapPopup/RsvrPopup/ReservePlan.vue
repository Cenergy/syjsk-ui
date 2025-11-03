<template>
  <div>
    <object
      v-if="planFile"
      type="application/pdf"
      :data="planFile"
      width="100%"
      height="700"
    ></object>
    <div v-else style="height: 700px; text-align: center; line-height: 100px">
      <div style="color: #00e5ff; margin: auto; font-size: 20px">
        暂无当前水库抢险预案，请前往"水安全管理模块中-水库预案"页面添加相关附件
      </div>
    </div>
  </div>
</template>

<script>
// import { getReservePlan } from "@/api/map/reservoir";
export default {
  inject: ["getStcd", "baseInfo"],
  name: "ReservePlan",
  props: {
    id: {
      type: [Number],
      required: true,
    },
  },
  created() {
    this.getData();
  },

  data() {
    return {
      data: [],
      planFile: "",
      baseUrl: process.env.VUE_APP_BASE_API,
    };
  },
  methods: {
    getData() {
      this.planFile = "/geodata/preplans/调度运用计划.pdf";
      // const id = this.getStcd();
      // getReservePlan(id)
      //   .then(res => {
      //     console.log(res.data)
      //     if (res.data.length > 0){
      //       this.planFile = this.baseUrl + res.data[0]
      //     }
      //   })
    },
  },
};
</script>

<style scoped></style>
