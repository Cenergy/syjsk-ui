<template>
  <div class="container">
    <div class="title">【易积水点预报】</div>
    <div class="content">
      <span>1、统计至2025-06-23,全市易积水点<span style="color: rgb(35,227,170)">148</span>个,高风险<span
          style="color: rgb(35,227,170)">43</span>个,中风险<span style="color: rgb(35,227,170)">33</span>个,低风险<span
          style="color: rgb(35,227,170)">134</span>个。</span>
      <br>
      <span>2、至目前，全市有积涝监测站<span style="color: rgb(35,227,170)">148</span>个,积水深度27到50cm<span
          style="color: rgb(35,227,170)">0</span>个，50cm以上<span style="color: rgb(35,227,170)">0</span>个。</span>
      <br>
      <span>3、至目前，预计未来3小时内全市重点关注易积水点<span style="color: rgb(35,227,170)">0</span>个，重点关注片区:<span
          style="color: rgb(220,228,32)">无</span></span>
    </div>
  </div>
</template>
<script>
export default {

  name: 'summaryComponent',

  components: {},

  props: {},

  data() {

    return {

    }

  },

  methods: {

  },

  mounted() {

  },

  watch: {

  }

}

</script>
<style lang="scss" scoped>
.container {
  // position: absolute;
  // top: 10px;
  // left: 50%;
  // -webkit-transform: translateX(-50%);
  // transform: translateX(-50% -50%);
  background: rgba(29, 55, 60, 0.65);
  border-radius: 5px;
  padding: 13px;
  // font-size: ;

  .title {
    text-align: center;
    font-size: 1.2vw;
    font-weight: 600;
  }
}
</style>