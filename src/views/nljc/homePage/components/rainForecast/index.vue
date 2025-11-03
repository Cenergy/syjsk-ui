<template>
    <DarkCard title="降雨预报" style="">
   <template #icon>
      <img src="@/assets/icons/png/rain-stat.png" alt="">
    </template>
    <VueEcharts :option="option" style="height: 300px;" />
  </DarkCard>
</template>

<script>
import VueEcharts from '@/components/VueEcharts'

export default {
  name: 'rainForecast',
  components: { VueEcharts },
  props: {},
  data() {
    return {
       option: {
                xAxis: {
                    type: 'category',
                    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    {
                        data: [820, 932, 901, 934, 1290, 1330, 1320],
                        type: 'line',
                        itemStyle: {
                            opacity: 0
                        },  
                        smooth: true
                    }
                ],
                textStyle: {
                    color: '#fff'
                }
      }
    }
  },
  watch: {},
  computed: {},
  created() {},
  mounted() {},
  methods: {},
}
</script>
<style lang="scss" scoped>
</style>