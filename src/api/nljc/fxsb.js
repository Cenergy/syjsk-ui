import request from '@/utils/request'

// 查询防汛设备列表
export function listFxsb(query) {
  return request({
    url: '/nljc/fxsb/list',
    method: 'get',
    params: query
  })
}

// 查询防汛设备详细
export function getFxsb(id) {
  return request({
    url: '/nljc/fxsb/' + id,
    method: 'get'
  })
}

// 新增防汛设备
export function addFxsb(data) {
  return request({
    url: '/nljc/fxsb',
    method: 'post',
    data: data
  })
}

// 修改防汛设备
export function updateFxsb(data) {
  return request({
    url: '/nljc/fxsb',
    method: 'put',
    data: data
  })
}

// 删除防汛设备
export function delFxsb(id) {
  return request({
    url: '/nljc/fxsb/' + id,
    method: 'delete'
  })
}
