import store from '../store'

/**
 * 拉取会话的消息。适合分页一直往上拉历史消息，每次拉limit条数的消息
 * 
 * scene: ‘p2p', 'team', 'superTeam'
 * to: 用户id，或者群id
 * limit：每次拉取的消息数量，至多100条消息
 */
function loadMoreMsgOfSession(scene, to, limit) {
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
        reverse: false,
        done: function (err, data) {
            //结束调用，设置fetching = false
            store.sessionMsgs[sessionId].fetching = false

            if (err) {
                console.error('loadMoreMsgOfSession Error: ', err)
            } else if (data && data.msgs && data.msgs.length > 0) {
                store.sessionMsgs[sessionId].msgArr = msgArr.concat(data.msgs)

                /**
                 * 拉取的消息长度 < 分页长度，因此 complete = true
                 */
                if (data.msgs.length < limit) {
                    store.sessionMsgs[sessionId].complete = true
                }
            } else {
                store.sessionMsgs[sessionId].complete = true
                console.log('loadMoreMsgOfSession 已拉取会话所有消息')
            }

            console.log(`当前会话: ${sessionId} 的历史消息为`, store.sessionMsgs[sessionId])
        }
    }

    if (lastMsg) {
        params.lasntMsgId = lastMsg.idServer
    }

    store.sessionMsgs[sessionId].fetching = true
    nim.getHistoryMsgs(params)
}
