/**
 * 订阅好友的在线状态
 */

import store from '../store'

nim = NIM.getInstance({
    appKey: "YOUR_APPKEY",
    account: "YOUR_ACCOUNT",
    token: "YOUR_TOKEN",
    debugLevel: "debug"
})

nim.on('logined', () => {
    /**
     * 刚连接上时，设置所有用户的在线状态为空（可以理解为离线）
     * 
     * 重连时，也要设置所有用户的在线状态为空。否则可能出现：
     * 1. A重连
     * 2. B重连期间离线
     * 3. A连接上之后，没有B的事件，此时应该按照B离线作为默认情况处理
     */
    store.friendsOnlineStatus = {}
})

nim.on('pushEvents', (msgEvents) => {
    for (let event of msgEvents) {
        store.friendsOnlineStatus[event.account] = {
            /**
             * 1: 在线
             * 2: logout
             * 3: offline
             */
            value: event.value
        }
    }
})


/**
 * 参考 user/用户资料与好友关系.js 
 * 
 * 当 store.friendArr 添加新的成员时，调用此接口订阅用户的上线下线状态
 */
async function subscribeUserState(accounts) {
    try {
        await nim.event.subscribeEvent({
            type: 1,
            accounts: accounts,
            /**
             * 订阅30天。最长为30天
             */
            subscribeTime: 2592000,
            sync: true
        })
    } catch (err) {
        console.error('订阅用户在线状态失败', err)
        return
    }

    console.log('订阅用户在线状态成功')
}

/**
 * 参考 user/用户资料与好友关系.js 
 * 
 * 当 store.friendArr 删除成员时，调用此接口解除订阅用户的上线下线状态
 */
async function unsubscribeUserState(accounts) {
    try {
        await nim.event.unSubscribeEvents({
            accounts,
            type: 1
        })
    } catch (err) {
        console.error('取消订阅失败', err)
        return
    }

    console.log('取消订阅成功')
}