/**
 * 删除会话，以及会话的内容。
 * 
 * 1. 删除后，之前的会话内容无法通过漫游消息、历史消息等接口查询到。
 * 2. store 中，和该会话有关联的内容需要删除
 * 3. 多端同步时，其他端也要删除该会话内容(可以根据你的业务场景自行选择)
 * 
 * clearServerHistoryMsgsWithSync 会删除服务器漫游消息，历史消息，以及本地数据库中的消息。本地数据库中的会话记录你可以根据业务场景选择是否删除。
 * 
 * 多端同步收到清空服务器历史消息时，也会删除本地数据库中对应的消息。
 */

import store from '../store/index.js'

window.nim = NIM.getInstance(window.LoginParams)
window.store = store

// 收到清空会话事件通知
nim.on('sessions', syncSessions)
nim.on('clearServerHistoryMsgs', onClearServerHistoryMsgs)

await nim.connect()

/**
 * 初始化同步获取会话列表后，更新会话对应的用户信息
 * 
 * 注意，这个回调其它的作用，比如会话列表的生成，会话列表的排序请参考其他的示例代码。这段代码仅展示如何获取会话的基本信息
 */
function syncSessions(sessions) {
    sessions.forEach((session) => {
        store.sessionMap[session.id] = session
    })
}



async function deleteSession(session, isSyncSelf) {
    const { scene, to } = session

    try {
        await nim.msgLog.clearHistoryMsgsFromServer({
            /**
             * 是否需要多端同步。
             * 
             * 如果你需要在本地删除的同时，也在其他端删除，则应该选择 true
             * 如果你仅需要在本地删除，则应该选择 false
             */
            isSyncSelf: isSyncSelf,
            scene: scene,
            to: to
        })

        /**
         * 从 store 中，将会话相关记录删除
         */
        removeSessionFromStore(session.id)
    } catch (err) {
        console.error('从服务端删除会话失败')
    }
}

/**
 * 从 store 中移除该 session
 */
function removeSessionFromStore(sessionId) {
    delete store.sessionMsgs[sessionId]
    delete store.sessionMap[sessionId]

    for (let i = 0; i < store.orderedSessions.length; i++) {
        if (store.orderedSessions[i].id === sessionId) {
            store.orderedSessions.splice(i, 1)
            break
        }
    }
}

function onClearServerHistoryMsgs(dataArr) {
    debugger
    for (let data of dataArr) {
        const session = store.sessionMsgs[data.sessionId]

        // 剔除会话中时间早于data.time的消息。这些消息已经从历史消息中删除
        if (session) {
            session.msgArr = session.msgArr.filter((msg) => {
                return msg.time > data.time
            })

            if (session.msgArr.length === 0) {
                /**
                 * 根据业务场景决定是否需要从会话列表中删除该会话
                 */
                removeSessionFromStore(data.sessionId)
            }
        }
    }
}