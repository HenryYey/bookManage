/**
 * 还书
 * @params:
 * path {string}
 * book_isbn {string}
 * corner_id {string}
 */
const cloud = require('wx-server-sdk')
// 初始化 cloud
cloud.init()
exports.main = async (event, context) => {
  const path = event.path
  const book_isbn = event.book_isbn
  const date = event.date
  const corner_id = event.corner_id
  const db = cloud.database()
  let code = 0
  let msg = '修改成功'
  const _ = db.command
    await db.collection('book_detail').where({
      corner_id
    }).update({
      // data 传入需要局部更新的数据
      data: {
        borrowed_num: _.inc(-1)
      },
      success(res) {
        console.log(res.data)
      },
      fail(err) {
        code = 1,
        msg = '找不到图书信息'
      }
    })

    await db.collection('book_record').where({
      corner_id,
      // openid不要自己传，用sdk自带的
      openid: event.userInfo.openId,
      book_isbn
    }).update({
      // data 传入需要局部更新的数据
      data: {
        state: "已还",
        repay_time: date
      },
      success(res) {
        console.log(res.data)
      },
      fail(err) {
        code = 1,
        msg = '找不到图书信息'
      }
    })
  return {
    code,
    msg
  }
}