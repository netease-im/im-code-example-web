/**
 * 该文件展示 如何获取群聊的已读回执。注意，群聊发送消息时，必须设置 teamSpecializationInfo.needACK: true
 * 
 * 群聊已读回执在初始化阶段并不会自动同步。开发者应该在用户进入对应的消息浏览界面时，调用：
 * 
 * 1. queryMsgReceiveInfoInBatch: 批量查询群聊已读回执简要（拉取多条消息已读数量+被读数量）
 * 2. queryMsgReceiveInfoDetail: 用户点击已读回执详情时，调用该函数获取已读用户详细名单
 * 
 * 同时监听：onTeamMsgReceipt。这样能够在有新的消息时，保持已读回执简要的更新
 */
import store from '../store/index.js'

nim = NIM.getInstance(window.LoginParams)
nim.on('teamMsgReceipts', onTeamMsgReceipt)
await nim.connect()

/**
 * 发送消息
 */
function sendText(teamId, text) {
    nim.msg.sendTextMsg({
        scene: 'team',
        to: teamId,
        body: text,
        /**
         * 必须要设置 teamSpecializationInfo.needACK 才能够接收群消息的已读回执
         */
        teamSpecializationInfo: {
            needACK: true
        }
    })
}

/**
 * 接收方发送已读回执
 */
function sendMsgReceipt(msg) {
    nim.msg.sendTeamMsgReceipt({
        teamMsgReceipts: [{
            teamId: msg.to,
            idClient: msg.idClient,
            idServer: msg.idServer
        }]
    })
}


/**
 * 收到群已读回执通知后，更新消息的 msgReceiptInfo。该属性包含了已读数、未读数、已读用户列表
 * 
 * data: Array<{
 *   account,
 *   idClient,
 *   idServer,
 *   read,
 *   unread,
 *   teamId,
 * }>
 */
function onTeamMsgReceipt(dataArr) {
    for (let entry of dataArr) {
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
    const readList = msg.msgReceiptInfo?.readList || []
    readList.push(data.account)

    msg.msgReceiptInfo = {
        unread: parseInt(data.unread),
        read: parseInt(data.read),
        readList
    }
}


/**
 * 用户点击UI，查看详细的已读列表时，调用下面的函数查看已读详情
 */
async function queryMsgReceiveInfoDetail(options) {
    const msg = getMsg(options.to, options.idClient)

    /**
     * 如果消息不存在，或者消息的 readList已经查询完毕，则无需查询
     */
    if (msg && !(msg.msgReceiptInfo && msg.msgReceiptInfo.readList !== null)) {
        try {
            const result = await nim.msg.getTeamMsgReadAccounts({
                teamMsgReceipt: {
                    teamId: options.to,
                    idServer: options.idServer,
                    idClient: options.idClient
                }
            })
            msg.msgReceiptInfo = {
                unread: result.unreadAccounts.length,
                read: result.readAccounts.length,
                readList: result.readAccounts.slice()
            }
        } catch (err) {
            console.error('获取群已读回执列表失败', err)
        }
    }
}

/**
 * 批量查询群消息已读回执记录
 */
async function queryMsgReceiveInfoInBatch(msgArr) {
    /**
     * 先过滤掉 store.sessionMsgs 中不存在的消息
     */
    msgArr = msgArr.filter(options => {
        const msg = getMsg(options.to, options.idClient)
        return msg
    })

    try {
        const resArr = await nim.msg.getTeamMsgReads({
            teamMsgReceipts: msgArr.map(options => {
                return {
                    teamId: options.to,
                    idServer: options.idServer,
                    idClient: options.idClient
                }
            })
        })

        for (let entry of resArr) {
            const msg = getMsg(entry.teamId, entry.idClient)
            if (msg) {
                msg.msgReceiptInfo.unread = parseInt(entry.unread)
                msg.msgReceiptInfo.read = parseInt(entry.read)
            }
        }
    } catch (err) {
        console.error('批量查询群消息已读回执记录失败', err)
    }
}