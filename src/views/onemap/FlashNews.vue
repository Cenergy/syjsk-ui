<template>
  <dark-card title="第二道防线(落地雨)" style :extra="time">
    <!-- <template #icon>
        <img src="@/assets/icons/png/partTitleIcon.png" alt="">
        </template> -->
    <!-- <p style="line-height: 2;background: linear-gradient(180deg, rgba(190, 243, 255, 0) 0%, rgba(202, 222, 255, 0.175) 81.25%, rgba(53, 101, 222, 0.15) 100%);
">{{ content }}</p> -->

    <Sksw
      :code="'dam001'"
      :RZ="125.5"
      :FXSW="130.0"
      :SSW="120.0"
      :BDGC="135.0"
      :JHHSW="132.0"
      :SJHHSW="131.0"
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
