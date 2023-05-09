该例子展示如何通过 NIM 的回调函数 onsessions, onStickTopSessions，以及 onupdatesessions，维护会话列表，及其相对位置。置顶会话设置请调用接口：

- addStickTopSession: https://doc.yunxin.163.com/messaging/api-refer/web/typedoc/Latest/zh/NIM/interfaces/nim_SessionInterface.SessionInterface.html#addStickTopSession
- deleteStickTopSession: https://doc.yunxin.163.com/messaging/api-refer/web/typedoc/Latest/zh/NIM/interfaces/nim_SessionInterface.SessionInterface.html#deleteStickTopSession

置顶会话排序需要注意三个回调函数：

1. onsessions：初始化阶段获取会话列表。该函数的参数中没有 isTop 属性
2. onStickTopSessions: 初始化阶段获取置顶会话列表。该回调函数触发时机晚于 onsessions, 通过该回调函数判断哪些会话是置顶会话
3. onupdatesessions: 会话状态更新时触发，包括置顶状态。触发后，根据置顶属性，以及会话更新时间重排会话
