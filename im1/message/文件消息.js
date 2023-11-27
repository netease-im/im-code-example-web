/**
 * 文件消息包含文件上传过程，以及消息发送过程。文件消息发送时需要注意以下几方面：
 * 1. 文件消息在上传过程中，需要展示上传进度
 * 2. 文件消息完成前，需要展示消息正在发送中
 * 3. 文件上传完成后，需要展示上传完成
 * 4. 文件消息发送完成后，需要展示消息发送状态
 * 
 * 另外，从会话窗口退回到会话列表窗口时，还需要展示正在发送文件的消息。
 */

let fakeId = 1
function sendFile() {
    const fakeFileMessage = {
        idClient: `fake-file-${fakeId++}`
    }

    const fileMsg = nim.sendFile({
        scene: 'p2p',
        to: 'account',
        type: 'image',
        fileInput: 'domId',
        uploadprogress: function (data) {
            fileMsg.payload = {
                progress: data.percentage,
                uploadDone: false
            }
        },
        uploaddone: function (err, data) {
            if (!err) {
                fileMsg.payload = {
                    progress: 100,
                    uploadDone: true,
                    url: data.url
                }
            }
        },
        done: function (err, msg) {
            if (err) {
                console.log('发送失败', err)
            } else {
                console.log('发送消息成功，消息为: ', msg)
            }
            // 请参考 [message/消息队列维护.js]
            updateMsgInMsgArr(fileMsg)
        }
    })

    fileMsg.payload = {
        progress: 0,
        uploadDone: false
    }

    // 请参考 [message/消息队列维护.js]
    addMsgToMsgArr(fileMsg)
}
