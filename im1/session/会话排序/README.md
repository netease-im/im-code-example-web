本例子介绍如何维护会话的顺序。会话的顺序受两个因素影响：

1. 会话是否置顶。置顶会话应该在所有会话的最上方
2. 会话的更新时间。会话中有新消息到来后，会话的位置应该前移。

置顶会话设置请调用接口：

- addStickTopSession: https://doc.yunxin.163.com/messaging/api-refer/web/typedoc/Latest/zh/NIM/interfaces/nim_SessionInterface.SessionInterface.html#addStickTopSession
- deleteStickTopSession: https://doc.yunxin.163.com/messaging/api-refer/web/typedoc/Latest/zh/NIM/interfaces/nim_SessionInterface.SessionInterface.html#deleteStickTopSession

监听下面三个回调函数，可以覆盖所有会话需要排序的场景：

1. onsessions：初始化阶段获取会话列表。该函数的参数中没有 isTop 属性
2. onStickTopSessions: 初始化阶段获取置顶会话列表。该回调函数触发时机晚于 onsessions, 通过该回调函数判断哪些会话是置顶会话
3. onupdatesessions: 会话状态更新时触发，包括置顶状态。触发后，根据置顶属性，以及会话更新时间重排会话
