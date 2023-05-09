import NIM from "@yxim/nim-web-sdk/dist/SDK/NIM_Web_NIM.js";
/**
 * 你的数据存放文件。更新数据后，记得要更新 UI
 */
import store from "./your_store_file";

NIM.getInstance({
  appKey: "YOUR_APPKEY",
  account: "YOUR_ACCOUNT",
  token: "YOUR_TOKEN",
  /**
   * 开启快速重连。根据浏览器的 online, offline 事件嗅探网络状态，并在网络恢复时快速重连
   */
  quickReconnect: true,
  onconnect: onconnect,
  onwillreconnect: onwillreconnect,
  ondisconnect: ondisconnect,
});

/**
 * 连接成功，清空网络提示标志
 */
function onconnect() {
  store.uistate.networkHint = "";
  refreshUI();
}

/**
 * 连接已断开，正在尝试重连
 */
function onwillreconnect() {
  store.uistate.networkHint = "网络不稳定，即将重连";
  refreshUI();
}

/**
 * 连接已断开。除了因为 offlineListener 断开外，其它情况都不会进行重连
 */
function ondisconnect(res) {
  /**
   * 根据断开的 code 设置页面提示
   * 数字类型的 code 为初次登陆时，服务器返回的状态码
   * 字符类型的 code 为登录保持态断开时的状态码
   */
  if (typeof res.code === "number") {
    if (res.code === 302) {
      store.uistate.networkHint = "账号或者密码错误";
    } else if (res.code === 403) {
      store.uistate.networkHint = "账号禁止登录";
    } else if (res.code === 422) {
      store.uistate.networkHint = "账号被禁用";
    } else {
      store.uistate.networkHint = "账号无法登录";
    }
  } else if (res.code === "kicked") {
    store.uistate.networkHint = "账号已被踢出";
  } else if (res.code === "allAttemptsFailed") {
    store.uistate.networkHint = "无法连接至服务器";
  } else if (res.code === "offlineListener") {
    store.uistate.networkHint = "网络不佳，连接已断开";
  } else if (res.code === "logout") {
    store.uistate.networkHint = "当前账户已登出";
  } else {
    store.uistate.networkHint = "当前账户已登出";
  }

  /**
   * offlineListener 表示当前网络不佳，sdk 连接断开。当网络恢复后，sdk 会开启重连。这种状态下不需要跳转至登录页面
   */
  if (res.code !== "offlineListener") {
    redirect("loginPage");
  }
}
