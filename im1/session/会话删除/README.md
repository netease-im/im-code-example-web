IM 1 提供了两种方式删除会话：deleteLocalSession，以及 clearServerHistoryMsgsWithSync。

这两个函数的作用有一定重叠之处。

# 函数作用解析

## deleteLocalSession

1. [可选] 删除服务器中漫游消息
2. 删除内存中会话。该作用影响 getLocalSessions 返回结果。对于大部分用户来说，该作用可忽略。

## clearServerHistoryMsgsWithSync

1. [可选] 删除服务器中漫游消息
2. 删除服务器中历史消息

# 使用场景

## 彻底删除当前会话的所有内容
