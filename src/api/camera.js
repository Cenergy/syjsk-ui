import request from '@/utils/request'

export function checkPwd(pwd) {
    return request({
        url: '/web/hikvision/checkPassword',
        method: 'GET',
        headers: {
          isToken: false
        },
        params: {
            password: pwd
        }
    })
}