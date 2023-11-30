/**
 * 该文件分为两部分：
 * 1. p2p场景推送
 * 2. 群聊场景推送
 */

/**
 * p2p 场景推送。
 * 
 * 如果发送的不是文本消息，则默认文案为：“发来了一个 文件/地理位置/提醒/新消息”
 */
nim.msg.sendTextMsg({
    scene: 'p2p',
    to: 'receiverAccid',
    /**
     * 默认推送文案。
     */
    body: 'hello',
    pushInfo: {
        /**
         * 是否需要推送
         */
        needPush: true,
        /**
         * 选填。若不填，则默认使用 body 中的内容作为推送文案
         */
        pushContent: '推送内容',
        /**
         * 选填。是否推送昵称，默认为 true。
         * 
         * 该参数为 true 时，接收方的推送消息显示的来源为 发送方的 昵称
         * 改参数为 false 时，接收方的推送消息显示的来源不包含 发送方昵称
         */
        needPushNick: true,
        /**
         * 选填。自定义的推送参数，默认为 true
         * 
         * 具体请参考：https://doc.yunxin.163.com/messaging/docs/DQyNjc5NjE?platform=server
         */
        pushPayload: JSON.stringify({
            pushTitle: '推送标题',
            /**
             * 华为推送参数
             */
            hwField: {
                click_action: {},
                androidConfig: {
                    category: ""
                }
            }
        }),
    }
})

/**
 * 群聊推送
 * 
 * 群聊的默认标题为群名
 */
nim.msg.sendTextMsg({
    scene: 'team',
    to: 'teamId',
    body: 'hello',
    pushInfo: {
        /**
         * 是否需要群消息强推
         * 
         * 如果用户对于群设置了静音，则需要使用强推，才能够推送给该用户
         */
        needForcePush: true,
        /**
         * 选填。需要特殊推送的 IM 账号（accid）列表, 不填表示推送给当前会话内的所有用户
         */
        forcePushIDsList: JSON.stringify(['accid1', 'accid2']),
        /**
         * 需要特殊推送的文案, 不填的话默认为 pushContent
         */
        forcePushContent: '群聊推送文案',
        /**
         * 选填。自定义的推送参数，默认为 true
         * 
         * 具体请参考：https://doc.yunxin.163.com/messaging/docs/DQyNjc5NjE?platform=server
         */
        pushPayload: JSON.stringify({
            pushTitle: '推送标题',
            /**
             * 华为推送参数
             */
            hwField: {
                click_action: {},
                androidConfig: {
                    category: ""
                }
            }
        }),
    }
})
