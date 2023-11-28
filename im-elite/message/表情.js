/**
 * 推荐使用自定义消息(sendCustomMsg)发送表情、红包。
 * 
 * 自定义消息的 content 应该是 JSON 字符串。在接收端，判断消息类型是否为 custom，然后根据自定义消息的类型渲染
 */
const value = Math.ceil(Math.random() * 3)

const content = {
    type: 'EMOJI',
    data: {
        value: value
    }
}

const msg = await nim.msg.sendCustomMsg({
    scene: 'p2p',
    to: 'account',
    body: JSON.stringify(content),
})

/**
 * Msg 的渲染函数
 */
function renderMsg(msg) {
    if (msg.type === 'custom') {
        const content = msg.attach
        if (content.type === 'EMOJI') {
            return renderEmoji(content.data)
        } else {
            return renderOtherCustomMsg(content)
        }
    } else {
        return renderOtherMsg(msg)
    }
}