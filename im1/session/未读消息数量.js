/**
 * 1. 如何决定消息是否计入未读数
 * 2. 通知消息是否计入未读数
 * 3. 如何设置会话未读数
 */

nim = NIM.getInstance({
    appKey: "YOUR_APPKEY",
    account: "YOUR_ACCOUNT",
    token: "YOUR_TOKEN",
    debug: true,
    /**
     * 初始化阶段，是否同步会话的未读数。默认为 false
     */
    syncSessionUnread: true,
    /**
     * 撤回消息后，是否更新会话的未读数。
     * 
     * 比如有两条未读消息。消息发送方撤回了其中一条。如果该参数为 false，则撤回后，未读数为2。如果该参数为 true，则撤回后，未读数为1
     */
    rollbackDelMsgUnread: true,
    /**
     * 是否需要将通知类型的消息计入未读数。默认为返回 false。
     * 
     * 通知类型的消息包括：群信息变更；拉人入群；移除群成员，等等，具体请查看 https://doc.yunxin.163.com/messaging/api-refer/web/typedoc/Latest/zh/NIM/interfaces/nim_types.NIMGetInstanceOptions.html#onmsg
     */
    shouldCountNotifyUnread: function (msg) {
        return false
    },
    /**
     * 通知类型消息是否需要触发 onupdatesessions，以及 onmsgs 回调。默认为返回 false，表示不忽略，即需要触发该回调
     * 
     * 触发后，会话的 lastMsg 变更为 通知类型消息。你的会话列表显示的最后一条消息为群通知消息
     */
    shouldIgnoreNotification: function (msg) {
        return false
    },
    onupdatesessions: onupdatesessions
})


/**
 * 会话更新。sessionArr中的 unread 属性为会话的未读数
 */
function onupdatesessions(sessionArr) {
    for (let session of sessionArr) {
        store.sessionMap[session.id] = session
    }
    store.orderedSessions = getOrderedSessions(store.sessionMap)
}


/**
 * 进入会话的界面后，调用该函数，设置会话的未读数为0。同时，如果有新消息到来的话，会话未读数会保持为0
 */
function setCurrSession(session) {
    nim.setCurrSession(session.id)
}

/**
 * 退出会话后，调用该接口取消设置当前会话。这样，有新消息到来时，会话未读数会更新
 */
function resetCurrSession(session) {
    nim.resetCurrSession(session.id)
}
