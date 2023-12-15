
/**
 * - 同步阶段拉取个人资料
 * - 多端同步个人资料更新
 * - 更新个人资料
 */

import store from '../store/index.js'

window.nim = NIM.getInstance(window.LoginParams)
window.store = store

nim.on('syncMyNameCard', onSyncMyNameCard)
nim.on('updateMyNameCard', onUpdateMyNameCard)

await nim.connect()

/**
 * 初始化同步时获取个人资料
 */
function onSyncMyNameCard(profile) {
    store.myProfile = profile
}

/**
 * 多端同步获取个人资料
 */
function onUpdateMyNameCard(profile) {
    store.myProfile = profile
}

/**
 * 更新个人信息完成后，设置个人资料
 */
async function updateMyNameCard(partialProfile) {
    try {
        const res = await nim.user.updateMyNameCard(partialProfile)
        store.myProfile = res
    } catch (err) {
        console.error('updateMyNameCard error', err)
    }
}

/**
 * 设置用户头像：先使用 previewFile 上传头像，然后将 avatar 设置为用户头像
 */
async function setMyAvatar() {
    try {
        const res = await nim.cloudStorage.uploadFile({
            type: "image",
            fileInput: "external-file",
        })

        updateMyNameCard({
            avatar: res.url
        })
    } catch (err) {
        console.error('setMyAvatar error', err)
    }
}