/**
 * 如何设置会话免打扰
 * 
 * 单聊免打扰：
 *  - 通过设置静音列表来控制单聊免打扰
 *  - 被静音用户发送的消息，不会通过推送通知给用户
 *  - 用户 UI 层，可以通过静音列表来决定是否渲染会话的未读数
 *  - 静音列表可以通过 onmutelist， onsyncmarkinmutelist， 以及新增/移除静音列表用户的回调来维护
 * 
 * 群消息免打扰：
 *  - 设置 updateInfoInTeam 的 muteNotiType 属性来控制群聊免打扰
 *  - 设置 muteNotiType 为 “1”时，群消息不会推送给用户
 *  - 设置 muteNotiType 为 “2”时，非管理员的群消息不会推送给用户
 *  - 用户 UI 层根据当前用户在群内的 muteNotiType 属性决定是否显示未读数
 *  - muteNotiType 可以通过 onMyTeamMembers， onMySuperTeamMembers 维护群成员静音属性
 */

import store from '../store'

nim = NIM.getInstance({
    appKey: "YOUR_APPKEY",
    account: "YOUR_ACCOUNT",
    token: "YOUR_TOKEN",
    debug: true,
    onmutelist: onmutelist,
    onsyncmarkinmutelist: onsyncmarkinmutelist,
    /**
     * 初始化；账号多端同步更新时，触发此回调。根据此回调维护账户在每个群内的设置
     */
    onMyTeamMembers: onMyTeamMembers,
    onMySuperTeamMembers: onMySuperTeamMembers
})

/**
 * 初始化时收到静音列表
 */
function onmutelist(mutelist) {
    for (let item of mutelist) {
        if (!store.muteList.includes(item.account)) {
            store.muteList.push(item.account)
        }
    }
}

/**
 * 收到多端同步设置的静音列表
 */
function onsyncmarkinmutelist(obj) {
    const idx = store.muteList.indexOf(obj.account)

    if (obj.isAdd) {
        if (idx === -1) {
            store.muteList.push(obj.account)
        }
    } else {
        if (idx !== -1) {
            store.muteList.splice(idx, 1)
        }
    }
}

/**
 * 添加静音成员
 */
function addToMutelist(account) {
    nim.addToMutelist({
        account: account,
        done: function (err, obj) {
            if (!err) {
                const idx = store.muteList.indexOf(account)
                if (idx === -1) {
                    store.muteList.push(obj.account)
                }
            }
        }
    })
}

/**
 * 移除静音成员
 */
function removeFromMuteList(account) {
    nim.removeFromMutelist({
        account: account,
        done: function (err, obj) {
            if (!err) {
                const idx = store.muteList.indexOf(account)
                if (idx !== -1) {
                    store.muteList.splice(idx, 1)
                }
            }
        }
    })
}


//======================================== 上面是单聊免打扰 ====================================//
//======================================== 下面是群聊免打扰 ====================================//


function updateInfoInTeam(muteNotiType, teamId) {
    nim.updateInfoInTeam({
        /**
         * "0": 开启消息提醒
         * "1"：关闭消息提醒
         * "2"：仅接受管理员的消息提醒
         */
        muteNotiType: muteNotiType,
        teamId: teamId,
        done: function (err, data) {
            if (!err) {
                const myTeamInfo = store.myTeamInfos[teamId]
                /**
                 * 设置免打扰模式
                 * 
                 * 会话列表渲染时，根据群的属性来决定是否渲染未读数
                 */
                if (myTeamInfo) {
                    myTeamInfo.muteNotiType = muteNotiType
                }
            }
        }
    })
}

function onMyTeamMembers(data) {
    for (const member of data) {
        store.myTeamInfos[member.teamId] = member

        const teamMembers = store.teamMembers[member.teamId]
        if (teamMembers) {
            for (let i = 0; i < teamMembers.length; i++) {
                if (teamMembers[i].account === member.account) {
                    teamMembers[i] = member
                }
            }
        }
    }
}

function onMySuperTeamMembers(data) {
    for (const member of data) {
        store.mySuperTeamInfos[member.teamId] = member

        const superTeamMembers = store.superTeamMembers[member.teamId]
        if (superTeamMembers) {
            for (let i = 0; i < superTeamMembers.length; i++) {
                if (superTeamMembers[i].account === member.account) {
                    superTeamMembers[i] = member
                }
            }
        }
    }
}