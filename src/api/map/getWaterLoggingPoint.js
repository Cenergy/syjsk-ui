import request from "@/utils/request";

/**
 * 获取内涝点数据
 * @returns {Object}
 */
export function getWaterLoggingPointList(id) {
    return request({
      url: `/nljc/index/findNldInfo`,
      method: "GET",
      params: {
        id,
      },
    });
}
