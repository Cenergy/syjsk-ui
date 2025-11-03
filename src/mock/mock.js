 
import Mock from 'mockjs'
 import waterLoggingPoint from "./data/waterLoggingPoint.json";
//设置请求延时
Mock.setup({
    timeout: '200-2000' //单位为毫秒
})
// Mock.mock(请求路径,请求方式,()=>{})
  //模拟内涝点接口
Mock.mock(/\/nljc\/index\/findNldInfo/, 'get', (req) => {
  return waterLoggingPoint;
})

export default Mock;