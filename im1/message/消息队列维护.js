/**
 * 1. 初始化阶段，通过 onroamingmsgs, onofflinemsgs 构建会话的消息列表。
 * 2. 用户发送消息时，在回调函数中将消息加入列表。收到消息时，通过 onmsg 将消息加入消息列表。
 * 3. 撤回消息，或者删除消息对消息列表的影响请参考 message 文件夹下对应的示例代码
 * 4. 用户向上加载会话内容时，通过 loadMoreMsgOfSession 将更多的消息加载到消息列表中
 * 
 * 发送消息时，需要先插入消息。后面在 done 回调覆盖之前插入的消息
 */

import store from '../store'


/**
 * 没有数据库时，根据离线消息/漫游消息获取初始化消息列表
 */
nim = NIM.getInstance({
    appKey: "YOUR_APPKEY",
    account: "YOUR_ACCOUNT",
    token: "YOUR_TOKEN",
    "db": false,
    "debug": true,
    //初始化阶段，接收所有的sessions
    onofflinemsgs: onofflinemsgs,
    //初始化阶段，接收到置顶会话列表
    onroamingmsgs: onroamingmsgs,
    onmsg: onmsg
})

/**
 * 发送消息时，将消息加入队列中。消息发送成功后，再根据 idClient 更新队列
 * 
 * 注意，这里仅展示发送文本消息。其他类型的消息也是同样的处理
 */
function sendText(scene, to, text) {
    const msg = nim.sendText({
        scene,
        to,
        text,
        done: function (err, data) {
            if (!err) {
                // 将发送完成的消息插入队列。
                // addMsgToMsgArr 会用新消息覆盖旧消息
                updateMsgInMsgArr(data)
            }
        }
    })

    // 将正在发送中的消息插入队列
    addMsgToMsgArr(msg)
}

/**
 * 收到消息后，将消息压入消息队列头部
 */
function onmsg(msg) {
    addMsgToMsgArr(msg)
}

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
            if (msgArr[i].idClient = msg.idClient) {
                msgArr[i] = msg
            }
        }
    }
}

/**
 * 根据初始化阶段的漫游消息，构建会话的初始消息队列
 */
function onroamingmsgs(data) {
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
 * 根据初始化阶段的离线消息，构建会话的初始消息队列
 */
function onofflinemsgs(data) {
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
 * 用户向上加载会话列表时，通过该函数拉取更多消息
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
