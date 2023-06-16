/**
 * 该文件展示 如何判断消息是否被对端阅读
 */

nim = NIM.getInstance({
    appKey: "YOUR_APPKEY",
    account: "YOUR_ACCOUNT",
    token: "YOUR_TOKEN",
    debug: true,
    onupdatesessions: onupdatesessions,
    onsessions: onsessions,
    onsyncdone: onsyncdone
})


/**
 * 在同步结束后，利用会话的 msgReceiptTime 字段，设置消息的已读回执状态
 */
function onsyncdone() {
    for (let sessionId in store.sessionMap) {
        const session = store.sessionMap[sessionId]
        /**
         * 标记群聊中每条消息的已读回执是否收到
         */
        if (session.scene === 'p2p') {
            markMsgReceived(session)
        }
    }
}

/**
 * 初始化阶段收到会话列表。
 *
 * 注意，该回调函数返回的会话不包含 isTop 属性。
 */
function onsessions(sessionArr) {
    for (const session of sessionArr) {
        store.sessionMap[session.id] = session
    }
    store.orderedSessions = getOrderedSessions(store.sessionMap)
}


/**
 * 会话更新。sessionArr中的 msgReceiptTime 属性为对端最后一条已读回执的时间
 * 
 * 根据 msgReceiptTime，在渲染端判断每条消息是否已读
 */
function onupdatesessions(sessionArr) {
    for (let session of sessionArr) {
        store.sessionMap[session.id] = session
    }
    store.orderedSessions = getOrderedSessions(store.sessionMap)

    /**
     * 标记群聊中每条消息的已读回执是否收到
     */
    if (session.scene === 'p2p') {
        markMsgReceived(session)
    }
}

/**
 * 所有 time <= session.msgReceiptTime ，且发送方为当前用户的消息，都需要标记 readByOtherUser: true，表示这条消息已被阅读
 */
function markMsgReceived(session) {
    const sessionId = session.id
    const sessionMsgReceiptTime = session.msgReceiptTime

    const sessionMsgArr = store.sessionMsgs[sessionId]
    if (sessionMsgArr) {
        for (let i = 0; i < sessionMsgArr.msgArr.length; i++) {
            const msg = sessionMsgArr.msgArr[i]
            if (msg.from === currentUserAccount && msg.to !== currentUserAccount) {
                /**
                 * 只有当前用户发送的消息才有已读回执
                 */
                if (msg.readByOtherUser) {
                    /**
                     * 这里我们假设如果 A 消息标记了已读回执，则A 消息之前的所有消息也标记了已读回执
                     * 
                     * 因此，碰到第一条已读回执的消息，我们就可以终止循环，因为后面的消息都是已读回执的消息
                     */
                    break
                } else if (msg.time > sessionMsgReceiptTime) {
                    /**
                     * 消息时间晚于已读回执时间
                     */
                    continue
                } else {
                    /**
                     * 消息时间 早于等于 已读回执时间
                     */
                    msg.readByOtherUser = true
                }
            }
        }
    }
}

/**
 * 发送已读回执
 */
function sendMsgReceipt(msg) {
    nim.sendMsgReceipt({
        msg: msg,
        done: function (err, data) {
            if (err) {
                console.error('已读回执发送失败')
            } else {
                console.log('已读回执发送成功')
            }
        }
    })
}