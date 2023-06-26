/**
 * 这篇文档整体内容和 [session/会话排序.js] 基本一致。不同之处在于，这篇文档在初始化后，会从本地数据库中获取最初的会话列表。
 * 
 * 当 db 关闭时，应用从 onsessions 获取初始化会话列表。onsessions 根据漫游消息和离线消息构建会话。
 * 
 * 由于服务器对下发的漫游消息会话数量有限制，所以 db 关闭时，超出限制的会话无法获取。此时，可以通过数据库获取限制外的会话。
 */


nim = NIM.getInstance({
    appKey: "YOUR_APPKEY",
    account: "YOUR_ACCOUNT",
    token: "YOUR_TOKEN",
    db: true,
    //初始化阶段，同步置顶会话数据
    syncStickTopSessions: true,
    //初始化阶段，接收所有的sessions
    onsyncdone: onsyncdone,

    // 请参考 [session/会话排序.js]
    // onStickTopSessions: onStickTopSessions,

    // 请参考 [session/会话排序.js]
    // onupdatesessions: onupdatesessions,
})


/**
 * 同步结束后，从本地数据库中获取最新的 N 个会话记录
 */
let syncInited = false
async function onsyncdone() {
    if (!syncInited) {
        syncInited = true
        const res = await getLatestNLocalSessions(20)

        for (const session of res.sessions) {
            store.sessionMap[session.id] = session
        }
        // getOrderedSessions 请参考 [session/会话排序.js]
        store.orderedSessions = getOrderedSessions(store.sessionMap)
    }
}


/**
 * 从 lastIdServer 这一条历史消息开始向前查询 total 条消息，返回 total 条消息，或者如果消息量不足 total，返回 lastIdServer之前的所有消息。
 */
async function getLatestNLocalSessions(total, lastSessionId) {
    const limit = 5
    const pageSize = total > limit ? limit : total

    return new Promise((res, rej) => {
        nim.getLocalSessions({
            lastSessionId,
            limit: pageSize,
            reverse: true,
            done: async function (err, data) {
                if (err) {
                    rej(err)
                } else {
                    const retSessions = data.sessions
                    lastSessionId = retSessions.length > 0 ? retSessions[retSessions.length - 1].id : undefined

                    if (retSessions.length < pageSize) {
                        // 已经查询完毕
                        res({
                            sessions: retSessions,
                            lastSessionId
                        })
                    } else if (total > limit) {
                        // 返回 limit 个系统消息。查询尚未结束
                        const nextPageResult = await getLatestNLocalSessions(total - pageSize, lastSessionId)
                        res({
                            sessions: retSessions.concat(nextPageResult.sessions),
                            lastSessionId: nextPageResult.lastSessionId
                        })
                    } else {
                        // 查询结束
                        res({
                            sessions: retSessions,
                            lastSessionId
                        })
                    }
                }
            }
        })
    })
}