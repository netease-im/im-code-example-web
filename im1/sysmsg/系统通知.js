/**
 * 该文件主要介绍如何处理系统消息。
 * 
 * 一：系统消息大致可以分为以下几类：
 *  1. 好友类型
 * - deleteFriend
 * - addFriend
 * - applyFriend
 * - passFriendApply
 * - rejectFriendApply
 * 
 * 2. 群组类型
 * - applyTeam
 * - rejectTeamApply
 * - rejectTeamInvite
 * - teamInvite
 * 
 * 3. 撤回消息
 * - deleteMsg
 * 
 * 二：需要回复的系统消息类型：
 * - applyFriend
 * - applyTeam
 * - teamInvite
 * 
 * 三：系统消息来源
 * 1. 如果没有打开 db，系统消息来源于 离线系统通知 + 漫游系统通知（仅撤回消息）+ 在线系统通知
 * 2. 如果打开 db，可以在连接后，从本地数据库中拉取系统通知（条数设置一个定额，超出条数的系统通知丢弃） + 在线系统通知
 * 
 * 四：系统消息处理
 * - 阅读系统通知后，设置系统通知已读 markSysMsgRead
 * - 系统通知更新后，state 从 init 变为 passed 或者 rejected，此时系统通知也是已读状态
 * 
 * 五：系统消息覆盖
 * - 部分同类型的系统消息需要覆盖：
 * - 1. type相同的系统消息
 * - 2. type不同，但是应该覆盖的系统通知，比如：addFriend, applyFriend, passFriendApply, rejectFriendApply
 * 
 * 六：本地系统消息移除 （请参考 sysmsg/本地系统通知数量管理.js)
 * - 1. 初始化后，可以获取全量系统通知，然后仅保留最近N条系统通知(比如最近100条，开发者自行决定)，其他的系统通知调用 deleteLocalSysMsg 删除
 * - 2. 一般来说，完成步骤一后，db中系统通知会维持在一个比较合理的量。当然，您也可以接收在线系统通知后，动态的调整系统通知的数量
 * 
 * 
 * 根据上面的讨论，我们创建 store.sysMsgs 数据。该数据为一个 object。相似的系统通知会拥有相同的 key，使其满足[规则五]
 * 在UI层面，applyFriend, applyTeam, teamInvite 提供两个按钮，同意或者拒绝。[规则二]
 * 用户点击系统通知后，调用 markSysMsgRead 设置通知为已读。根据通知的 state !== 'init' && read === false，判断系统消息是否未读[规则四]
 */
import store from '../store'

const SYSMSG_COUNT_TO_KEEP = 100

/**
 * db 关闭
 */
nim = NIM.getInstance({
    appKey: "YOUR_APPKEY",
    account: "YOUR_ACCOUNT",
    token: "YOUR_TOKEN",
    db: false,
    onroamingsysmsgs: onsyncsysmsgs,
    onofflinesysmsgs: onsyncsysmsgs,
    onsysmsg: handleSysMsg
})

/**
 * db 开启
 */
nim = NIM.getInstance({
    appKey: "YOUR_APPKEY",
    account: "YOUR_ACCOUNT",
    token: "YOUR_TOKEN",
    db: true,
    onconnect: onconnect,
    /**
     * 即使开了 db，也需要监听 offlinesysmsgs。因为直接从 数据库读时，可能会有一些离线的系统通知还未入库
     */
    onofflinesysmsgs: onsyncsysmsgs,
    onsysmsg: handleSysMsg
})

/**
 * 有数据库时，在连接建立后（包括重连），做以下两件事：
 * 1. 获取最近 N 条系统消息，并作为本次应用的系统消息队列中的内容
 * 2. 这 N 条之外的消息要从数据库中移除，以保持数据库大小可控
 * 
 * 关联函数请参考 sysmsg/本地系统通知数量管理.js
 */
async function onconnect() {
    const res = await getLocalSysMsgs(SYSMSG_COUNT_TO_KEEP)
    if (res.hasMore) {
        removeLocalSysMsgsBefore(res.lastIdServer)
    }

    for (let i = res.sysMsgs.length - 1; i >= 0; i--) {
        handleSysMsg(res.sysMsgs[i])
    }
}

/**
 * 初始化同步时得到的系统消息
 */
function onsyncsysmsgs(sysMsgs) {
    for (let i = sysMsgs.length - 1; i >= 0; i--) {
        handleSysMsg(sysMsgs[i])
    }
}

/**
 * 处理系统消息
 */
function handleSysMsg(msg) {
    handleFriendSysMsg(msg)
    handleTeamSysMsg(msg)
    handleRecallSysMsg(msg)
}

/**
 * 处理好友相关的系统通知
 * 
 * handleAddFriend, handleDeleteFriend 的具体实现这里就不展示了。这两个函数无外乎需要处理：
 * - store 中好友关系
 * - 拉取好友的详细名片
 * - 插入一个新的会话
 */
function handleFriendSysMsg(msg) {
    switch (msg.type) {
        // 删除好友
        case 'deleteFriend':
            // handleDeleteFriend(msg)
            break
        // 好友申请
        case 'addFriend':
            // handleAddFriend(msg)
            addMsgToNotificationCenter(msg)
            break
        // 申请加为好友
        case 'applyFriend':
            addMsgToNotificationCenter(msg)
            break
        // 好友申请通过
        case 'passFriendApply':
            // handleAddFriend(msg)
            addMsgToNotificationCenter(msg)
            break
        // 拒绝好友申请
        case 'rejectFriendApply':
            addMsgToNotificationCenter(msg)
            break
    }
}

function handleTeamSysMsg(msg) {
    switch (msg.type) {
        // 申请加入群
        case 'applyTeam':
            addMsgToNotificationCenter(msg)
            break
        // 相关 (管理员)拒绝申请入群
        case 'rejectTeamApply':
            addMsgToNotificationCenter(msg)
            break
        // 相关 (某人)拒绝邀请
        case 'rejectTeamInvite':
            addMsgToNotificationCenter(msg)
            break
        // 相关 (管理员)邀请某人
        case 'teamInvite':
            addMsgToNotificationCenter(msg)
            break
    }
}

function handleRecallSysMsg(msg) {
    if (msg.type === 'deleteMsg') {
        /**
         * 撤回消息系统通知处理请参考 message/撤回消息.js
         */
    }
}

function addMsgToNotificationCenter(msg) {
    const typeMap = {
        'deleteFriend': 'friendRequest',
        'addFriend': 'friendRequest',
        'applyFriend': 'friendRequest',
        'passFriendApply': 'friendRequest',
        'rejectFriendApply': 'friendRequest'
    }

    const msgCommonType = typeMap[msg.type] || msg.type

    /**
     * 使用 from-type-to 构成消息的 key 值，避免多次发送同一类型消息造成重复
     */
    if (msg.from && msg.type && msg.to) {
        const id = `${msg.from}-${msgCommonType}-${msg.to}`
        store.sysmsg[id] = msg
    } else {
        console.warn('addMsgToNotificationCenter drop', msg)
        return
    }
}



/**
 * 计算系统通知未读数。
 */
function getUnreadSysMsgCount() {
    let count = 0
    for (let key in store.sysmsg) {
        const msg = store.sysmsg[key]
        count += (!msg.read && msg.state === 'init') ? 1 : 0
    }
    console.log('unread sysmsg total', count)
}