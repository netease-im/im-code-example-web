/**
 * 如何设置会话免打扰
 * 
 * 单聊免打扰：
 *  - 通过设置静音列表来控制单聊免打扰
 *  - 被静音用户发送的消息，不会通过推送通知给用户
 *  - 用户 UI 层，可以通过静音列表来决定是否渲染会话的未读数
 *  - 静音列表数据有三个变化来源：
 *    - 1. 用户主动设置 nim.user.setMute
 *    - 2. 同步结束后，全量拉取完整数据 nim.user.getMuteList
 *    - 3. 该账号多端同步设置，收到事件通知 nim.on('updateMuteList')
 * 
 * 
 * 群消息免打扰：
 *  - 设置 updateInfoInTeam 的 bitConfigMask 属性来控制群聊免打扰
 *  - 设置 bitConfigMask 为 “1”时，群消息不会推送给用户
 *  - 设置 bitConfigMask 为 “2”时，非管理员的群消息不会推送给用户
 *  - 用户 UI 层根据当前用户在群内的 bitConfigMask 属性决定是否显示未读数
 *  - 静音列表数据有两个变化来源：
 *      - 1. 初始化和多端同步后，通过 nim.on('myTeamMembers') 获取数据
 *      - 2. 用户主动设置 nim.team.updateMyMemberInfo
 */

import store from '../store/index.js'

window.nim = NIM.getInstance(window.LoginParams)

nim.on('updateMuteList', onMuteListUpdate)
nim.on('myTeamMembers', onMyTeamMembers)

await nim.connect()


//======================================== 单聊免打扰 ====================================//

/**
 * 连接后，全量获取静音用户列表
 */
const muteList = await nim.user.getMuteList()
for (let item of muteList) {
    if (item.isMuted) {
        store.muteList.push(item.account)
    }
}

/**
 * 收到多端静音列表变更通知
 */
function onMuteListUpdate(data) {
    debugger
    const idx = store.muteList.indexOf(data.account)
    if (data.isAdd) {
        store.muteList.push(data.account)
    } else {
        store.muteList.splice(idx, 1)
    }
}

/**
 * 设置单聊免打扰
 */
async function setUserMute(account, isAdd) {
    try {
        await nim.user.setMute({
            account,
            isAdd
        })
        const idx = store.muteList.indexOf(account)
        if (isAdd) {
            store.muteList.push(account)
        } else {
            store.muteList.splice(idx, 1)
        }
    } catch (err) {
        console.log('setUserMute error: ', err)
    }
}

//======================================== 群聊免打扰 ====================================//


async function updateInfoInTeam(teamId, bitConfigMask) {
    try {
        nim.team.updateMyMemberInfo({
            /**
             * "0": 开启消息提醒
             * "1"：关闭消息提醒
             * "2"：仅接受管理员的消息提醒
             */
            bitConfigMask: bitConfigMask,
            teamId: teamId
        })

        const myTeamInfo = store.myInfoInEachTeam[teamId]
        /**
         * 设置免打扰模式
         * 
         * 会话列表渲染时，根据群的属性来决定是否渲染未读数
         */
        if (myTeamInfo) {
            myTeamInfo.bitConfigMask = bitConfigMask
        }

    } catch (err) {
        console.log('updateInfoInTeam error: ', err)
    }
}

/**
 * 初始化、多端同步自己在各个群中的设置。根据 store.myInfoInEachTeam[teamId].bitConfigMask 判断当前用户对群组的提醒策略
 * 
 * 0 开启提醒 1 关闭消息提醒 2 只接受管理员的消息的提醒
 */
function onMyTeamMembers(data) {
    for (const member of data) {
        store.myInfoInEachTeam[member.teamId] = member
    }
}

