const store = {
    /**
     * 根据 SDK 的连接状态，显示应用的网络状态
     */
    uistate: {
        networkHint: ""
    },
    /**
     * key: sessionId
     * value.msgArr: 已经拉取到内存中的会话的消息列表，最新的消息在队列头部
     * value.fetching: 是否上次调用getHistoryMsgs的结果还未返回
     * value.complete: 是否已经加载完了
     */
    sessionMsgs: {},
    /**
     * key: sessionId
     * value: 会话对象，包含会话的基本信息。包括 lastMsg 显示会话的最后一条消息
     */
    sessionMap: {},
    /**
     * 排序后的会话列表。
     * 
     * 数组中每一个元素为一个会话对象。这些对象都可以在 sessionMap 中找到
     */
    orderedSessions: [],
    /**
     * 用户信息
     */
    users: {},
    /**
     * 群组信息
     */
    teams: {},
    /**
     * 超级群信息
     */
    superTeams: {}
}

export default store