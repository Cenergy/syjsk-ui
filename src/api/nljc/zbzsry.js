import request from '@/utils/request'

// 查询值班值守人员列表
export function listZbzsry(query) {
  return request({
    url: '/nljc/zbzsry/list',
    method: 'get',
    params: query
  })
}

// 查询值班值守人员详细
export function getZbzsry(id) {
  return request({
    url: '/nljc/zbzsry/' + id,
    method: 'get'
  })
}

// 新增值班值守人员
export function addZbzsry(data) {
  return request({
    url: '/nljc/zbzsry',
    method: 'post',
    data: data
  })
}

// 修改值班值守人员
export function updateZbzsry(data) {
  return request({
    url: '/nljc/zbzsry',
    method: 'put',
    data: data
  })
}

// 删除值班值守人员
export function delZbzsry(id) {
  return request({
    url: '/nljc/zbzsry/' + id,
    method: 'delete'
  })
}
