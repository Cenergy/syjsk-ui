<template>
  <dark-card title="第二道防线(落地雨)" style :extra="time">
    <!-- <template #icon>
        <img src="@/assets/icons/png/partTitleIcon.png" alt="">
        </template> -->
    <!-- <p style="line-height: 2;background: linear-gradient(180deg, rgba(190, 243, 255, 0) 0%, rgba(202, 222, 255, 0.175) 81.25%, rgba(53, 101, 222, 0.15) 100%);
">{{ content }}</p> -->
  <ForecastRain1></ForecastRain1>
  </dark-card>
</template>
<script>
import { getWeatherAlarm } from "../../api/nljc";
import ForecastRain1 from "./ForecastRain1"

export default {
  components: {
    ForecastRain1,
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
