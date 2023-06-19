
/**
 * - 同步阶段拉取个人资料
 * - 多端同步个人资料更新
 * - 更新个人资料
 */

import store from '../store'

nim = NIM.getInstance({
    appKey: "YOUR_APPKEY",
    account: "YOUR_ACCOUNT",
    token: "YOUR_TOKEN",
    debug: true,
    onmyinfo: onmyinfo,
    onupdatemyinfo: onupdatemyinfo
})

/**
 * 初始化同步时获取个人资料
 */
function onmyinfo(profile) {
    store.myProfile = profile
}

/**
 * 多端同步获取个人资料
 */
function onupdatemyinfo(profile) {
    store.myProfile = profile
}

/**
 * 更新个人信息完成后，设置个人资料
 */
function updateMyInfo(partialProfile) {
    nim.updateMyInfo({
        ...partialProfile,
        done: function(err, profile) {
            if (!err) {
                store.myProfile = profile
            }
        }
    })
}


