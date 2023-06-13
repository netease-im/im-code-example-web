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
nim.sendFile({
   scene: 'p2p',
   to: 'account',
   type: 'image',
   fileInput: 'domId',
   done: function (err, msg) {
      if (err) {
         console.log('发送失败', err)
      } else {
         console.log('发送消息成功，消息为: ', msg)
      }
   }
})