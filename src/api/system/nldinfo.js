import request from '@/utils/request'

// 查询内涝点基本信息列表
export function listInfo(query) {
  return request({
    url: '/nljc/nldinfo/list',
    method: 'get',
    params: query
  })
}

// 查询内涝点基本信息详细
export function getInfo(id) {
  return request({
    url: '/nljc/nldinfo/' + id,
    method: 'get'
  })
}

// 新增内涝点基本信息
export function addInfo(data) {
  return request({
    url: '/nljc/nldinfo',
    method: 'post',
    data: data
  })
}

// 修改内涝点基本信息
export function updateInfo(data) {
  return request({
    url: '/nljc/nldinfo',
    method: 'put',
    data: data
  })
}

// 删除内涝点基本信息
export function delInfo(id) {
  return request({
    url: '/nljc/nldinfo/' + id,
    method: 'delete'
  })
}
