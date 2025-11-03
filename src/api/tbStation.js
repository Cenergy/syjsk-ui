import request from '../utils/request'

export function getStationList(params) {
    return request({
        url: '/web/tbStation/list',
        headers: {
          isToken: false
        },
        params
    })
}

export function getStation(stcd) {
    return request({
        url: '/web/tbStation/'+stcd,
        headers: {
          isToken: false
        },
    })
}

export function getStationbystcd(stcd) {
  return request({
      url: '/web/tbStation/getStationbystcd/'+stcd,
      headers: {
        isToken: false
      },
  })
}