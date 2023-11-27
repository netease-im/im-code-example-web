/**
 * 通过 NIM 的 onconnect, onwillreconnect, ondisconnect 等事件，得到当前 NIM 实例的连接状态，并根据连接状态，设置相应的 UI 提示。
 */


/**
 * 你的数据存放文件。更新数据后，记得要更新 UI
 */
import store from "../store"

nim = NIM.getInstance({
    appkey: "YOUR_APPKEY",
    account: "YOUR_ACCOUNT",
    token: "YOUR_TOKEN",
    debugLevel: "debug"
});

/**
 * 连接成功，清空网络提示标志
 */
nim.on('logined', () => {
    store.uistate.networkHint = "";
    refreshUI();
})

/**
 * 连接已断开，正在尝试重连
 */
nim.on('willReconnect', () => {
    store.uistate.networkHint = "即将重连";
    refreshUI();
})

nim.on('disconnect', () => {
    store.uistate.networkHint = "账号连接已断开";
    refreshUI();
})

nim.on('kicked', (data) => {
    store.uistate.networkHint = data.message
    refreshUI();
})

