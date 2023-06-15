import { getSessionIdFromMsg } from "../util"
import store from '../store'

nim = NIM.getInstance({
    appKey: "YOUR_APPKEY",
    account: "YOUR_ACCOUNT",
    token: "YOUR_TOKEN",
    debug: true,
    // 系统消息通知
    onsysmsg: onsysmsg
})


/**
 * 其它端撤回消息
 */
function onsysmsg(data) {
    if (data.type === 'deleteMsg') {
        removeMsgFromMsgArr(data.msg)
        const hintMsg = generateHintMsg({
            msg: data.msg,
            editable: false
        })
        addHintMsgIntoArr(hintMsg)
    }
}

/**
 * 该示例代码展示如何撤回消息，以及如何点击再次编辑等等。还有其它端收到撤回消息后，需要做相似的处理
 * 
 * 1. 撤回消息后，当前客户端需要插入一条 【你撤回了一条消息 重新编辑】的信息
 * 2. 其他用户，以及当前用户的多端同步账号，收到系统通知后，需要插入一条【你撤回了一条消息】的信息
 * 3. 当前客户端，以及其他客户，都需要将被撤回的消息从消息队列中删除
 */
function recallMsg(msg) {
    nim.recallMsg({
        msg: msg,
        done: function (err, data) {
            if (err) {
                console.error('撤回失败')
            } else {
                // 被撤回消息从队列中移除
                removeMsgFromMsgArr(msg)
                const hintMsg = generateHintMsg({
                    msg,
                    editable: true
                })
                addHintMsgIntoArr(hintMsg)
            }
        }
    })
}

/**
 * 在会话的消息队列中，将撤回的消息删除
 */
function removeMsgFromMsgArr(msg) {
    const sessionId = getSessionIdFromMsg(msg, currentUserAccount)
    const item = store.sessionMsgs[sessionId]

    if (!item) return
    item.msgArr = item.msgArr.filter(_ => {
        return msg.idClient !== _.idClient
    })
}

/**
 * 生成提示信息。如果用户点击 “再次编辑” 按钮，需要做下面的事情：
 * 
 * 1. 编辑窗口还原 之前 发送的消息内容
 */
function generateHintMsg(options) {
    const { msg, editable } = options
    return {
        /**
         * 渲染层根据 msg.type 调整渲染方式
         */
        type: 'recallHint',
        idClient: 'reply-' + msg.idClient,
        attach: msg,
        editable,
        time: Date.now(),
        userUpdateTime: Date.now(),
        status: 'success',
        from: msg.from,
        to: msg.to
    }
}

/**
 * 将【你撤销了一条消息】压入到消息队列中
 */
function addHintMsgIntoArr(hintMsg) {
    const sessionId = getSessionIdFromMsg(hintMsg.attach, currentUserAccount)
    const item = store.sessionMsgs[sessionId]

    if (!item) return
    item.msgArr.unshift(hintMsg)
}