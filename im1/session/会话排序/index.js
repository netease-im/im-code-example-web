import NIM from "@yxim/nim-web-sdk/dist/SDK/NIM_Web_NIM.js";
/**
 * 你的数据存放文件。更新数据后，记得要更新 UI
 */
import store from "./your_store_file";

// 所有会话
// key: 会话的id
// value: 会话
const sessions = {};

nim = NIM.getInstance({
  appKey: "YOUR_APPKEY",
  account: "YOUR_ACCOUNT",
  token: "YOUR_TOKEN",
  //初始化阶段，同步置顶会话数据
  syncStickTopSessions: true,
  //初始化阶段，接收所有的sessions
  onsessions: onsessions,
  //初始化阶段，接收到置顶会话列表
  onStickTopSessions: onStickTopSessions,
  //会话置顶信息变更时，触发onupdatesessions回调函数
  onupdatesessions: onupdatesessions,
});

/**
 * 初始化阶段收到会话列表。
 *
 * 注意，该回调函数返回的会话不包含 isTop 属性。
 */
function onsessions(sessionArr) {
  for (const session of sessionArr) {
    sessions[session.id] = session;
  }
  store.nim.orderedSessions = getOrderedSessions(sessions);
}

/**
 * 初始化阶段收到所有置顶会话列表
 */
function onStickTopSessions(sessionArr) {
  for (let session of sessionArr) {
    if (sessions[session.id]) {
      sessions[session.id].isTop = session.isTop;
    }
  }
  store.nim.orderedSessions = getOrderedSessions(sessions);
}

/**
 * 会话更新。更新原因可能包括会话消息更新、或者是否置顶属性更新
 */
function onupdatesessions(sessionArr) {
  for (let session of sessionArr) {
    sessions[session.id] = session;
  }
  store.nim.orderedSessions = getOrderedSessions(sessions);
}

// 对会话排序
function getOrderedSessions(sessions) {
  return Object.keys(sessions)
    .map((id) => sessions[id])
    .sort(sortSession);
}

/**
 * 排序依据：
 * 1. 是否为置顶会话
 * 2. 根据会话的 updateTime 排序
 */
function sortSession(sessionA, sessionB) {
  if (sessionA.isTop && !sessionB.isTop) {
    return -1;
  } else if (!sessionA.isTop && sessionB.isTop) {
    return 1;
  } else {
    return sessionB.updateTime - sessionA.updateTime;
  }
}
