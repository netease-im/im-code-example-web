/**
 * 注意，静音有一些相互容易混淆的概念，下面做一些额外的说明：
 * 1. 群静音：群管理员设置群内所有成员能否发言。适用于会议主持场景 (muteTeamAll)
 * 2. 群成员静音：设置个别群成员能否发言。适用于关闭个别成员发言群里 (updateMuteStateInTeam)
 * 3. 群消息免打扰：设置当前用户是否接收群消息推送，以及UI上可以根据这个设置决定是否显示消息提醒。请参考 [session/会话免打扰.js]
 * 4. p2p黑名单：设置两两之间关系黑名单。设置后，被拉黑用户无法发送消息给你
 * 5. p2p静音：类似于群消息免打扰。设置后，另一个用户可以发送消息，但是不会触发消息推送，且业务层可以根据这个状态，决定是否设置消息提醒。请参考 [session/会话免打扰.js]
 * 
 * 
 * 如何判断是否静音：
 * - 如果群被禁言
 *  - muteType 为 'all'，禁言的对象是包含群主和管理员的所有成员
 *  - muteType 为 'normal', 禁言的对象是除了群主和管理员的所有成员
 * - 如果群未被禁言，则根据个人的禁言状态决定是否禁言, store.teamMembers
 *  - mute 为 true, 则当前对象被禁言
 *  - mute 为 false，则当前对象未被禁言
 * 
 * 
 * UI建议：
 *  - 根据 store.teams 的 mute 属性，在群名片上渲染静音按钮
 *  - 根据 store.teamMembers 的 mute 属性，在群内个人名片上渲染静音按钮
 */

import store from '../store'

nim = NIM.getInstance({
    appKey: "YOUR_APPKEY",
    account: "YOUR_ACCOUNT",
    token: "YOUR_TOKEN",
    debug: true,
    /**
     * 群静音时收到此回调
     */
    onUpdateTeam: onUpdateTeam,
    /**
     * 群成员静音时收到此回调
     */
    onUpdateTeamMembersMute: onUpdateTeamMembersMute
})



/**
 * 查询账户能否在群中发言
 */
function canISendText(tid) {
    const teamInfo = store.teams[tid]
    const myInfoInTeam = store.myInfoInEachTeam[tid]

    if (teamInfo.mute === true) {
        /**
         * 群被禁言
         */
        if (teamInfo.muteType === 'all') {
            /**
             * 所有群成员被禁言
             */
            return false
        } else if (teamInfo.muteTeam === 'normal' && myInfoInTeam.type === "normal") {
            /**
             * 普通成员被禁言。当前账户是普通群成员
             */
            return false
        }
    }

    // 当前账户在群内未被禁言
    return myInfoInTeam.mute === false
}

/**
 * 调用后，所有在线群用户触发 onUpdateTeam。根据这个回调函数，可以更新 群的 禁言设置
 */
function muteTeamAll(teamId, mute) {
    nim.muteTeamAll({
        mute,
        teamId,
        done: function (err, data) {
            if (!err) {
                console.log('更新成功')
            }
        }
    })
}

/**
 * 调用后，所有在线群用户触发 onUpdateTeamMembersMute。根据这个回调函数，可以更新 群成员的 禁言设置
 */
function updateMuteStateInTeam(teamId, mute, account) {
    nim.updateMuteStateInTeam({
        teamId,
        mute,
        account,
        done: function (err, data) {
            if (!err) {
                console.log('更新成功')
            }
        }
    })
}

/**
 * 群静音属性更新后，所有用户会收到这个回调
 */
function onUpdateTeam(partialTeamInfo) {
    const tid = partialTeamInfo.teamId
    if (!store.teams[tid]) {
        getTeam(tid)
    } else {
        store.teams[tid] = {
            ...store.teams[tid],
            ...partialTeamInfo
        }
    }
}

/**
 * 获取群的整体信息
 */
function getTeam(tid) {
    nim.getTeam({
        teamId: tid,
        sync: true,
        done: function (err, teamInfo) {
            if (!err) {
                store.teams[tid] = teamInfo
            }
        }
    })
}

/**
 * 群管理员更新部分人的静音属性后，所有人都会收到此回调函数
 * 
 * 根据这个回调函数，设置群成员的属性(store.teamMembers)，以及当前用户的群属性 (store.myInfoInEachTeam)
 */
function onUpdateTeamMembersMute(data) {
    const tid = data.team.teamId
    store.teams[tid] = data.team

    const teamMembers = store.teamMembers[tid]
    const myInfoInTeam = store.myInfoInEachTeam[tid]
    /**
     * 如果已经获取过群成员，则更新群成员的具体属性
     * 
     * 如果从来没有获取过群成员，则等待需要获取群成员的时机到来之后，随着获取群成员的接口一并更新。比如等用户点击群成员列表时，或者用户点击进入群会话时
     */
    for (const updateMember of data.members) {
        if (teamMembers && teamMembers[updateMember.account]) {
            teamMembers[updateMember.account] = {
                ...teamMembers[updateMember.account],
                updateMember
            }
        }

        if (currentUserAccount === updateMember.account) {
            /**
             * 更新本人的群属性
             */
            myInfoInTeam = {
                ...myInfoInTeam,
                ...updateMember
            }
        }
    }
}
