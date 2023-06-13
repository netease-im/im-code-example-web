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
 * 在发送文本前，调用 filterClientAntiSpam 检查文本，并根据结果决定如何发送
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