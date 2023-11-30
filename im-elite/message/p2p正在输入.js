// NIM SDK 提供自定义系统通知收发。自定义系统通知既可以由客户端发起，也可以由开发者服务器发起。

// SDK 仅透传自定义系统通知，不负责解析和存储，也不管理其未读数，通知内容由第三方 APP 自由扩展。开发者可以根据其业务逻辑自定义一些事件状态的通知，来实现各种业务场景。例如实现单聊场景中的对方“正在输入”的功能。

// index.js 中正在输入的逻辑为：
// 1. 输入框聚焦，以及输入框内容改动时，给接收方发送 USER_IS_TYPING 自定义系统消息
// 2. 输入框失焦时，给接收方发送 USER_CANCEL_TYPE 自定义系统消息
// 3. 接收方收到 USER_IS_TYPING 后，在 UI界面上显示 “用户正在输入” 等提示；收到 USER_CANCEL_TYPE 后，取消提示


//*****************************************
//********* 发送方正在输入，以及取消正在输入 ***
//*****************************************

// 发送正在输入
input.onfocus = () => {
    nim.systemMessage.sendCustomSysMsg({
        type: 'customP2p',
        to: 'account',
        attach: JSON.stringify({ type: 'USER_IS_TYPING' }),
        /**
         * 仅对在线用户发送消息即可
         */
        setting: {
            needSaveOffline: false
        }
    })
}

// 输入框内容改变时，刷新正在编辑提示
input.oninput = () => {
    nim.systemMessage.sendCustomSysMsg({
        type: 'customP2p',
        to: 'account',
        attach: JSON.stringify({ type: 'USER_IS_TYPING' }),
        /**
         * 仅对在线用户发送消息即可
         */
        setting: {
            needSaveOffline: false
        }
    })
}

// 发送取消输入
input.onblur = () => {
    nim.systemMessage.sendCustomSysMsg({
        type: 'customP2p',
        to: 'account',
        attach: JSON.stringify({ type: 'USER_CANCEL_TYPE' }),
        /**
         * 仅对在线用户发送消息即可
         */
        setting: {
            needSaveOffline: false
        }
    })
}


//**************************************************************
//********* 接收方收到 USER_IS_TYPE，设置提示 ******************
//********* 接收方收到 USER_CANCEL_TYPE，清空提示 *****************
//********* 接收方收到 USER_IS_TYPING 后间隔10s无消息，清空提示 ****
//**************************************************************
nim.on('sysMsg', onSystemMessage)

let timer
function onSystemMessage(sysMsg) {
    if (sysMsg && sysMsg.attach) {
        if (sysMsg.attach.type === 'USER_IS_TYPING') {
            clearTimeout(timer)
            setEditHint()
            setTimeout(() => {
                unsetEditHint();
            }, 10000)
        } else if (sysMsg.attach.type === 'USER_CANCEL_TYPE') {
            clearTimeout(timer)
            unsetEditHint();
        }
    }
}