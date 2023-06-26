/**
 * 当前用户在各个群内的信息获取，同步等
 */

import store from '../store'

nim = NIM.getInstance({
    appKey: "YOUR_APPKEY",
    account: "YOUR_ACCOUNT",
    token: "YOUR_TOKEN",
    debug: true,
    onMyTeamMembers
})

/**
 * 初始化、在线时，以及多端同步时，收到当前用户在各个群内资料的回调函数。
 * 
 * 初始化时收到的是全量数据。
 * 在线时，多端同步时，收到的是更新数据。
 */
function onMyTeamMembers(data) {
    for (const myInfo of data) {
        store.myInfoInEachTeam[myInfo.teamId] = myInfo

        /**
         * 如果已经获取了群成员列表，则在群成员列表基础上更新当前用户的个人资料。
         * 
         * 如果没有获取群成员列表，则根据业务逻辑，根据业务场景去拉取群内所有成员的信息
         * 
         * 如果没有所有群成员列表时，就贸然的设置 teamMembers，会导致后续无法判断群成员是否已经拉取
         */
        if (store.teamMembers[myInfo.teamId]) {
            store.teamMembers[tid][myInfo.account] = myInfo
        }
    }
}


