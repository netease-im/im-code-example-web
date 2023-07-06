/**
 * 该文件展示 如何获取群聊的已读回执。注意，群聊发送消息时，必须设置 needMsgReceipt: true
 * 
 * 群聊已读回执在初始化阶段并不会自动同步。开发者应该在用户进入对应的消息浏览界面时，调用：
 * 
 * 1. queryMsgReceiveInfoInBatch: 批量查询群聊已读回执简要（拉取多条消息已读数量+被读数量）
 * 2. queryMsgReceiveInfoDetail：用户点击已读回执详情时，调用该函数获取已读用户详细名单
 * 
 * 同时监听：onTeamMsgReceipt。这样能够在有新的消息时，保持已读回执简要的更新
 */

nim = NIM.getInstance({
    appKey: "YOUR_APPKEY",
    account: "YOUR_ACCOUNT",
    token: "YOUR_TOKEN",
    debug: true,
    onupdatesessions: onupdatesessions,
    onTeamMsgReceipt: onTeamMsgReceipt
})

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
}

/**
 * 发送消息
 */
function sendText(teamId, text) {
    nim.sendText({
        scene: 'team',
        to: teamId,
        text,
        /**
         * 必须要设置 needMsgReceipt才能够接收群消息的已读回执
         */
        needMsgReceipt: true,
        done: function (err, data) {
            debugger
            const sessionId = data.sessionId
            store.sessionMsgs[sessionId] = store.sessionMsgs[sessionId] || {
                msgArr: [],
                fetching: false,
                complete: false
            }
            store.sessionMsgs[sessionId].msgArr.unshift(data)
        }
    })
}

/**
 * 接收方发送已读回执
 */
function sendMsgReceipt(msg) {
    nim.sendTeamMsgReceipt({
        teamMsgReceipts: [{
            teamId: 'teamId',
            idClient: 'xxxx',
            idServer: 'yyyy'
        }],
        done: function (err) {
            if (err) {
                console.error('群消息已读回执发送失败')
            } else {
                console.log('群消息已读回执发送成功')
            }
        }
    })
}


/**
 * data: Array<{
 *   idClient,
 *   idServer,
 *   read,
 *   unread,
 *   teamId,
 *   account
 * }>
 */
function onTeamMsgReceipt(data) {
    debugger
    for (let entry of data.teamMsgReceipts) {
        const msg = getMsg(entry.teamId, entry.idClient)
        if (msg) {
            markMsgReceivedInfo(msg, entry)
        }
    }
}

function getMsg(teamId, idClient) {
    const sessionId = `team-${teamId}`
    /**
     * 会话消息列表
     */
    const sessionMsgArr = store.sessionMsgs[sessionId]

    if (sessionMsgArr) {
        const msg = sessionMsgArr.msgArr.find(msg => msg.idClient === idClient)
        return msg
    }
}

/**
 * 更新消息的 未读数以及已读数
 */
function markMsgReceivedInfo(msg, data) {
    msg.msgReceiptInfo = {
        unread: parseInt(data.unread),
        read: parseInt(data.read),
        readList: null
    }
}


/**
 * 用户点击UI，查看详细的已读列表时，调用下面的函数查看已读详情
 */
function queryMsgReceiveInfoDetail(options) {
    const msg = getMsg(options.to, options.idClient)

    /**
     * 如果消息不存在，或者消息的 readList已经查询完毕，则无需查询
     */
    if (msg && !(msg.msgReceiptInfo && msg.msgReceiptInfo.readList !== null)) {
        nim.getTeamMsgReadAccounts({
            teamMsgReceipt: { "teamId": options.to, "idServer": options.idServer },
            done: function (err, _, data) {
                msg.msgReceiptInfo = {
                    unread: data.unreadAccounts.length,
                    read: data.readAccounts.length,
                    readList: data.readAccounts.slice()
                }
            }
        })
    }
}

/**
 * 批量查询群消息已读回执记录
 */
function queryMsgReceiveInfoInBatch(msgArr) {
    /**
     * 先过滤掉 store.sessionMsgs 中不存在的消息
     */
    msgArr = msgArr.filter(options => {
        const msg = getMsg(options.to, options.idClient)
        return msg
    })

    nim.getTeamMsgReads({
        teamMsgReceipts: msgArr.map(options => {
            return {
                teamId: options.to,
                idServer: options.idServer,
                idClient: options.idClient
            }
        }),
        done: function (err, _, data) {
            for (let entry of data.teamMsgReceipts) {
                const msg = getMsg(entry.teamId, entry.idClient)
                if (msg) {
                    msg.msgReceiptInfo = {
                        unread: parseInt(entry.unread),
                        read: parseInt(entry.read),
                        readList: null
                    }
                }
            }
        }
    })
}