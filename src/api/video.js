import request from '../utils/request'

/**
 * 根据站名获取视频链接
 * @param {string} id 站点名称
*/
export function getVideoUrlByStnm(id) {
    return request({
        url: '/web/video/getVideoUrlByStnm',
        method: 'GET',
        params: {
            id
        }
    })
}

export function getVideoUrlByIdISAPI(stcd) {
    return request({
        url: '/web/hikvision/livePreview',
        method: 'GET',
        params: {
          stcd
        }
    })
}

export function updatePreviewTime(channelNo) {
    return request({
        url: '/web/hikvision/updatePreviewTime',
        method: 'POST',
        params: {
            channelNo
        }
    })
}

export function getPlayBackStoreDate(stationId, year, month) {
    return request({
        url: '/web/hikvision/getPlayDateByIsapi',
        method: 'GET',

        params: {
            stationId,
            year,
            month
        }
    })
}

export function exportRecord(stationId, beginTime, endTime) {
    return request({
        url: '/web/hikvision/playback',
        method: 'GET',

        params: {
            stationId,
            beginTime,
            endTime
        }
    })
}

export function isProcessAlive(uuid, fileName) {
    return request({
        url: '/web/hikvision/isProcessAlive',
        method: 'GET',
        headers: {
            isToken: false,
        },
        params: {
            uuid,
            fileName
        }
    })
}

export function closePlayProcess(uuid) {
    return request({
        url: '/web/hikvision/closePlayBackProcess',
        method: 'GET',

        params: {
            uuid
        }
    })
}

export function getVideoData(url, startByte = 0) {
    const controller = new AbortController()
    const signal = controller.signal
    const range = `bytes=${startByte}-`
    const req = fetch(url, {
        headers: { range },
        cache: "no-store",
        signal
    }).then(res=>{
        if(res.status == 200 || res.status == 206) {
            return res.arrayBuffer()
        } else {
            return Promise.reject(res.statusText)
        }
    })
    return [controller, req]
}


export function getRecordList(stationId) {
    return request({
        url: '/web/tbPlaybackVideo/list',
        method: 'GET',

        params: {
            stationId
        }
    })
}

export function getVideoSize(url) {
    return fetch(url, {
        method: 'HEAD',
    }).then(res=>{
        if(res.status == 200) {
            return res.headers.get("Content-Length")
        }
        return Promise.reject()
    })
}
