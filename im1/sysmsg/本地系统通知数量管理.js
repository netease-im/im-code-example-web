/**
 * db 开启时，如果系统通知不及时清理，它占用的存储空间会越来越多。下面是一段系统通知清理的代码示例。
 * 
 * 每次 sdk 连接建立后，取最近的 100 条系统通知处理，其余的系统通知全部从 db 中移除
 */

/**
 * db 开启
 */
nim = NIM.getInstance({
    appKey: "YOUR_APPKEY",
    account: "YOUR_ACCOUNT",
    token: "YOUR_TOKEN",
    db: true,
    onsyncdone
})

/**
 * 有数据库时，在连接建立后（包括重连），做以下两件事：
 * 1. 获取最近 N 条系统消息，并作为本次应用的系统消息队列中的内容
 * 2. 这 N 条之外的消息要从数据库中移除，以保持数据库大小可控
 */
async function onsyncdone() {
    const res = await getLocalSysMsgs(100)
    console.log('getLocalSysMsgs', res)

    if (res.hasMore) {
        removeLocalSysMsgsBefore(res.lastIdServer)
    }

    /**
     * 继续处理系统通知。详情请查看 sysmsg/系统通知.js
     */
    handleSysMsgs(res.sysMsgs)
}

/**
 * 移除 lastIdServer 之前的所有系统消息
 */
async function removeLocalSysMsgsBefore(lastIdServer) {
    /**
     * 获取 lastIdServer 之前的所有历史消息
     */
    const res = await getLocalSysMsgs(1000000, lastIdServer)

    if (res.sysMsgs.length > 0) {
        nim.deleteLocalSysMsg({
            idServer: res.sysMsgs.map(msg => msg.idServer),
            done: function (err, obj) {
                if (err) {
                    console.log('删除失败', err)
                } else {
                    console.log('删除本地系统通知消息', res.sysMsgs.map(msg => msg.idServer))
                }
            }
        })
    }
}

/**
 * 从 lastIdServer 这一条历史消息开始向前查询 total 条消息，返回 total 条消息，或者如果消息量不足 total，返回 lastIdServer之前的所有消息。
 */
async function getLocalSysMsgs(total, lastIdServer) {
    const limit = 100
    const pageSize = total > limit ? limit : total

    return new Promise((res, rej) => {
        nim.getLocalSysMsgs({
            lastIdServer,
            limit: pageSize,
            done: async function (err, data) {
                if (err) {
                    rej(err)
                } else {
                    const retSysMsgs = data.sysMsgs
                    lastIdServer = retSysMsgs.length > 0 ? retSysMsgs[retSysMsgs.length - 1].idServer : undefined

                    if (retSysMsgs.length < pageSize) {
                        // 已经查询完毕
                        res({
                            sysMsgs: retSysMsgs,
                            lastIdServer: lastIdServer,
                            hasMore: false
                        })
                    } else if (total > limit) {
                        // 返回 limit 个系统消息。查询尚未结束
                        const nextPageResult = await getLocalSysMsgs(total - pageSize, lastIdServer)
                        res({
                            sysMsgs: retSysMsgs.concat(nextPageResult.sysMsgs),
                            lastIdServer: nextPageResult.lastIdServer,
                            hasMore: nextPageResult.hasMore
                        })
                    } else {
                        // 查询结束
                        res({
                            sysMsgs: retSysMsgs,
                            lastIdServer,
                            hasMore: true
                        })
                    }
                }
            }
        })
    })
}