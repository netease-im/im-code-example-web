/**
 * 常见即时聊天工具会话中，如果两条消息之间时间间隔较大，我们一般会向它们中间插入一条时间消息。
 * 
 * 下面是时间消息计算的简单帮助函数。getRenderMsgList是帮助函数，输入是原消息，输出是含有时间戳的消息队列。
 */

/**
 * 获取页面中渲染的消息列表
 */
function getRenderMsgList(msgArr) {
    const res = []

    for (let i = 0; i < msgArr.length; i++) {
        // 两条消息超过 5 分钟，插入一条自定义时间消息
        if (i > 0 && (msgArr[i].time - msgArr[i - 1].time) > 5 * 60 * 1000) {
            // 插入时间文本
            res.push({
                idClient: 'time-' + msgArr[i].time,
                type: 'custom',
                attach: {
                    type: 'time',
                    value: caculateTimeago(msgArr[i].time)
                },
                status: 'success'
            })
        }

        //插入消息
        res.push(msgArr[i])
    }

    return res
}

function caculateTimeago(dateTimeStamp) {
    const minute = 1000 * 60 // 把分，时，天，周，半个月，一个月用毫秒表示
    const hour = minute * 60
    const day = hour * 24
    const week = day * 7
    const now = new Date().getTime() // 获取当前时间毫秒
    const diffValue = now - dateTimeStamp // 时间差
    let result = ''

    if (diffValue < 0) {
        return t('nowText')
    }
    const minC = Math.floor(diffValue / minute) // 计算时间差的分，时，天，周，月
    const hourC = Math.floor(diffValue / hour)
    const dayC = Math.floor(diffValue / day)
    const weekC = Math.floor(diffValue / week)
    if (weekC >= 1 && weekC <= 4) {
        result = ` ${weekC}周前`
    } else if (dayC >= 1 && dayC <= 6) {
        result = ` ${dayC}天前`
    } else if (hourC >= 1 && hourC <= 23) {
        result = ` ${hourC}小时前`
    } else if (minC >= 1 && minC <= 59) {
        result = ` ${minC}分钟前`
    } else if (diffValue >= 0 && diffValue <= minute) {
        result = '刚刚'
    } else {
        const datetime = new Date()
        datetime.setTime(dateTimeStamp)
        const Nyear = datetime.getFullYear()
        const Nmonth =
            datetime.getMonth() + 1 < 10
                ? `0${datetime.getMonth() + 1}`
                : datetime.getMonth() + 1
        const Ndate =
            datetime.getDate() < 10 ? `0${datetime.getDate()}` : datetime.getDate()
        result = `${Nyear}-${Nmonth}-${Ndate}`
    }
    return result
}
