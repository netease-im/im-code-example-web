// 动态token登录
var nim = NIM.getInstance({
    debugLevel: "debug", // 日志级别
    appkey: 'appkey',
    account: 'account',
    token: 'token', // 第一次登录填写的token
    /**
     * 使用动态 token 登录时，必须设置 authType 为 1
     */
    authType: 1
})

nim.on('willReconnect', () => {
    /**
     * 重新从业务服务器获取 token 后，调用 setOptions 设置新的 token
     */
    return fetch('https://you_server_api')
        .then((res) => {
            return res.json()
        })
        .then((res) => {
            nim.setOptions({
                token: res.token
            })
        })
})

nim.connect()