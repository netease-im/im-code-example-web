/**
 * 单向删除会话中的消息。比如用户需要将某些消息从会话中删除时使用。（会话其它参与者仍可以看到该消息）
 * 
 * - 若需要其它参与者看不到该消息，应该使用撤回消息功能。
 * 
 * 单向删除：
 * 1. 调用 deleteSelfMsgs 从服务器中删除该消息
 * 2. 调用后，在 store 中将对应会话中的消息删除
 * 3. 收到多端同步的消息删除回调时(deleteSelfMsgs)，也需要将会话中的消息删除
 */

import store from '../store'

let currentUserAccount = "YOUR_ACCOUNT"

nim = NIM.getInstance({
    appkey: "YOUR_APPKEY",
    account: currentUserAccount,
    token: "YOUR_TOKEN",
    debugLevel: 'debug'
})

nim.on('deleteSelfMsgs', function (deletedMessages) {
    deleteMsgsFromSession(deletedMessages)
})

/**
 * 1. 先调用 SDK 接口单向删除消息
 * 2. 从维护的数据中删除该消息
 */
async function deleteMsg(msgArr) {
    /**
     * 单向删除消息。对于其他用户来说，消息仍可见。
     * 
     * 当前用户删除后，再次登录时收不到该消息的漫游消息，也无法通过历史消息查询该消息
     */
    const deletedMsgs = await nim.msg.deleteSelfMsgs({
        msgs: msgArr,
    })
    deleteMsgsFromSession(deletedMsgs)
}

/**
 * 将消息从内存中删除。
 * 
 * store.sessionMsgs 变化后，用户应该刷新会话的消息列表
 */
function deleteMsgsFromSession(msgArr) {
    for (let msg of msgArr) {
        const sessionId = getSessionIdFromMsg(msg, currentUserAccount)
        const item = store.sessionMsgs[sessionId]

        if (!item) continue
        item.msgArr = item.msgArr.filter(_ => {
            return msg.idClient !== _.idClient
        })
    }
}