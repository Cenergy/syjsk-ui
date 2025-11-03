import request from '@/utils/request'

// 查询视频监控设备信息列表
export function listInfo(query) {
  return request({
    url: '/nljc/video/list',
    method: 'get',
    params: query
  })
}

// 查询视频监控设备信息详细
export function getInfo(vdid) {
  return request({
    url: '/nljc/video/' + vdid,
    method: 'get'
  })
}

// 新增视频监控设备信息
export function addInfo(data) {
  return request({
    url: '/nljc/video',
    method: 'post',
    data: data
  })
}

// 修改视频监控设备信息
export function updateInfo(data) {
  return request({
    url: '/nljc/video',
    method: 'put',
    data: data
  })
}

// 删除视频监控设备信息
export function delInfo(vdid) {
  return request({
    url: '/nljc/video/' + vdid,
    method: 'delete'
  })
}
