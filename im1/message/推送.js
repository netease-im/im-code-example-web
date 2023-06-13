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
nim.sendText({
    scene: 'p2p',
    to: 'receiverAccid',
    /**
     * 默认推送文案。
     */
    text: 'hello',
    /**
     * 选填。是否需要推送，默认为 true
     */
    isPushable: true,
    /**
     * 选填。若不填，则默认使用 text 中的内容作为推送文案
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
    done: function (err, msg) {
        if (err) {
            console.log('发送失败', err)
        } else {
            console.log('发送成功', msg)
        }
    }
})

/**
 * 群聊推送
 * 
 * 群聊的默认标题为群名
 */
nim.sendText({
    scene: 'team',
    to: 'teamId',
    text: 'hello',
    /**
     * 群聊的推送选项
     */
    apns: {
        /**
         * 选填。需要特殊推送的 IM 账号（accid）列表, 不填表示推送给当前会话内的所有用户
         */
        accounts: ['accid1', 'accid2'],
        /**
         * 需要特殊推送的文案, 不填的话默认为 pushContent
         */
        content: '群聊推送文案',
        /**
         * 是否强制推送, true 表示即使推送列表中的用户屏蔽了当前会话（如静音）, 仍能够推送当前这条内容给相应用户
         * 
         * 静音策略通过 updateInfoInTeam -> muteNotiType 字段设置，比如
         * 
         * // https://doc.yunxin.163.com/messaging/api-refer/web/typedoc/Latest/zh/NIM/interfaces/nim_TeamInterface.TeamInterface.html#updateInfoInTeam
         * //
         * // 设置静音策略为：只接收来自管理员的消息提醒
         * 
         * nim.updateInfoInTeam({
         *  teamId: "teamId",
         *  muteNotiType: 2,
         *  done: function(err, obj) {console.log('call updateInfoInTeam finish: ', err, obj)}
         * })
         */
        forcePush: true
    },
    /**
     * 选填。是否需要推送，默认为 true
     */
    isPushable: true,
    /**
     * 选填。若不填，则默认使用 text 中的内容作为推送文案
     */
    pushContent: '推送内容',
    /**
     * 选填。是否推送昵称，默认为 true。
     * 
     * 该参数为 true 时，接收方的推送消息显示的来源为 发送方的 昵称
     * 改参数为 false 时，接收方的推送消息显示的来源为 发送方的 accid
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
    done: function (err, msg) {
        if (err) {
            console.log('发送失败', err)
        } else {
            console.log('发送成功', msg)
        }
    }
})
