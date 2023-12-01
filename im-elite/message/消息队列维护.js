/**
 * 1. 初始化阶段，通过 onroamingmsgs, onofflinemsgs 构建会话的消息列表。
 * 2. 用户发送消息时，在回调函数中将消息加入列表。收到消息时，通过 onmsg 将消息加入消息列表。
 * 3. 撤回消息，或者删除消息对消息列表的影响请参考 message 文件夹下对应的示例代码
 * 4. 用户向上加载会话内容时，通过 loadMoreMsgOfSession 将更多的消息加载到消息列表中
 * 
 * 发送消息时，需要先插入消息。后面在 done 回调覆盖之前插入的消息
 */

import store from '../store/index.js'

window.nim = NIM.getInstance(window.LoginParams)

window.nim.on('syncRoamingMsgs', onSyncMessages)
window.nim.on('syncOfflineMsgs', onSyncMessages)
window.nim.on('sessions', onSyncSessions)
window.nim.on('msg', onReceiveMessage)

window.nim.connect()

/**
 * 发送消息时，将消息加入队列中。消息发送成功后，再根据 idClient 更新队列
 * 
 * 注意，这里仅展示发送文本消息。其他类型的消息也是同样的处理
 */
async function sendText(scene, to, body) {
    try {
        const msg = await nim.msg.sendTextMsg({
            scene,
            to,
            body,
            onSendBefore: function (msg) {
                /**
                 * 将正在发送的消息插入队列中
                 */
                addMsgToMsgArr(msg)
            }
        })
        /**
         * 将发送完成的消息插入队列。
         */
        updateMsgInMsgArr(msg)
    } catch (err) {
        console.error('sendText Error: ', err)
    }
}

/**
 * 收到消息后，将消息压入消息队列头部
 */
function onReceiveMessage(msg) {
    addMsgToMsgArr(msg)
}

/**
 * 收到新消息，将消息压入队列头部
 */
function addMsgToMsgArr(msg) {
    const sessionId = msg.sessionId
    store.sessionMsgs[sessionId] = store.sessionMsgs[sessionId] || {
        msgArr: [],
        fetching: false,
        complete: false
    }

    // 点击发送消息后，消息传入 消息队列的 头部
    store.sessionMsgs[sessionId].msgArr.unshift(msg)
}

/**
 * 消息发送完成后，将新的消息替换队列中的消息
 */
function updateMsgInMsgArr(msg) {
    const sessionId = msg.sessionId

    if (store.sessionMsgs[sessionId]) {
        const msgArr = store.sessionMsgs[sessionId].msgArr
        for (let i = 0; i < msgArr.length; i++) {
            if (msgArr[i].idClient === msg.idClient) {
                msgArr[i] = msg
                break
            }
        }
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

/**
 * 收到初始化阶段的会话列表，构建会话列表
 * 
 * 这个功能和 onSyncMessage 互为补充。如果有一些置顶会话没有漫游消息，则可以通过该回调构建会话，插入至会话列表中
 */
function onSyncSessions(sessions) {
    sessions.forEach(session => {
        const sessionId = session.id
        store.sessionMsgs[sessionId] = store.sessionMsgs[sessionId] || {
            msgArr: [],
            fetching: false,
            complete: false
        }
    })
}

/**
 * 用户向上加载会话列表时，通过该函数拉取更多消息
 */
async function loadMoreMsgOfSession(scene, to, limit) {
    const sessionId = `${scene}-${to}`
    store.sessionMsgs[sessionId] = store.sessionMsgs[sessionId] || {
        msgArr: [],
        fetching: false,
        complete: false
    }

    if (store.sessionMsgs[sessionId].complete) {
        return
    }

    const msgArr = store.sessionMsgs[sessionId].msgArr
    const lastMsg = msgArr[msgArr.length - 1]

    const params = {
        // 返回的结果按时间降序排列
        asc: false,
        scene: scene,
        to: to,
        beginTime: 0,
        limit: limit,
        endTime: lastMsg ? lastMsg.time : 0,
        // 从endTime开始往前查找
        reverse: false
    }

    // 设置分割线
    // 该参数主要作用是避免有多个消息的时间等于 endTime，或者 beginTime，导致重复拉取
    if (lastMsg) {
        params.lastMsgId = lastMsg.idServer
    }
    store.sessionMsgs[sessionId].fetching = true

    try {
        const msgs = await nim.msgLog.getHistoryMsgs(params)
        store.sessionMsgs[sessionId].fetching = false
        store.sessionMsgs[sessionId].msgArr = msgArr.concat(msgs)

        // 拉取的消息长度 < 分页长度，因此 complete = true
        if (msgs.length < limit) {
            store.sessionMsgs[sessionId].complete = true
            console.log('loadMoreMsgOfSession 已拉取会话所有消息')
        }
    } catch (err) {
        console.error('loadMoreMsgOfSession Error: ', err)
        store.sessionMsgs[sessionId].fetching = false
    }
}