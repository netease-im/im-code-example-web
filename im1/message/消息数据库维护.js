/**
 * 当使用 db 时，如果数据库中消息不及时清理，会一直增量的积累数据库的尺寸。因此，需要及时的清理数据库中的资源。
 * 
 * 建议应用在 UI 层开放接口，允许用户手动删除 db 中的消息记录。比如开放入口，让用户选择删除最近一月/最近一周的本地消息
 */

function deleteLocalMsgs(sessionId, days) {
    const end = Date.now() - 1000 * 60 * 60 * 24 * days

    nim.deleteLocalMsgs({
        sessionId,
        end,
        updateSession: true,
        done: function (err, data) {
            if (!err) {
                console.log('会话清除成功')
                start = data.start || 0
                end = data.end || Date.now()

                const sessionMsgs = store.sessionMsgs[data.sessionId]
                if (sessionMsgs) {
                    /**
                     * msgArr 是按照消息时间由大向小排列的
                     * 
                     * 删除所有 time <= end && time >= start 的消息
                     */
                    const msgArr = sessionMsgs.msgArr
                    let firstIdx = -1
                    let count = 0
                    for (let i = 0; i < msgArr.length; i++) {
                        const msg = msgArr[i]

                        /**
                         * 找到第一条应该被删除的消息
                         */
                        if (firstIdx === -1 && msg.time <= end) {
                            firstIdx = i
                        }

                        /**
                         * 消息在被删除时间范围之内
                         */
                        if (firstIdx !== -1 && msg.time >= start) {
                            count++
                        }

                        /**
                         * 消息在删除内容之外
                         */
                        if (msg.time < start) {
                            break
                        }
                    }

                    if (count > 0) {
                        msgArr.splice(firstIdx, count)
                    }
                }
            }
        }
    })
}