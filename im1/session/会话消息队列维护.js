// key: sessionId
// value.msgArr: 已经拉取到内存中的会话的消息列表，最新的消息在队列头部
// value.fetching: 是否上次调用getHistoryMsgs的结果还未返回
// value.complete: 是否已经加载完了
// 该变量也可以根据同步阶段的回调函数，比如onroamingmsgs, onofflinemsgs填充
const msgArrBySessionId = {}

nim = NIM.getInstance({
    "lbsUrl": "https://imtest.netease.im/lbs/webconf",
    "defaultLink": "imtest-jd.netease.im:8443",
    "db": false,
    "debug": true,
    "appKey": "fe416640c8e8a72734219e1847ad2547",
    "account": "zk4",
    "token": "e10adc3949ba59abbe56e057f20f883e",
    //初始化阶段，接收所有的sessions
    onofflinemsgs: onofflinemsgs,
    //初始化阶段，接收到置顶会话列表
    onroamingmsgs: onroamingmsgs,
    onmsg: onmsg
})

function onmsg(data) {
    debugger
    const sessionId = data.sessionId
    msgArrBySessionId[sessionId] = msgArrBySessionId[sessionId] || {
        msgArr: [],
        fetching: false,
        complete: false
    }
    msgArrBySessionId[sessionId].msgArr.unshift(data)
}

/**
 * 根据初始化阶段的漫游消息，构建会话的初始消息队列
 */
function onroamingmsgs(data) {
    const sessionId = data.sessionId
    msgArrBySessionId[sessionId] = msgArrBySessionId[sessionId] || {
        msgArr: [],
        fetching: false,
        complete: false
    }
    msgArrBySessionId[sessionId].msgArr = msgArrBySessionId[sessionId].msgArr.concat(data.msgs)
    /**
     * 最新的消息放在队列头部
     */
    msgArrBySessionId[sessionId].msgArr.sort((a, b) => {
        return b.time - a.time
    })
}

/**
 * 根据初始化阶段的离线消息，构建会话的初始消息队列
 */
function onofflinemsgs(data) {
    const sessionId = data.sessionId
    msgArrBySessionId[sessionId] = msgArrBySessionId[sessionId] || {
        msgArr: [],
        fetching: false,
        complete: false
    }
    msgArrBySessionId[sessionId].msgArr = msgArrBySessionId[sessionId].msgArr.concat(data.msgs)
    /**
     * 最新的消息放在队列头部
     */
    msgArrBySessionId[sessionId].msgArr.sort((a, b) => {
        return b.time - a.time
    })
}


//拉取会话的消息。适合分页一直往上拉历史消息，每次拉limit条数的消息
function loadMoreMsgOfSession(scene, to, limit) {
    const sessionId = `${scene}-${to}`
    msgArrBySessionId[sessionId] = msgArrBySessionId[sessionId] || {
        msgArr: [],
        fetching: false,
        complete: false
    }

    if (msgArrBySessionId[sessionId].complete) {
        return
    }

    const msgArr = msgArrBySessionId[sessionId].msgArr
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
            msgArrBySessionId[sessionId].fetching = false

            if (err) {
                console.error('loadMoreMsgOfSession Error: ', err)
            } else if (data && data.msgs && data.msgs.length > 0) {
                msgArrBySessionId[sessionId].msgArr = msgArr.concat(data.msgs)

                /**
                 * 拉取的消息长度 < 分页长度，因此 complete = true
                 */
                if (data.msgs.length < limit) {
                    msgArrBySessionId[sessionId].complete = true
                }
            } else {
                msgArrBySessionId[sessionId].complete = true
                console.log('loadMoreMsgOfSession 已拉取会话所有消息')
            }

            console.log(`当前会话: ${sessionId} 的历史消息为`, msgArrBySessionId[sessionId])
        }
    }

    if (lastMsg) {
        params.lasntMsgId = lastMsg.idServer
    }

    msgArrBySessionId[sessionId].fetching = true
    nim.getHistoryMsgs(params)
}
