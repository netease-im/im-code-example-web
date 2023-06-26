/**
 * 本例子介绍如何维护会话的顺序。会话的顺序受两个因素影响：
 * 
 * 1. 会话是否置顶。置顶会话应该在所有会话的最上方
 * 2. 会话的更新时间。会话中有新消息到来后，会话的位置应该前移。
 * 
 * 置顶会话设置请调用接口：
 * 
 * - addStickTopSession: https://doc.yunxin.163.com/messaging/api-refer/web/typedoc/Latest/zh/NIM/interfaces/nim_SessionInterface.SessionInterface.html#addStickTopSession
 * - deleteStickTopSession: https://doc.yunxin.163.com/messaging/api-refer/web/typedoc/Latest/zh/NIM/interfaces/nim_SessionInterface.SessionInterface.html#deleteStickTopSession
 * 
 * 监听下面三个回调函数，可以覆盖所有会话需要排序的场景：
 * 
 * 1. onsessions：初始化阶段获取会话列表。该函数的参数中没有 isTop 属性
 * 2. onStickTopSessions: 初始化阶段获取置顶会话列表。该回调函数触发时机晚于 onsessions, 通过该回调函数判断哪些会话是置顶会话
 * 3. onupdatesessions: 会话状态更新时触发，包括置顶状态。触发后，根据置顶属性，以及会话更新时间重排会话
 */


import store from '../store'

nim = NIM.getInstance({
  appKey: "YOUR_APPKEY",
  account: "YOUR_ACCOUNT",
  token: "YOUR_TOKEN",
  debug: true,
  //初始化阶段，同步置顶会话数据
  syncStickTopSessions: true,
  //初始化阶段，接收所有的sessions
  onsessions: onsessions,
  //初始化阶段，接收到置顶会话列表
  onStickTopSessions: onStickTopSessions,
  //会话置顶信息变更时，触发onupdatesessions回调函数
  onupdatesessions: onupdatesessions,
})

/**
 * 初始化阶段收到会话列表。
 *
 * 注意，该回调函数返回的会话不包含 isTop 属性。
 */
function onsessions(sessionArr) {
  for (const session of sessionArr) {
    store.sessionMap[session.id] = session
  }
  store.orderedSessions = getOrderedSessions(store.sessionMap)
}

/**
 * 初始化阶段收到所有置顶会话列表
 */
function onStickTopSessions(sessionArr) {
  for (let session of sessionArr) {
    /**
     * TODO: 这里有些问题哦，如果 onsessions 同步的会话不全的话，初始化时都没办法同步干净了。
     */
    store.sessionMap[session.id] = store.sessionMap[session.id] || {}
    store.sessionMap[session.id] = {
      ...store.sessionMap[session.id],
      ...session
    }
  }
  store.orderedSessions = getOrderedSessions(store.sessionMap)
}

/**
 * 会话更新。更新原因可能包括会话消息更新、或者是否置顶属性更新
 */
function onupdatesessions(sessionArr) {
  for (let session of sessionArr) {
    store.sessionMap[session.id] = session
  }
  store.orderedSessions = getOrderedSessions(store.sessionMap)
}

// 对会话排序
function getOrderedSessions(unorderedSessions) {
  return Object.keys(unorderedSessions)
    .map((id) => unorderedSessions[id])
    .sort(sortSession)
}

/**
 * 排序依据：
 * 1. 是否为置顶会话
 * 2. 根据会话的 updateTime 排序
 */
function sortSession(sessionA, sessionB) {
  if (sessionA.isTop && !sessionB.isTop) {
    return -1
  } else if (!sessionA.isTop && sessionB.isTop) {
    return 1
  } else {
    return sessionB.updateTime - sessionA.updateTime
  }
}
