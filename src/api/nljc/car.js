import request from '@/utils/request'

// 查询抢险车辆列表
export function listCar(query) {
  return request({
    url: '/nljc/car/list',
    method: 'get',
    params: query
  })
}

// 查询抢险车辆详细
export function getCar(id) {
  return request({
    url: '/nljc/car/' + id,
    method: 'get'
  })
}

// 新增抢险车辆
export function addCar(data) {
  return request({
    url: '/nljc/car',
    method: 'post',
    data: data
  })
}

// 修改抢险车辆
export function updateCar(data) {
  return request({
    url: '/nljc/car',
    method: 'put',
    data: data
  })
}

// 删除抢险车辆
export function delCar(id) {
  return request({
    url: '/nljc/car/' + id,
    method: 'delete'
  })
}
