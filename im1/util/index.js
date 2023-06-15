export function getSessionIdFromMsg(msg, myAccount) {
    // 在群中，不管 from 是不是自己，sessionId 都要取 to
    const { from, to, scene } = msg
    let target = ''
    if (scene === 'p2p') {
        if (from === myAccount) {
            target = to
        } else {
            target = from
        }
    } else {
        target = to
    }
    const sessionId = `${scene}-${target}`
    return sessionId
}