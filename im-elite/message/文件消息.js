/**
 * 文件消息包含文件上传过程，以及消息发送过程。文件消息发送时需要注意以下几方面：
 * 1. 文件消息在上传过程中，需要展示上传进度
 * 2. 文件消息完成前，需要展示消息正在发送中
 * 3. 文件上传完成后，需要展示上传完成
 * 4. 文件消息发送完成后，需要展示消息发送状态
 * 
 * 另外，从会话窗口退回到会话列表窗口时，还需要展示正在发送文件的消息。
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
