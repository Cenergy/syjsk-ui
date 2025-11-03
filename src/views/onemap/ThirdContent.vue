<template>
  <dark-card title="第三道防线(水库水位)" style :extra="time">
    <Sksw
      :code="'dam001'"
      :RZ="198.4"
      :FXSW="196.5"
      :SSW="183.0"
      :BDGC="202.5"
      :JHHSW="200.6"
      :SJHHSW="199.0"
      :ZCSW="198.4"
    />
  </dark-card>
</template>
<script>
import { getWeatherAlarm } from "../../api/nljc";
import Sksw from "./Sksw.vue";

export default {
  components: {
    Sksw,
  },
  data() {
    return {
      time: "",
      content: "暂无预警",
    };
  },
  created() {
    getWeatherAlarm().then(({ data }) => {
      this.time = data.alarmDate;
      this.content = "";
    });
  },
};
</script>
<style scoped></style>
