/**
 * 撤回消息的一些说明：
 * 1. 撤回消息后，会话其它参与方会收到系统通知 （type === 'deleteMsg')
 * 2. 初始化后，会话参与方会收到 onroamingsysmsgs，或者 onofflinesysmsgs 系统通知。这两个系统通知可以忽略。因为无论是通过本地数据库，还是拉云端历史消息，都找不到被撤回的消息
 * 3. onupdatesessions 的 lastMsg 会被置于 null
 * 
 * 下面分场景说下撤回消息的处理方式
 * - 撤回消息发起方：
 *  1. 从队列中删除撤回的消息，并在原消息位置插入一条点击编辑的提示：你撤回了一条消息  <span>重新编辑</span>
 * - 撤回消息系统消息接收方（包括多端同步，以及会话里其它用户）:
 *  1. 从队列中删除撤回的消息，并在原消息位置插入撤回提示：xxx撤回了一条消息
 *  2. 如果队列中找不到需要被撤回的消息，则不用处理这条系统消息（后续无论通过本地数据库，还是拉云端历史消息，被撤回的消息都无法被拉到，所以不用担心后续会显示这条消息）
 * - 初始化阶段：参考 [message/消息队列维护.js]。不需要对于被撤回的消息进行额外处理
 */

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
        const hintMsg = generateHintMsg({
            msg: data.msg,
            editable: false
        })
        replaceRecallMsgWithHintMsg(data.msg, hintMsg)
    }
}

/**
 * 该示例代码展示如何撤回消息，以及如何点击再次编辑等等。还有其它端收到撤回消息后，需要做相似的处理
 * 
 * 1. 撤回消息后，当前客户端需要插入一条 [你撤回了一条消息 重新编辑]的信息
 * 2. 其他用户，以及当前用户的多端同步账号，收到系统通知后，需要插入一条[你撤回了一条消息]的信息
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
                const hintMsg = generateHintMsg({
                    msg,
                    editable: true
                })
                replaceRecallMsgWithHintMsg(msg, hintMsg)
            }
        }
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
 * 用提示消息替换当前消息队列里的消息
 */
function replaceRecallMsgWithHintMsg(msg, hintMsg) {
    const sessionId = getSessionIdFromMsg(msg, currentUserAccount)
    const item = store.sessionMsgs[sessionId]

    if (!item) return

    for (let i = 0; i < item.msgArr.length; i++) {
        if (item.msgArr[i].idClient === msg.idClient) {
            /**
             * 用提示消息代替原消息
             */
            item.msgArr[i] = hintMsg
            break
        }
    }
}