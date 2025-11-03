import axios from "axios";
import request from "@/utils/request";
export function getWeatherAlarm() {
  return axios({
    url: "/radar/data_cache/szWeather/alarm/szAlarm.json",
    method: "GET",
    params: {
      random: Math.random(),
    },
  });
}
/**
 * 获取首页关键水情数据
 * @returns {Object}
 */
export function getIndexGjsq() {
  return request({
    url: `/nljc/index/getIndexGjsq`,
    method: "GET",
  });
}

/**
 * 获取首页气象预报雨量
 * @returns {Object}
 */
export function findQxybyl() {
  try {
    return request({
      url: `/nljc/index/findQxybyl`,
      method: "GET",
    });
  } catch (error) {
    return { success: false, data: [] };
  }
}

/**
 * 获取内涝点基本信息
 * @returns {Object}
 */
export function getWaterLoggingPointBaseInfo(id) {
  return request({
    url: `/nljc/index/findNldInfo`,
    method: "GET",
    params: {
      id,
    },
  });
}
/**
 * 获取内涝点数据
 * @returns {Object}
 */
export function findNldjcData(stcd) {
  return request({
    url: `/nljc/index/findNldjcData`,
    method: "GET",
    params: {
      stcd,
    },
  });
}

/**
 * 获取内涝点值班值守人员列表
 * @returns {Object}
 */
export function findZbzsryList(id) {
  return request({
    url: `/nljc/index/findZbzsryList`,
    method: "GET",
    params: {
      id,
    },
  });
}

/**
 * 根据内涝点id查询防汛设备
 * @returns {Object}
 */
export function findFxsbList(id) {
  try {
    return request({
      url: `/nljc/index/findFxsbList`,
      method: "GET",
      params: {
        id,
      },
    });
  } catch (error) {
    return { success: false, data: [] };
  }
}

/**
 * 根据内涝点id查询防汛设备
 * @returns {Object}
 */
export function findRzList(stcd, beginTime, endTime) {
  return request({
    url: `/nljc/index/findRzList`,
    method: "GET",
    params: {
      stcd,
      beginTime,
      endTime,
      tp: "min",
    },
  });
}

/**
 * 降雨信息查询
 * @returns {Object}
 */
export function findRainInfo(beginTime, endTime) {
  return request({
    url: `/nljc/index/findRainInfo`,
    method: "GET",
    params: {
      gridid: "3697",
      beginTime,
      endTime,
    },
  });
}

/**
 * 通过摄像头编码查询摄像头流地址
 * @param {String} code 摄像头编码
 * @returns {Object}
 */
export function findVideoUrl(code) {
  return request({
    url: `/nljc/index/findVideoUrl`,
    method: "GET",
    params: {
      code,
    },
  });
}
export function videoCheck(sessionId) {
  return request({
    url: `/nljc/index/videoCheck/${sessionId}`,
    method: "GET",
  });
}

/**
 * 根据车牌号码查询车载播放地址
 * @param {String} code 车牌号
 * @returns {Object}
 */
export function findVehicleVideoUrl(code, sources, deviceld) {
  return request({
    url: `/nljc/index/findVehicleVideoUrl`,
    method: "GET",
    params: {
      code,
      sources,
      deviceld,
    },
  });
}
