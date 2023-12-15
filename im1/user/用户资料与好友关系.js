/**
 * 用户资料即为其它用户的个人资料，包括昵称、头像等信息。用户资料包括好友资料与非好友资料。
 * 
 * - 初始化同步时得到好友资料。这是用户资料的一部分。其余的用户资料一般根据会话需要加载
 * - 在线阶段，收到消息时，可能会触发用户资料变更通知。这部分通知包括好友资料与非好友资料
 * - 收到会话变化的回调后，会话的另一方用户资料缺失时，可以主动调用 nim.getUser 获取用户资料。详情请参考 [session/会话头像与名称]
 * 
 * 
 *  在处理好友相关接口时，我们一般需要从三个角度考虑：
 *  - 动作发起者
 *  - 当前账户其它端
 *  - 接收方的系统通知
 * 
 *  有以下好友相关接口需要考虑：
 * - 更新好友
 * - 直接添加好友
 * - 申请好友
 * - 通过好友申请
 * - 删除好友
 * 
 * 删除好友时，用户资料无需更新。好友关系可以跟随删除好友更新，具体请参考 (user/好友关系.js)
 */

import store from '../store'

nim = NIM.getInstance({
    appKey: "YOUR_APPKEY",
    account: "YOUR_ACCOUNT",
    token: "YOUR_TOKEN",
    debug: true,
    onfriends: onfriends,
    onusers: onusers,
    onupdateuser: onupdateuser,
    onsysmsg: onsysmsg,
    onsyncfriendaction: onsyncfriendaction
})

function onfriends(data) {
    store.friendArr = data.filter(item => item.valid).map(data => data.account)
}

/**
 * 初始化阶段收到好友用户资料的回调函数
 */
function onusers(data) {
    for (let profile of data) {
        store.userProfiles[profile.account] = profile
    }
}

/**
 * 在线阶段收到其它用户资料变更的通知。profile 既可以是好友的用户资料，也可以是非好友的用户资料
 */
function onupdateuser(profile) {
    store.userProfiles[profile.account] = profile
}

/**
 * 更新好友的备注信息
 */
function updateFriend(account, alias) {
    nim.updateFriend({
        account,
        alias,
        done: function (err, data) {
            if (!err) {
                store.userProfiles[account].alias = alias
            }
        }
    })
}

/**
 * 添加好友后，将返回数据中，好友的信息设置到 store.userProfiles 中
 */
function addFriend(account) {
    nim.addFriend({
        account,
        done: function (err, data) {
            if (!err) {
                handleAddFriend(data.friend)
            }
        }
    })
}

/**
 * 删除好友
 */
function deleteFriend(account) {
    nim.deleteFriend({
        account,
        done: function (err, data) {
            if (!err) {
                handleDeleteFriend(account)
            }
        }
    })
}


/**
 * 通过好友申请后，将返回数据中，好友的信息设置到 store.userProfiles 中
 */
function passFriendApply(account, idServer) {
    nim.passFriendApply({
        account: account,
        ps: "",
        idServer: idServer,
        done: function (err, data) {
            if (!err) {
                handleAddFriend(data.friend)
            }
        }
    })
}

/**
 * 收到多端同步通知
 */
function onsyncfriendaction(options) {
    const friend = options.friend
    const account = options.account

    switch (options.type) {
        /**
         * 当前账户在其它端同步更新好友昵称
         */
        case 'updateFriend':
            store.userProfiles[account] = friend
            break
        /**
         * 当前账户在其它端同步新增好友
         */
        case 'addFriend':
        /**
         * 当前账户在其它端同意好友申请
         */
        case 'passFriendApply':
            handleAddFriend(friend)
            break
        /**
         * 当前客户在其它端删除好友
         */
        case 'deleteFriend':
            handleDeleteFriend(account)
            break
    }
}

/**
 * 获取 p2p 会话对应的 user 信息。
 */
function fetchUserInfo(account) {
    nim.getUser({
        account,
        sync: true,
        done: function (err, user) {
            if (err) {
                console.error("获取用户信息失败", err);
            } else {
                store.userProfiles[user.account] = user;
            }
        },
    });
}


function onsysmsg(options) {
    switch (options.type) {
        /**
         * 收到其他人添加自己为好友的系统通知
         */
        case 'addFriend':
        /**
         * 通过好友申请
         */
        case 'passFriendApply':
            handleAddFriend(options.friend)
            break
        /**
         * 被另一端删除
         */
        case 'deleteFriend':
            handleDeleteFriend(options.from)
            break
        case 'applyFriend':
            /**
             * 收到好友申请时，应该拉取申请方的个人资料
             */
            const userCard = store.userProfiles[options.from]
            if (!userCard) {
                fetchUserInfo(options.from)
            }
            break
    }
}

function handleDeleteFriend(account) {
    const idx = store.friendArr.indexOf(account)
    if (idx !== -1) {
        store.friendArr.splice(idx, 1)
    }
}

function handleAddFriend(friendProfile) {
    store.userProfiles[friendProfile.account] = friendProfile
    if (!store.friendArr.includes(friendProfile.account)) {
        store.friendArr.push(friendProfile.account)
    }
}