import request from '../utils/request'

/**
 * 云台控制
 * @param {string} channo 频道编码
 * @param {number} direction 方向
 * @param {0|1} startFlag 启动标识，启动：1，复位：0
 */
export function yuntaiControl(channo, direction, startFlag = 1) {
    return request({
        url: '/web/video/controlVideo',
        method: 'POST',
        data: {
            channo,
            direction,
            startFlag
        }
    })
}

/**
 * 云台控制 使用isapi
 * @param {string} stationId 频道编码
 * @param {number} direction 方向
 * @param {0|1} startFlag 启动标识，启动：1，复位：0
 */
export function yuntaiControlISAPI(channelNo, direction, startFlag = 1) {
    return request({
        url: '/web/hikvision/moveVideo',
        method: 'POST',
        data: {
            channelNo,
            direction,
            startFlag
        }
    })
}


export function lockYunTai(channelNo, password) {
    return request({
        url: '/web/hikvision/lockPTZ',
        method: 'GET',
        params: {
            channelNo,
            password
        }
    })
}

export function unlockYunTai(channelNo, password) {
    return request({
        url: '/web/hikvision/unlockPTZ',
        method: 'GET',
        params: {
            channelNo,
            password
        }
    })
}

export function getYuntaiPresetList(stationId) {
    return request({
        url: '/web/hikvision/getPresetListById',
        method: 'GET',
        params: {
            stationId
        }
    })
}

export function goToYuntaiPreset(presetId, stationId) {
    return request({
        url: '/web/hikvision/gotoPreset',
        method: 'PUT',
        data: {
            id: presetId,
            stationId
        }
    })
}

export function setYuntaiPreset(stationId, presetId, presetName) {
    return request({
        url: '/web/hikvision/setPreset',
        method: 'PUT',
        data: {
            stationId,
            id: presetId,
            presetName
        }
    })
}

export function delYuntaiPreset(stationId, presetId) {
    return request({
        url: '/web/hikvision/deletePreset',
        method: 'DELETE',
        data: {
            stationId,
            id: presetId,
        }
    })
}

export function getYuntaiSequnceList(stationId) {
    return request({
        url: '/web/hikvision/getPatrolsListById',
        method: 'GET',
        params: {
            stationId
        }
    })
}

export function getYuntaiSequence(stationId, patrolsId) {
    return request({
        url: '/web/hikvision/getPatrolsDetailById',
        method: 'GET',
        params: {
            stationId,
            patrolsId
        }
    })
}

export function setYuntaiSequence(data) {
    return request({
        url: '/web/hikvision/setPatrols',
        method: 'PUT',
        data
    })
}

export function delYuntaiSequence(stationId, patrolsId) {
    return request({
        url: '/web/hikvision/deletePatrols',
        method: 'DELETE',
        params: {
            stationId,
            patrolsId
        }
    })
}

export function startYuntaiSequence(stationId, patrolsId) {
    return request({
        url: '/web/hikvision/startPatrols',
        method: 'PUT',
        params: {
            stationId,
            patrolsId
        }
    })
}

export function stopYuntaiSequence(stationId, patrolsId) {
    return request({
        url: '/web/hikvision/stopPatrols',
        method: 'PUT',
        params: {
            stationId,
            patrolsId
        }
    })
}

