/**
 * 发送消息，如何将发送中消息插入队列，如何在消息发送成功，或者失败后更新队列中元素，请参考：[message/消息队列维护.js]
 * 
 * 发送文件时，如何显示文件上传进度，请参考该文件的 sendFile 函数
 */

/**
 * 01. 发送文本消息
 */
nim.sendText({
   scene: 'p2p',
   to: 'receiverAccid',
   text: 'hello',
   done: function (err, msg) {
      if (err) {
         console.log('发送失败', err)
      } else {
         console.log('发送成功', msg)
      }
   }
})


/**
 * 02. 发送提示消息
 */
nim.sendTipMsg({
   scene: 'p2p',
   to: 'account',
   //接收方通过onMsg接收消息
   //然后如果msg.type === 'tip'，接收方通过读取msg.tip，然后调用业务代码
   tip: 'tip content',
   done: function (err, msg) {
      if (err) {
         console.log('发送失败', err)
      } else {
         console.log('发送消息成功，消息为: ', msg)
      }
   }
})


/**
 * 02. 发送提示消息
 */
nim.sendTipMsg({
   scene: 'p2p',
   to: 'account',
   //接收方通过onMsg接收消息
   //然后如果msg.type === 'tip'，接收方通过读取msg.tip，然后调用业务代码
   tip: 'tip content',
   done: function (err, msg) {
      if (err) {
         console.log('发送失败', err)
      } else {
         console.log('发送消息成功，消息为: ', msg)
      }
   }
})

/**
 * 03. 发送地理位置信息
 */
nim.sendGeo({
   scene: 'p2p',
   to: 'account',
   //接收方通过onMsg接收消息
   //然后如果msg.type === 'geo'，接收方通过读取msg.geo，然后调用业务代码
   geo: {
      lng: 116.3833,
      lat: 39.9167,
      title: 'Beijing'
   },
   done: function (err, msg) {
      if (err) {
         console.log('发送失败', err)
      } else {
         console.log('发送消息成功，消息为: ', msg)
      }
   }
})

/**
 * 04. 发送自定义信息
 */
nim.sendCustomMsg({
   scene: 'p2p',
   to: 'account',
   // 接收方通过onMsg接收消息
   // 然后如果msg.type === 'custom'，接收方通过读取msg.content，然后调用业务代码
   // 自定义信息的 msg.content 推荐发送 
   content: JSON.stringify({ type: 1 }),
   done: function (err, msg) {
      if (err) {
         console.log('发送失败', err)
      } else {
         console.log('发送消息成功，消息为: ', msg)
      }
   }
})


/**
 * 05. 发送文件
 */
function sendFile() {
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
