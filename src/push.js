 function initWebSocket(userName) {
        //开启webstocket服务的ip地址：ws://+ip地址+访问路径
        const ws = new WebSocket('ws://:8301/aiDutyAssistant/websocket/{userName}');
        // 获取连接状态
        console.log('ws连接状态：' + ws.readyState);
        //监听是否连接成功
        ws.onopen = function () {
            console.log('ws连接状态：' + ws.readyState);
            //连接成功则发送一个数据
            //ws.send('我们建立连接啦');
        }
        //接听服务器发回的信息并处理展示
        ws.onmessage = function (data) {
            console.log('接收到来自服务器的消息：' + data.data);
            // data 格式
            /**
              {"icon":"https://wxc.gd121.cn/html/weixinportal/images/yjxx/2/11B20_3.png","id":"fd1ad87b7d9163fecccdaf56e3afa805","publishTime":"2025-05-09 08:00","warnArea":"440300","warnContent":"【深圳市暴雨黄色预警信号扩展至全市】预计我市东部未来1-2小时将出现30毫米左右降水，深圳市气象台2025年05月07日13时52分将分区暴雨黄色预警信号扩展至全市，全市处于暴雨戒备状态。上述区域存在山洪风险，请注意防御暴雨可能引发的局部内涝、山洪等灾害。","warnId":"500746437","warnLevel":"黄色","warnStatus":"发布","warnType":"暴雨"}
              */

        }
        //监听连接关闭事件
        ws.onclose = function () {
            //监听整个过程中websocket的状态
            console.log('ws连接状态：' + ws.readyState);
            reconnect();
        }
        //监听并处理error事件
        ws.onerror = function (error) {
            console.log(error);
        }
        return ws
    }