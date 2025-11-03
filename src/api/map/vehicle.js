import request from "@/utils/request";

/**
 * 获取车辆数据
 * @returns {Object}
 */
export function getVehiclePointList(id) {
    return request({
      url: `/nljc/index/findFxsbList`,
      method: "GET",
      params: {
        id,
      },
    });
}
