/**
 * https://doc.yunxin.163.com/messaging/docs/TYzMTkzMDE?platform=web
 * 该文件分为两部分，分别介绍客户端反垃圾，以及安全通反垃圾
 */


/**
 * 客户端反垃圾
 */

/**
 * 1. 加载反垃圾词库。加载后，词库会保留在 SDK 的内存中
 */
nim.getClientAntispamLexicon({
    done: function (error, file) {
        console.log(error, file)
    }
})

/**
 * 2. 在发送文本前，调用 filterClientAntiSpam 检查文本，并根据结果决定如何发送
 */
function sendTextAfterAntiSpam(option) {
    // 检查文本
    const ret = nim.filterClientAntispam({
        content: option.text
    })

    switch (ret.type) {
        case 0:
            // 未命中词库，可以安全发送
            nim.sendText(option)
            break
        case 1:
            // 命中本地替换词库。替换后文本为 ret.result
            option.text = ret.result
            nim.sendText(option)
            break
        case 2:
            // 命中拦截词库。请勿发送文本
            showHint('此消息无法发送')
            break
        case 3:
            // 命中服务端拦截库。建议发送消息，并设置 clientAntiSpam: true。发送后，消息会在本地显示发送成功，但实际上不会发送给其它用户
            // 服务端拦截库适合于防止灌水
            nim.sendText({
                ...option,
                clientAntiSpam: true
            })
            break
    }
}


/**
 * 安全通。安全通（又称“易盾反垃圾”）是网易云信提供的内容安全增值业务，为您提供全方位的内容安全检测服务。
 * 
 * 安全通（又称“易盾反垃圾”）是网易云信提供的内容安全增值业务，为您提供全方位的内容安全检测服务。
 * 
 * 开通安全通功能并配置安全通检测规则后，指定的功能都需要经过审核后才会生效。安全通目前支持单聊、群聊、聊天室的文本消息、图片消息、自定义消息以及用户头像和用户资料等类型的内容安全检测。
 */

/**
 * 文本消息审核
 */
nim.sendText({
    scene: 'p2p',
    to: 'receiverAccid',
    text: 'hello',
    /**
     * 选填。这条发送的消息是否需要经过安全通审核。默认为 true
     */
    antiSpamUsingYidun: true,
    done: function (err, msg) {
        if (err) {
            console.log('发送失败', err)
        } else {
            console.log('发送成功', msg)
        }
    }
})

/**
* 自定义消息审核
*/
nim.sendCustomMsg({
    scene: 'p2p',
    to: 'account',
    content: JSON.stringify({ type: 1 }),
    /**
     * 是否对自定义消息的 指定内容（用 antiSpamContent设置）进行安全检测。默认为 false
     */
    yidunEnable: true,
    /**
     * 额外被审核的内容。必须传 格式化json字符串
     * 
     * type: 1-文本；2-图片；3-视频
     * data: 文本内容；图片URL地址；视频URL地址
     */
    antiSpamContent: JSON.stringify({
        type: "1",
        data: "需要被审核的文本"
    }),
    done: function (err, msg) {
        if (err) {
            console.log('发送失败', err)
        } else {
            console.log('发送消息成功，消息为: ', msg)
        }
    }
})