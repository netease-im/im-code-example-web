/**
 * 该示例代码展示如何撤回消息，以及如何点击再次编辑等等
 */
function recallMsg(msg) {
    nim.recallMsg({
        msg: msg,
        done: function (err, data) {
            if (err) {
                console.error('撤回失败')
            } else {

            }
        }
    })
}
