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
    userProfiles: {},
    /**
     * 群组信息
     */
    teams: {},
    /**
     * 我的个人资料
     */
    myProfile: {},
    /**
     * 我在各个群内的信息。比如自己是否设置了该群免打扰，是否为群主等等
     */
    myInfoInEachTeam: {},
    /**
     * 群成员信息
     * key: teamId
     * value: 
     *  value.key: accid
     *  value.value: 用户信息
     */
    teamMembers: {},
    /**
     * 超级群信息
     */
    superTeams: {},
    /**
     * 我在各个超级群内的信息。比如自己是否设置了该群免打扰，是否为群主等等
     */
    myInfoInEachSuperTeam: {},
    /**
     * 超级群成员信息
     */
    superTeamMembers: {},
    friendArr: [],
    friendsOnlineStatus: {},
    muteList: []
}

export default store