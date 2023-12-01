import store from '../store'

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