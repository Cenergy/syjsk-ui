import request from "@/utils/request";

/**
 * 获取降水预报点数据
 * @returns {Object}
 */
export async function getQxGrid(params={}) {
    try {
      return request({
        url: `/nljc/index/getGridList`,
        method: "GET",
        params,
      });
    } catch (error) {
      return {code: 500,message: error}
    }
}
export async function getQxData(params={}) {
    try {
      return request({
        url: `/nljc/index/findRainInfo`,
        method: "GET",
        params,
      });
    } catch (error) {
      return {code: 500,message: error}
    }
}
