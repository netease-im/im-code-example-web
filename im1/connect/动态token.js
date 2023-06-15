// 动态token登录
var nim = NIM.getInstance({
    debug: true, // 是否开启日志，将其打印到console。集成开发阶段建议打开。
    appKey: 'appKey',
    account: 'account',
    token: 'token', // 第一次登录填写的token
    /**
     * 使用动态 token 登录时，必须设置 authType 为 1
     */
    authType: 1,
    onwillreconnect: onwillreconnect
})

/**
 * 重连时，需要更新 token。建议token生成逻辑在客户的服务器侧完成，以免AppSecret泄露。
 */
function onwillreconnect() {
    /**
     * 注意这里必须 return promise，这样会等待新token设置完成后，再开始重连
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
}