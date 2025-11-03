<template>
  <DarkCard title="气象快报" style="">
    <template #icon>
      <img src="@/assets/icons/png/weather.png" alt="">
    </template>
    <span style="line-height: 2;">{{ content }}</span>
  </DarkCard>
</template>

<script>
import dayjs from 'dayjs'
export default {
  name: 'weatherQuickReport',
  components: {},
  props: {},
  data() {
    return {
      time: dayjs().format("YYYY-MM-DD HH:mm"),
      content: "【深圳市解除全市雷电预警信号】我市周边及上游的雷暴云团已减弱，深圳市气象台2025年05月23日23时20分解除全市雷电预警信号。"
    }
  },
  watch: {},
  computed: {},
  created() { },
  mounted() { },
  methods: {},
}
</script>
<style lang="scss" scoped></style>