/**
 * 用户 A 将用户 B 加入黑名单后，用户 B 将无法发送消息给用户 A
 * 
 * 下面代码主要解释两个场景：
 * 
 * 1. 如何获取和维护黑名单列表
 * 2. 删除好友时，如果好友在黑名单中，应该将该好友从黑名单中移除。否则下次添加该好友时，好友仍在黑名单中，会影响相互之间通话。
 */

nim = NIM.getInstance({
    appKey: "YOUR_APPKEY",
    account: "YOUR_ACCOUNT",
    token: "YOUR_TOKEN",
    debug: true,
    onblacklist,
    onsyncmarkinblacklist
})

/**
 * 初始化同步时收到的黑名单列表
 */
function onblacklist(data) {
    for (const item of data) {
        store.blackList.push(item.account)
    }
}

/**
 * 多端同步时，收到黑名单变更的通知
 */
function onsyncmarkinblacklist(data) {
    const idx = store.blackList.indexOf(data.account)
    if (data.isAdd && idx === -1) {
        store.blackList.push(data.account)
    } else if (!data.isAdd && idx !== -1) {
        store.blackList.splice(idx, 1)
    }
}

/**
 * 将用户添加至黑名单中
 */
function addToBlacklist(account) {
    nim.addToBlacklist({
        account,
        done: function (err, data) {
            if (!err) {
                const idx = store.blackList.indexOf(account)
                if (idx === -1) {
                    store.blackList.push(account)
                }
            }
        }
    })
}

/**
 * 将用户从黑名单中移除
 */
function removeFromBlacklist(account) {
    nim.removeFromBlacklist({
        account,
        done: function (err, data) {
            if (!err) {
                const idx = store.blackList.indexOf(account)
                if (idx !== -1) {
                    store.blackList.splice(idx, 1)
                }
            }
        }
    })
}

/**
 * 删除好友时，如果好友在黑名单中，应该将其从黑名单中移除。否则再次成为好友后，会因为黑名单原因导致无法发送
 */
function handleDeleteFriend(account) {
    /**
     * 参考: [user/黑名单.js]，将账户从 friendArr 中移除
     */
    const idx = store.friendArr.indexOf(account)
    if (idx !== -1) {
        store.friendArr.splice(idx)
    }

    /**
     * 如果账户在黑名单中，将账户从黑名单列表中也移除
     */
    if (store.blackList.includes(account)) {
        removeFromBlacklist(account)
    }
}