/**
 * https://doc.yunxin.163.com/messaging-enhanced/docs/zM3MTE1MzQ?platform=web
 * IM 增强版支持安全通反垃圾、通用反垃圾和第三方反垃圾
 * 
 * - 安全通（又称“易盾反垃圾”）是网易云信提供的内容安全增值业务
 * - 通用反垃圾指使用 IM 默认的反垃圾功能，是 IM 最基础的内容审核能力，仅能满足对涉政和反动等内容的审核。通用反垃圾不需要任何配置。
 * - 第三方反垃圾为通过云信服务端的第三方回调服务实现第三方反垃圾。
 * 
 * 下面示例代码展示如何使用安全通反垃圾能力
 */


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
nim.msg.sendTextMsg({
    scene: 'p2p',
    to: 'receiverAccid',
    body: 'hello',
    antiSpamInfo: {
        /**
         * 选填。这条发送的消息是否需要经过安全通审核。默认为 true
         */
        antiSpamUsingYidun: true
    }
})

/**
* 自定义消息审核
*/
nim.msg.sendCustomMsg({
    scene: 'p2p',
    to: 'account',
    attach: JSON.stringify({ type: 1 }),
    antiSpamInfo: {
        /**
         * 是否对自定义消息的 指定内容（用 antiSpamContent设置）进行安全检测。默认为 false
         */
        needAntiSpam: true,
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
    }
})