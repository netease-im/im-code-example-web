import { getSessionIdFromMsg } from "../util/index.js"
import store from '../store/index.js'

let currentUserAccount = 'zk1'

window.nim = NIM.getInstance(window.LoginParams)

window.nim.on('sysMsg', onSystemMessage)

window.nim.connect()

/**
 * 一： 其它人撤回消息。将被撤回消息从消息队列中删除，替换为提示消息
 */
function onSystemMessage(sysMsg) {
    /**
     * sysMsg 结构示例
     * 
     * {
     *  "time": 1701418586849,
     *  "type": "recallMsgP2p",
     *  "to": "zk1",
     *  "from": "zk5",
     *  "content": "撤回了一条消息",
     *  "idServer": "222531435",
     *  "callbackExt": "callbackext123",
     *  "pushInfo": {
     *      "needPushBadge": true
     *  },
     *  "recallMessageInfo": {
     *      "idClient": "81ccff6de062d4ee43ec4df04c7cdc00",
     *      "idServer": "203754770",
     *      "createTime": 1701418579029,
     *      "fromNick": "zk33"
     *  },
     *  "feature": "default"
     * }
     */
    if (sysMsg.type === 'recallMsgP2p' || sysMsg.type === 'recallMsgTeam' || sysMsg.type === 'recallMsgSuperTeam') {
        const hintMsg = generateHintMsg({
            from: sysMsg.from,
            to: sysMsg.to,
            idClient: sysMsg.recallMessageInfo.idClient,
            recalledMsg: sysMsg.recallMessageInfo,
            editable: false
        })
        replaceRecallMsgWithHintMsg({
            from: sysMsg.from,
            to: sysMsg.to,
            idClient: sysMsg.recallMessageInfo.idClient,
            scene: sysMsg.type === 'recallMsgP2p' ? 'p2p' : (sysMsg.type === 'recallMsgTeam' ? 'team' : 'superTeam')
        }, hintMsg)
    }
}

/**
 * 生成提示信息。如果用户点击 “再次编辑” 按钮，需要做下面的事情：
 * 
 * 1. 编辑窗口还原 之前 发送的消息内容
 */
function generateHintMsg(options) {
    const { from, to, idClient, recalledMsg, editable } = options
    return {
        /**
         * 渲染层根据 msg.type 调整渲染方式
         */
        type: 'recallHint',
        idClient: 'reply-' + idClient,
        attach: recalledMsg,
        editable,
        time: Date.now(),
        userUpdateTime: Date.now(),
        status: 'success',
        from: from,
        to: to
    }
}

/**
 * 用提示消息替换当前消息队列里的消息。用户根据 hintMsg 来展示 UI
 * 
 * msg: from, to, idClient, scene
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


/**
 * 二：当前客户端撤回消息
 * 
 * 该示例代码展示如何撤回消息，以及如何点击再次编辑等等。还有其它端收到撤回消息后，需要做相似的处理
 * 
 * 1. 撤回消息后，当前客户端需要插入一条 [你撤回了一条消息 重新编辑]的信息
 * 2. 其他用户，以及当前用户的多端同步账号，收到系统通知后，需要插入一条[你撤回了一条消息]的信息
 * 3. 当前客户端，以及其他客户，都需要将被撤回的消息从消息队列中删除
 */
async function recallMsg(msg) {
    try {
        await nim.msg.recallMsg({
            msg: msg
        })
        // 被撤回消息从队列中移除
        const hintMsg = generateHintMsg({
            from: msg.from,
            to: msg.to,
            idClient: msg.idClient,
            recalledMsg: msg,
            editable: true
        })
        replaceRecallMsgWithHintMsg(msg, hintMsg)
    } catch (err) {
        console.error('撤回失败. err: ', err)
    }
}