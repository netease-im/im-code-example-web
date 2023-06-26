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
     * 我在各个群内的信息。比如自己是否设置了该群免打扰，是否为群主等等。
     * 
     * 这个数据的维护请参考: [team/我在群内信息.js]
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
    friendArr: [],
    /**
     * 好友是否上线。请参考: [event/用户上线下线.js]
     */
    friendsOnlineStatus: {},
    /**
     * 静音列表。请参考: [session/会话免打扰.js]
     */
    muteList: [],
    /**
     * 黑名单列表。请参考: [user/黑名单.js]
     */
    blackList: [],
    /**
     * key: `${msg.from}-${msgCommonType}-${msg.to}`
     * msgCommonType: 好友相关的系统通知的 msgCommonType 为 friendRequest。其它系统通知的 msgCommonType 为 msg.type
     * 
     * 这样设计是为了让好友相关的系统通知能够覆盖，既新的好友相关系统通知覆盖旧的。仔细想想，不难发现，这几种类型的好友相关系统通知仅需要显示任一种的最后一个就行。
     * 
     * 而team相关的系统通知：
     * - applyTeam: 仅群内管理员能收到
     * - rejectTeamInvite: 仅群内管理员收到。可能存在场景，A拒绝了管理员的群邀请，但是之前又发送了 群申请，此时应该不覆盖。因此，applyTeam 和 rejectTeamInvite 不需要相互覆盖
     * - teamInvite: 仅群外成员收到
     * - rejectTeamApply: 仅群外成员收到。可能存在场景，比如 管理员拒绝了 A 的群申请，但是另有管理员发送 A 群邀请，因此 teamInvite 和 rejectTeamApply 不需要相互覆盖
     * 
     * 综上，群相关的系统通知无需覆盖处理
     */
    sysmsg: {}
}

export default store