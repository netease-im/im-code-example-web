/**
 * 本例子介绍如何维护会话的顺序。会话的顺序受两个因素影响：
 * 
 * 1. 会话是否置顶。置顶会话应该在所有会话的最上方
 * 2. 会话的更新时间。会话中有新消息到来后，会话的位置应该前移。
 * 
 * 置顶会话设置请调用接口：
 * 
 * - addStickTopSession: https://doc.yunxin.163.com/messaging-enhanced/api-refer/web/typedoc/Latest/zh/NIM/interfaces/src_SessionServiceInterface.SessionServiceInterface.html#addStickTopSession
 * - deleteStickTopSession: https://doc.yunxin.163.com/messaging-enhanced/api-refer/web/typedoc/Latest/zh/NIM/interfaces/src_SessionServiceInterface.SessionServiceInterface.html#deleteStickTopSession
 * 
 * 监听下面回调函数，可以覆盖所有会话需要排序的场景：
 * 
 * 1. session：初始化阶段获取会话列表
 * 3. updateSessions: 会话状态更新时触发，包括置顶状态。触发后，根据置顶属性，以及会话更新时间重排会话
 */


import store from '../store/index.js'

window.nim = NIM.getInstance(window.LoginParams, {
    syncOptions: {
        stickTopSessions: true
    }
})
window.store = store

nim.on('sessions', onSessions)
nim.on('updateSession', onUpdateSession)

nim.connect()

/**
 * 初始化阶段收到会话列表
 */
function onSessions(sessionArr) {
    for (const session of sessionArr) {
        store.sessionMap[session.id] = session
    }
    store.orderedSessions = getOrderedSessions(store.sessionMap)
}

/**
 * 会话更新。更新原因可能包括会话消息更新、或者是否置顶属性更新
 */
function onUpdateSession(session) {
    store.sessionMap[session.id] = session
    store.orderedSessions = getOrderedSessions(store.sessionMap)
}

// 对会话排序
function getOrderedSessions(unorderedSessions) {
    return Object.keys(unorderedSessions)
        .map((id) => unorderedSessions[id])
        .sort(sortSession)
}

/**
 * 排序依据：
 * 1. 是否为置顶会话
 * 2. 根据会话的 updateTime 排序
 */
function sortSession(sessionA, sessionB) {
    const isATop = sessionA.stickTopInfo && sessionA.stickTopInfo.isStickOnTop
    const isBTop = sessionB.stickTopInfo && sessionB.stickTopInfo.isStickOnTop

    if (isATop && !isBTop) {
        return -1
    } else if (!isATop && isBTop) {
        return 1
    } else {
        return sessionB.updateTime - sessionA.updateTime
    }
}
