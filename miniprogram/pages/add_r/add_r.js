// pages/add_r/add_r.js
const app = getApp()
let { formatDate } = require('../../utils/format.js')
Page({
  data: {
    corner_id: '',
    book_id: '',
    disable: true,
    max_day: 0,
    disable2: true,
    ifRegister: false,
    book_name: '书名尚未查询',
    corner_name: '图书角尚未查询',
    borrow_name: '还未编写',
    step3able: false,
    state: 0,
    index: 0,
    repayInfo: true
  },
  onLoad: function (options) {
    const vm = this
    vm.setData({
      statusBarHeight: getApp().globalData.statusBarHeight,
      titleBarHeight: getApp().globalData.titleBarHeight
    })
    // 查询此用户是否注册身份
    const db = wx.cloud.database()
    const users = db.collection('personal_users')
    users.where({
      openid: app.globalData.openid
    }).get({
      success(res) {
        console.log(res)
        if (res.data[0]) {
          console.log("已注册")
          app.globalData.name = res.data[0].name
          vm.data.ifRegister = true
        } else {
          console.log("未注册")
          vm.data.ifRegister = false
        }
      },
      fail(res) {
        wx.showToast({
          icon: 'none',
          title: '查询信息出错',
        })
        return
      }
    })
  },
  repay: function(e) {
    console.log(e)
    let id = parseInt(e.target.id)
    this.setData({
      repayInfo: false,
      corner_id: this.data.book_record[id].corner_id,
      book_id: this.data.book_record[id].book_isbn,
    })
    let that = this
    console.log(e)
    this.setData({
      repayInfo: true,
    })
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const t = res.tempFilePaths
        that.handleRepay(t)
      }
    })
  },
  handleRepay: function(path) {
    wx.cloud.callFunction({
      name: 'repayBook',
      data: {
        path, 
        corner_id: this.data.corner_id,
        isbn: this.data.book_id,
        date: formatDate(new Date())
      },
      success: res => {
        wx.showToast({
          title: '还书成功',
          icon: "success",
        })
        this.getBook_record()
      },
      fail: err => {
        console.log(err)
        wx.showToast({
          title: '操作失败'  ,
          icon: 'none',
        })
      }
    })
  },
  bindChange: function (e) {
    var that = this;
    that.setData({
      index: e.detail.current
    });
    switch (e.detail.current) {
      case 0:
        that.data.state = 0
        break;
      case 1:
        that.data.state = 1
        break;
      case 2:
        that.data.state = 2
        break;
    }
  },
  gotoregister: function () {
    wx.navigateTo({
      url: '../register_r/register_r',
    });
  },
  toggle(e) {
    if (this.data.index === e.currentTarget.dataset.index) {
      return false;
    } else {
      this.setData({
        index: e.currentTarget.dataset.index
      })
    }
    if (this.data.index === '1') {
      this.getBook_record()
    }
  },
  getBook_record: function () {
    const db = wx.cloud.database({});
    db.collection('book_record').where({
      //筛选数据
      corner_id: app.globalData.cornerId
    }).get({
      success: res => {
        console.log('查询成功', res.data);
        this.setData({
          book_record: res.data
        })
        console.log('输出成功');
      },
      fail: err => {
          wx.showToast({
          title: '查询失败'  ,
          icon: 'none',
        })
      }  
    })
    // this.setData({
    //   book_record: [{
    //     book_name: "test",
    //     corner_name: "test",
    //     book_isbn: "1",
    //     corner_id: '1',
    //     borrow_time: "2019-9-9"
    //   }, {
    //     book_isbn: "1",
    //       corner_id: '1',
    //       book_name: "test",
    //       corner_name: "test",
    //       borrow_time: "2019-9-9"
    //     }]
    // })
  },
  handleUpdate(e) {
    if (!this.data.ifRegister) {
      wx.showToast({
        icon: 'none',
        title: '请先完善资料',
      })
      return
    }
    this.setData({
      disable: false
    })
  },
  modalBindcancel(e) {
    this.setData({
      disable: true
    })
  },
  modalBindaconfirm(e) {
    this.setData({
      disable: true
    })
    wx.showLoading({
      title: '正在查找',
    })
    setTimeout(function () {
      wx.hideLoading()
    }, 500)
    const db = wx.cloud.database({});
    db.collection('corner_detail').where({
      //筛选数据
      corner_id: this.data.corner_id
    }).get({
      success: res => {
        console.log(res)
        if (res.data[0]) {
          console.log('查询成功', res.data);
          this.setData({
            corner_name: res.data[0].title,
            max_day: res.data[0].max_day,
            step3able: true
          })
        } else {
          wx.showModal({
            title: '查询失败',
            showCancel: false,
            content: `没有这个图书角`,
            success(res) {
              if (res.confirm) {
                wx.navigateBack({
                  detal: 1
                })
              }
            }
          })
        }
      },
      fail: err => {
        wx.showModal({
          title: '查询失败',
          showCancel: false,
          content: `没有这个图书角`,
          success(res) {
            if (res.confirm) {
              wx.navigateBack({
                detal: 1
              })
            }
          }
        })
        console.error('查询记录失败', err)
      }
    })
    console.log(this.data.corner_name)
  },
  inputconner_id(e) {
    this.setData({
      corner_id: e.detail.value
    })
    console.log(this.data.corner_id)
  },
  handleUpdate2(e) {
    if (!this.data.ifRegister) {
      wx.showToast({
        icon: 'none',
        title: '请先完善资料',
      })
      return
    }
    if (!this.data.step3able) {
      wx.showToast({
        icon: 'none',
        title: '请先填写图书角',
      })
      return
    }
    this.setData({
      disable2: false
    })
  },
  handleScan() {
    if (!this.data.ifRegister) {
      wx.showToast({
        icon: 'none',
        title: '请先完善资料',
      })
      return
    }
    if (!this.data.step3able) {
      wx.showToast({
        icon: 'none',
        title: '请先填写图书角',
      })
      return
    }
    // 允许从相机和相册扫码
    wx.scanCode({
      onlyFromCamera: true,
      scanType: ['barCode'],
      success: res => {
        this.setData({
          book_id: res.result
        })
        this.borrowBook()
      },
      fail: err => {
        wx.showToast({
          icon: "none",
          title: '服务器出错'
        })
      }
    })
  },
  modalBindcancel2(e) {
    this.setData({
      disable2: true
    })
  },
  modalBindaconfirm2(e) {
    this.setData({
      disable2: true
    })
    this.borrowBook()
  },
  borrowBook() {
    wx.showLoading({
      title: '正在查找',
    })
    setTimeout(function () {
      wx.hideLoading()
    }, 300)

    //查询并借书
    const db = wx.cloud.database({})
    const that = this
    db.collection('book_detail').where({
      //筛选数据
      corner_id: this.data.corner_id,
      book_isbn: this.data.book_id
    }).get({
      success: res => {
        console.log(res)
        if (!res.data[0]) {
          wx.showModal({
            title: '借书失败',
            showCancel: false,
            content: `图书角中没有录入这本书`,
            success(res) {
              if (res.confirm) {
                wx.navigateBack({
                  detal: 1
                })
              }
            }
          })
        }
        const total = res.data[0].total
        if (res.data[0].borrowed_num === total) {
          wx.showToast({
            title: '这本书被借过啦！',
            icon: 'none',
            duration: 2000
          })
          return
        }
        this.setData({
          book_name: res.data[0].title
        });
        wx.showModal({
          title: '提示消息',
          content: `是否借阅 《${res.data[0].title}》 ？`,
          success(res) {
            if (res.confirm) {
              that.onSubmit()
            } else if (res.cancel) {
              // console.log('用户点击取消')
            }
          }
        })
        console.log('输出成功');
        console.log(that.data.book_name)
      },
      fail: err => {
        wx.showToast({
          title: '借书失败',
          icon: 'none',
          duration: 2000
        })
        console.error('查询记录失败', err)
      }
    })
  },
  inputbookid(e) {
    this.setData({
      book_id: e.detail.value
    })
  },
  onSubmit() {
    const db = wx.cloud.database()
    const that = this
    const {
      formatDate,
      addedDate
    } = require("../../utils/format")
    const now = formatDate(new Date())
    const end = addedDate(parseInt(that.data.max_day))
    const data = {
      book_isbn: that.data.book_id,
      book_name: that.data.book_name,
      corner_id: that.data.corner_id,
      corner_name: that.data.corner_name,
      openid: app.globalData.openid,
      borrow_name: app.globalData.name,
      borrow_time: now,
      repay_time: end,
      state: "未还"
    }
    wx.cloud.callFunction({
      name: 'borrowBook',
      data: {
        book_id: that.data.book_id,
        corner_id: that.data.corner_id,
        data,
      },
      success: res => {
        console.log(res)
        const {
          msg,
          code
        } = res.result
        if (code === 0)
          wx.reLaunch({
            url: "../index_r/index_r"
          })
        else
          wx.showToast({
            title: '借书失败',
            content: msg,
            icon: 'none',
            duration: 2000
          })
      },
      fail: err => {
        wx.showToast({
          title: '借书失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  }
})