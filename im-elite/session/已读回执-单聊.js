/**
 * 该文件展示 如何判断消息是否被对端阅读
 */
import store from '../store/index.js'

window.nim = NIM.getInstance(window.LoginParams)
window.store = store

let currentUserAccount = 'zk1'

// 同步阶段
nim.on('syncdone', onSyncDone)
nim.on('sessions', syncSessions)
nim.on('syncRoamingMsgs', onSyncMessages)
nim.on('syncOfflineMsgs', onSyncMessages)

// 在线阶段
nim.on('updateSession', onUpdateSession)

await nim.connect()


/**
 * 在同步结束后，利用会话的 msgReceiptTime 字段，设置消息的已读回执状态
 */
function onSyncDone() {
    for (let sessionId in store.sessionMap) {
        const session = store.sessionMap[sessionId]
        /**
         * 标记群聊中每条消息的已读回执是否收到。标记是为了 UI 展示
         */
        if (session.scene === 'p2p') {
            markMsgReceived(session)
        }
    }
}

/**
 * 初始化阶段收到会话列表。
 */
function syncSessions(sessionArr) {
    for (const session of sessionArr) {
        store.sessionMap[session.id] = session
    }
}


/**
 * 对端发送已读回执时，本端会收到此事件。此时，可以根据 msgReceiptTime，判断哪些消息已被对端阅读
 * 
 * 会话更新。sessionArr中的 msgReceiptTime 属性为对端最后一条已读回执的时间
 * 
 * 根据 msgReceiptTime，在渲染端判断每条消息是否已读
 */
function onUpdateSession(session) {
    /**
     * 标记会话中每条消息的已读回执是否收到
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

    if (!sessionMsgReceiptTime) return

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
                     * 因此，碰到第一条已读回执的消息，我们就可以终止循环，因为之前的消息已标记
                     */
                    break
                } else if (msg.time > sessionMsgReceiptTime) {
                    /**
                     * 消息时间晚于已读回执时间，继续循环，标记后面的消息
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
async function sendMsgReceipt(msg) {
    try {
        await nim.msg.sendMsgReceipt({
            msg
        })
    } catch (err) {
        console.error('已读回执发送失败')
    }
}

/**
 * 根据初始化阶段的漫游、离线消息，构建会话的初始消息队列
 */
function onSyncMessages(data) {
    const sessionId = data.sessionId
    store.sessionMsgs[sessionId] = store.sessionMsgs[sessionId] || {
        msgArr: [],
        fetching: false,
        complete: false
    }
    store.sessionMsgs[sessionId].msgArr = store.sessionMsgs[sessionId].msgArr.concat(data.msgs)
    /**
     * 最新的消息放在队列头部
     */
    store.sessionMsgs[sessionId].msgArr.sort((a, b) => {
        return b.time - a.time
    })
}