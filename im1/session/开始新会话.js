/**
 * 该示例展示如何在点击用户名片，或者群组名片后，生成会话数据
 */
import store from '../store'

/**
 * 生成一个空的单聊对话
 */
function createP2pSession(account) {
    const sessionId = `p2p-${account}`
    if (!store.sessionMap[sessionId]) {
        store.sessionMap[sessionId] = {
            id: sessionId,
            scene: 'p2p',
            to: account,
            unread: 0,
            updateTime: Date.now(),
            lastMsg: null
        }
    }

    return store.sessionMap[sessionId]
}

/**
 * 生成一个空的群聊对话
 */
function createTeamSession(teamId, isSuperTeam) {
    const sessionId = `${isSuperTeam ? 'superTeam' : 'team'}-${account}`
    if (!store.sessionMap[sessionId]) {
        store.sessionMap[sessionId] = {
            id: sessionId,
            scene: isSuperTeam ? 'superTeam' : 'team',
            to: teamId,
            unread: 0,
            updateTime: Date.now(),
            lastMsg: null
        }
    }

    return store.sessionMap[sessionId]
}