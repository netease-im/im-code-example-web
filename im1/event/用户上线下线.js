/**
 * 订阅好友的在线状态
 * 
 * TODO: 这个文件应该在好友列表更新之后写比较容易
 */

import store from '../store'

nim = NIM.getInstance({
    appKey: "YOUR_APPKEY",
    account: "YOUR_ACCOUNT",
    token: "YOUR_TOKEN",
    debug: true,
    //初始化阶段，同步置顶会话数据
    syncStickTopSessions: true,
    //初始化阶段，接收所有的sessions
    onsessions: onsessions,
    //初始化阶段，接收到置顶会话列表
    onStickTopSessions: onStickTopSessions,
    //会话置顶信息变更时，触发onupdatesessions回调函数
    onupdatesessions: onupdatesessions,
})

function registerEventSubscribe(options) {
    this.nim.subscribeEvent({
        type: 1,
        accounts: options.accounts,
        /**
         * 订阅30天。最长为30天
         */
        subscribeTime: 2592000,
        sync: true,
        done: (err, obj) => {
            if (err) {
                // 订阅用户在线状态失败
                console.error('订阅用户在线状态失败', err)
            } else {
                // 订阅成功
            }
        },
    })
}