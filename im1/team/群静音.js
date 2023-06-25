/**
 * 相关概念：
 * 
 * 1. 静音：群管理员设置其它成员是否静音。设置静音后，其它成员无法在群内发言
 * 2. 提醒策略/免打扰：是否接收群消息的提醒。updateInfoInTeam -> muteNotiType。免打扰有两层作用
 *  - 影响是否推送消息提醒
 *  - 业务层根据该字段，决定是否展示，如何展示消息提醒 UI
 * 
 * 免打扰的数据维护请参考 session/会话免打扰.js
 * 
 * 
 * 如何判断是否静音：
 * - 如果群被禁言
 *  - muteType 为 'all'，禁言的对象是包含群主和管理员的所有成员
 *  - muteType 为 'normal', 禁言的对象是除了群主和管理员的所有成员
 * - 如果群未被禁言，则根据个人的禁言状态决定是否禁言, store.teamMembers
 *  - mute 为 true，或者"1", 则当前对象被禁言
 *  - mute 为 false，或者"0"，则当前对象未被禁言
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
    onUpdateTeam: onUpdateTeam,
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
        } else if (teamInfo.muteTeam === 'normal' && myInfoInTeam.type === '0') {
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
