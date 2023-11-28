/**
 * 发送消息，如何将发送中消息插入队列，如何在消息发送成功，或者失败后更新队列中元素，请参考：[message/消息队列维护.js]
 * 
 * 发送文件时，如何显示文件上传进度，请参考该文件的 sendFile 函数
 */

/**
 * 01. 发送文本消息
 */
try {
    const msg = await nim.msg.sendTextMsg({
        scene: 'p2p',
        to: 'receiverAccid',
        body: 'hello'
    })
    console.log('发送成功', msg)
} catch (err) {
    console.log('发送失败', err)
}


/**
 * 02. 发送提示消息
 */
try {
    const msg = await nim.msg.sendTipMsg({
        scene: 'p2p',
        to: 'account',
        //接收方通过 msg 事件接收消息
        //然后如果msg.type === 'tip'，接收方通过读取msg.body，然后调用业务代码
        body: 'tip content'
    })
    console.log('发送成功', msg)
} catch (err) {
    console.log('发送失败', err)
}

/**
 * 03. 发送地理位置信息
 */
try {
    const msg = await nim.msg.sendGeoLocationMsg({
        scene: 'p2p',
        to: 'account',
        //接收方通过 msg 事件接收消息
        //然后如果 msg.type === 'geo'，接收方通过读取 msg.attach 获取地理信息数据，然后调用业务代码
        attach: {
            lng: 116.3833,
            lat: 39.9167,
            title: 'Beijing'
        }
    })
    console.log('发送成功', msg)
} catch (err) {
    console.log('发送失败', err)
}


/**
 * 04. 发送自定义信息
 */
try {
    const msg = await nim.msg.sendCustomMsg({
        scene: 'p2p',
        to: 'account',
        // 接收方通过onMsg接收消息
        // 然后如果msg.type === 'custom'，接收方通过读取msg.content，然后调用业务代码
        // 自定义信息的 msg.content 推荐发送 
        attach: JSON.stringify({ type: 1 })
    })
    console.log('发送成功', msg)
} catch (err) {
    console.log('发送失败', err)
}


/**
 * 05. 发送文件
 */
let progressMsg = null
try {
    const sentMsg = await nim.msg.sendImageMsg({
        scene: 'p2p',
        to: 'account',
        type: 'image',
        file: fileObj,
        onUploadStart: function (task) {
            /**
             * 1. 开始上传
             */
            progressMsg = {
                idClient: uuid(),
                payload: {
                    progress: 0,
                    uploadDone: false
                }
            }

            /**
             * 开始上传时，将文件信息插入消息队列
             */
            addMsgToMsgArr(progressMsg)

            /**
             * 如果需要放弃文件消息发送，可以调用 task.abort()
             */
            // task.abort()
        },
        onUploadProgress: function (data) {
            /**
             * 2. 更新上传进度
             */
            progressMsg.payload.progress = data.percentage
        },
        onUploadDone: function () {
            /**
             * 3. 上传完成
             */
            progressMsg.payload.progress = 1
            progressMsg.payload.uploadDone = true
        },
        onSendBefore: function (msg) {
            /**
             * 4. 上传完成，准备发送文件消息时
             */
            // 请参考 [message/消息队列维护.js]

            /**
             * 上传完成，准备发送文件消息时
             * 1. 根据 progressMsg.idClient，将消息从队列中删除
             * 2. 插入待发送的消息到队列中。此时的 msg 已经有了 msg.idClient。后续发送完成后，再次调用 addMsgToMsgArr，更新队列中的消息状态
             */
            deleteMsgFromMsgArr(progressMsg)
            addMsgToMsgArr(msg)
            progressMsg = msg
        },
    })

    addMsgToMsgArr(sentMsg)
    console.log('发送成功', msg)
} catch (err) {
    if (progressMsg) {
        deleteMsgFromMsgArr(progressMsg)
    }
    console.log('发送失败', err)
}
