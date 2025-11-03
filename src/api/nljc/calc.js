import request from "@/utils/request";

/**
 * 积水预报计算(暴雨强度公式和scs模型法)
 * @returns {Object}
 */
export function calcJsInfo(method, rain, hh) {
  return request({
    url: `/nljc/js/calcJsInfo`,
    method: "GET",
    params: {
      psfqid: 1724,
      id: 462,
      method,
      rain,
      hh
    },
  });
}

/**
 * 水位雨量数据
 * @returns {Object}
 */
export function getJsData(id = 462) {
  return request({
    url: `/nljc/js/getJsData`,
    method: "GET",
    params: {
      id
    },
  });
}