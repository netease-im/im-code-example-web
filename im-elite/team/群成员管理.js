/**
 * 该文件主要解释如何创建群、解散群，加入群，离开群。并解释如何围绕着群成员的变化，维护群成员列表
 * 
 * - 创建群。创建者收到 onCreateTeam 回调。其它初始群成员收到 onAddTeamMembers 回调
 * - 新成员入群。群内成员收到 onAddTeamMembers 回调。根据该回调添加群成员
 * - 
 */

import store from '../store/index.js'

window.nim = NIM.getInstance(window.LoginParams)
window.store = store

const currentUserAccount = 'zk1'

nim.on('teams', onSyncTeams)
// 多端同步收到创建群的消息
nim.on('createTeam', onCreateTeam)
nim.on('addTeamMembers', onAddTeamMembers)
nim.on('removeTeamMembers', onRemoveTeamMembers)
nim.on('dismissTeam', onDismissTeam)
nim.on('leaveTeam', handleLeaveTeam)
await nim.connect()


/**
 * 初始化后，收到群信息的回调函数
 */
function onSyncTeams(teams) {
    for (const t of teams) {
        store.teams[t.teamId] = t;
    }
}

/**
 * 群创建者收到 onCreateTeam 的回调函数(即包括创建发起端，也包括发起者多端同步账户)
 * 
 * 收到群创建消息后，可以调用 getTeamMembers，拉取群组成员
 */
function onCreateTeam(team) {
    const tid = team.teamId
    store.teams[tid] = team

    getTeamMembers(tid)
}

/**
 * 收到群成员新增的通知
 */
function onAddTeamMembers(data) {
    const tid = data.team.teamId
    store.teams[tid] = data.team

    if (!store.teamMembers[tid]) {
        /**
         * 全量获取群成员列表
         */
        getTeamMembers(tid)
    } else {
        /**
         * 根据回调函数，更新群成员列表
         */
        for (let newMember of data.members) {
            store.teamMembers[tid][newMember.account] = newMember

            /**
             * 更新当前用户在群内的状态
             */
            if (newMember === currentUserAccount) {
                store.myInfoInEachTeam[tid] = newMember
            }
        }
    }
}

/**
 * 移除群组成员
 */
function onRemoveTeamMembers(data) {
    const tid = data.team.teamId

    /**
     * 如果用户被踢出，则删去该群相关信息
     */
    for (let removedAccId of data.accounts) {
        if (removedAccId === currentUserAccount) {
            return handleLeaveTeam(tid, false)
        }
    }

    if (!store.teamMembers[tid]) {
        /**
         * 全量获取群成员列表
         */
        getTeamMembers(tid)
    } else {
        for (let removedAccId of data.accounts) {
            if (store.teamMembers[tid]) {
                delete store.teamMembers[tid][removedAccId]
            }
        }
    }
}

/**
 * 群解散了，删除群相关数据
 */
function onDismissTeam(data) {
    const tid = data.teamId
    handleLeaveTeam(tid, true)
}

/**
 * 获取群内所有成员信息。
 * 
 * 常用于：
 * - 用户点击群名品，查看群成员名单时
 * - 用户点击群对话时
 * - 群成员列表变化时
 * - 群创建时
 * 
 * 1，2是常见的，需要获取群成员列表的场景。
 * 3，4是群相关数据变动时获取。一般来说，当群的数据变动时，说明该群较为活跃。此时，不妨把群信息的获取时间早于1，2发生时。
 */
async function getTeamMembers(tid) {
    try {
        const teamMembers = await nim.team.getTeamMembers({
            teamId: tid
        })
        store.teamMembers[tid] = {}

        for (const member of teamMembers) {
            store.teamMembers[tid][member.account] = member
            if (member.account === currentUserAccount) {
                /**
                 * 更新当前用户在群内的状态
                 */
                store.myInfoInEachTeam[tid] = member
            }
        }
    } catch (err) {
        console.error('getTeamMembers 失败', err)
    }
}

/**
 * 移除群信息，群会话信息，会话中的消息。
 * 
 * 可以根据业务选择是否删除 服务器 + 数据库 中该会话的消息记录
 * 
 * 如果群解散了，则删除服务器 + 数据库中该会话的消息记录
 */
function handleLeaveTeam(tid) {
    // 本人被移除出群，将群从本地记录中删除
    delete store.teams[tid]
    delete store.myInfoInEachTeam[tid]
    delete store.teamMembers[tid]
    const sessionId = `team-${tid}`
    delete store.sessionMsgs[sessionId]
    delete store.sessionMap[sessionId]

    for (let i = store.orderedSessions.length - 1; i >= 0; i--) {
        if (store.orderedSessions[i].id === sessionId) {
            store.orderedSessions.splice(i, 1)
            break
        }
    }
}