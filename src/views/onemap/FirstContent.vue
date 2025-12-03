<template>
    <dark-card title="第一道防线(云中雨)">
        <!-- <template #icon>
            <img src="@/assets/icons/png/partTitleIcon.png" alt="">
        </template> -->
        <div style="display: flex; flex-direction: column; padding: 10px; min-height: 100px;">
          <div style="margin-bottom: 10px;">
            <h4 style="color: #fff; margin: 0 0 5px 0; font-size: 14px;">{{ data.title || '天气预报' }}</h4>
            <p style="color: #ccc; margin: 0; font-size: 10px;">{{ data.releaseTime }} | {{ data.releaseUnit }}</p>
          </div>
          <div style="flex: 1; color: #fff; font-size: 12px; line-height: 1.6;">
            <pre style="white-space: pre-wrap; margin: 0; font-family: inherit;">{{ data.content || '暂无数据' }}</pre>
          </div>
        </div>
    </dark-card>
</template>
<script>

export default {
    data() {
        return {
            data: {}
        };
    },
    methods: {
        getData() {
          fetch('http://wx.weather.cn/weather/fwybCompforecast/newTextForecast')
            .then(res => res.json())
            .then(res => {
                this.data = res.data;
                // this.data={
                //     "id": 367138,
                //     "ybid": "GF001",
                //     "releaseTime": "2025年10月22日08时",
                //     "title": "早晨天气预报",
                //     "ybclassId": "GF",
                //     "ybclassName": "天气预报",
                //     "ybname": "早晨天气预报",
                //     "fileType": "TEXT",
                //     "content": "全省天气:\n今天白天赣州市阴天间多云，局部地区有小雨；全省其他市多云。晚上赣州市阴天转多云，全省其他市多云转晴。\n风向：全省偏北；\n风力：3～4级，江湖水面、平原河谷和高海拔山区阵风7级；\n今天最高温度：赣南14～16℃；全省其他地区17～19℃；\n明天最低温度：赣西北9～11℃；全省其他地区11～13℃；\n明天全省晴天间多云。\n",
                //     "filePath": null,
                //     "fileName": null,
                //     "toArea": null,
                //     "stationNum": null,
                //     "invalidTime": null,
                //     "toUser": null,
                //     "releaseUnit": "江西省气象服务中心",
                //     "createIp": "10.116.36.81",
                //     "updateIp": "10.116.36.81",
                //     "createTime": "2025-10-22 05:54:27",
                //     "updateTime": "2025-10-22 08:02:53",
                //     "isInsertCimiss": "0"
                // }
            })
        },
    },
    mounted() {
        this.getData();
    }
}
</script>
<style scoped>
.calpanel {
    margin: 0 15px;

    .item {
        text-align: center;
        text-align: center;
        /* background: rgba(0, 255, 255, 0.2); */
        padding: 10px;
        border: 1px solid #CCC;
        border-radius: 10px;
        margin: 10px 0;
        display: flex;
        flex-direction: column;
        align-items: flex-start;

        .title {
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .rect {
            width: 12px;
            height: 12px;
            margin-right: 5px;
        }
    }
}
</style>