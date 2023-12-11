/**
 * 1. 如何决定消息是否计入未读数
 * 2. 通知消息是否计入未读数
 * 3. 如何设置会话未读数
 */
import store from '../store/index.js'

window.nim = NIM.getInstance(window.LoginParams, {
    syncOptions: {
        /**
         * 初始化阶段，是否要同步会话未读数
         */
        sessionAck: true
    },
    sessionConfig: {
        lastMessageFilterFn: (msg) => {
            /**
             * 所有消息都可以计入会话的最后一条消息。
             * 
             * 也就是在展示会话列表时，所有消息都可以在列表中展示为会话的最新消息
             * 
             * 该函数默认返回 true
             */
            return true
        },
        unreadCountFilterFn: (msg) => {
            /**
             * 通知类消息不要计入未读数，其它消息计入未读数
             * 
             * 用户应该根据自己的业务逻辑来设置此回调函数。
             * 
             * 该函数默认返回 true
             */
            return msg.type !== 'notification'
        }
    }
})
window.store = store

nim.on('updateSession', onUpdateSession)

await nim.connect()

nim = NIM.getInstance({
    /**
     * 是否需要将通知类型的消息计入未读数。默认为返回 false。
     * 
     * 通知类型的消息包括：群信息变更；拉人入群；移除群成员，等等，具体请查看 https://doc.yunxin.163.com/messaging/api-refer/web/typedoc/Latest/zh/NIM/interfaces/nim_types.NIMGetInstanceOptions.html#onmsg
     */
    shouldCountNotifyUnread: function (msg) {
        return false
    },
    /**
     * 通知类型消息是否需要触发 onupdatesessions，以及 onmsgs 回调。默认为返回 false，表示不忽略，即需要触发该回调
     * 
     * 触发后，会话的 lastMsg 变更为 通知类型消息。你的会话列表显示的最后一条消息为群通知消息
     */
    shouldIgnoreNotification: function (msg) {
        return false
    }
})


/**
 * 会话更新。sessionArr中的 unread 属性为会话的未读数
 */
function onUpdateSession(session) {
    store.sessionMap[session.id] = session
    store.orderedSessions = getOrderedSessions(store.sessionMap)
}

/**
 * 退出会话后，调用该接口取消设置当前会话。这样，有新消息到来时，会话未读数会更新
 */
function resetCurrSession(session) {
    nim.session.resetSessionUnreadCount({ id: session.id })
}
