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
import store from '../store/index.js'

window.nim = NIM.getInstance(window.LoginParams)
window.store = store

nim.on('friends', onSyncFriends)
nim.on('users', onSyncUsers)
nim.on('updateUserInfo', onUpdateUserInfo)
// 多端同步时收到好友相关资料
nim.on('syncFriend', onSyncFriendAction)
nim.on('sysMsg', onSystemMessage)
await nim.connect()

function onSyncFriends(data) {
    store.friendArr = data.filter(item => item.valid).map(data => data.account)
}

/**
 * 初始化阶段收到好友用户资料的回调函数
 */
function onSyncUsers(data) {
    for (let profile of data) {
        store.userProfiles[profile.account] = profile
    }
}

/**
 * 在线阶段收到其它用户资料变更的通知。profile 既可以是好友的用户资料，也可以是非好友的用户资料
 */
function onUpdateUserInfo(profile) {
    store.userProfiles[profile.account] = profile
}

/**
 * 更新好友的备注信息
 */
async function updateFriend(account, alias) {
    try {
        await nim.friend.updateFriend({
            account,
            alias
        })
        store.userProfiles[account].alias = alias
    } catch (err) {
        console.error('updateFriend error', err)
    }
}

/**
 * 添加好友后，将返回数据中，好友的信息设置到 store.userProfiles 中
 */
async function addFriend(account, ps) {
    try {
        await nim.friend.addFriend({
            account, ps
        })
        handleAddFriend(account)
    } catch (err) {
        console.error('addFriend error', err)
    }
}
window.addFriend = addFriend

/**
 * 删除好友
 * 
 * @param {string} account 要删除的好友账号
 * @param {boolean} delAlias 是否删除备注信息
 */
async function deleteFriend(account, delAlias) {
    try {
        await nim.friend.deleteFriend({
            account,
            delAlias
        })
        handleDeleteFriend(account)
    } catch (err) {
        console.error('deleteFriend error', err)
    }
}
window.deleteFriend = deleteFriend


/**
 * 通过好友申请后，将返回数据中，好友的信息设置到 store.userProfiles 中
 */
async function passFriendApply(account, ps) {
    try {
        await nim.friend.passFriendApply({
            account: account,
            ps
        })
        handleAddFriend(account)
    } catch (err) {
        console.error('passFriendApply error', err)
    }
}
window.passFriendApply = passFriendApply

/**
 * 收到多端同步通知
 */
function onSyncFriendAction(options) {
    const friend = options.friend
    const account = options.account

    switch (options.type) {
        /**
         * 当前账户在其它端同步更新好友昵称
         */
        case 'updateFriend':
            /**
             * 如果本地已经存在该用户数据，则直接更新即可。否则，需要拉取该用户的资料
             */
            if (store.userProfiles[account]) {
                store.userProfiles[account] = {
                    ...store.userProfiles[account],
                    ...friend
                }
            } else {
                handleAddFriend(account)
            }
            break
        /**
         * 当前账户在其它端同步新增好友
         */
        case 'addFriend':
        /**
         * 当前账户在其它端同意好友申请
         */
        case 'passFriendApply':
            handleAddFriend(account)
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
async function fetchUserInfo(account) {
    try {
        const friendNameCards = await nim.user.getUsersNameCardFromServer({
            accounts: [account]
        })

        for (const nameCard of friendNameCards) {
            store.userProfiles[account] = nameCard
        }
    } catch (err) {
        console.error('fetchUserInfo error', err)
    }
}


function onSystemMessage(options) {
    if (options.type === 'friendRequest') {
        if (options.attach.type === 'addFriend') {
            handleAddFriend(options.from)
        } else if (options.attach.type === 'passFriendApply') {
            handleAddFriend(options.from)
        } else if (options.attach.type === 'applyFriend') {
            const userCard = store.userProfiles[options.from]
            if (!userCard) {
                fetchUserInfo(options.from)
            }
        }
    } else if (options.type === 'deleteFriend') {
        handleDeleteFriend(options.from)
    }
}

function handleDeleteFriend(account) {
    const idx = store.friendArr.indexOf(account)
    if (idx !== -1) {
        store.friendArr.splice(idx, 1)
    }
}

async function handleAddFriend(account) {
    const friendNameCards = await nim.user.getUsersNameCardFromServer({
        accounts: [account]
    })

    for (const nameCard of friendNameCards) {
        store.userProfiles[account] = nameCard
        if (!store.friendArr.includes(account)) {
            store.friendArr.push(account)
        }
    }
}