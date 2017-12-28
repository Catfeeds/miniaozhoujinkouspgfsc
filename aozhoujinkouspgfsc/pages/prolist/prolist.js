var app = getApp()
Page({
  data: {
    current: 0,
    shopList: [],
    ptype:'',
    title:'儿童服饰商城',
    page:2,
    catId:0,
    tabArr:
    {
      curHdIndex: 0
    },
    clist:[],
    cid:0,
  },
  // tab切换
  tabFun: function (e) {
    //获取触发事件组件的dataset属性 
    var _datasetId = e.target.dataset.id;

    var _obj = {};
    _obj.curHdIndex = _datasetId;
    this.setData({
      tabArr: _obj,
      cid: _datasetId,
    });
    this.sortlist();
  },
showModal: function () {
    // 显示遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
      showModalStatus: true
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200)
 },
hideModal: function () {
  // 隐藏遮罩层
  var animation = wx.createAnimation({
   duration: 200,
   timingFunction: "linear",
   delay: 0
  })
  this.animation = animation
  animation.translateY(300).step()
  this.setData({
   animationData: animation.export(),
  })
  setTimeout(function () {
   animation.translateY(0).step()
   this.setData({
    animationData: animation.export(),
    showModalStatus: false
   })
  }.bind(this), 200)
},

//点击加载更多
getMore:function(e){
  var that = this;
  var page = that.data.page;
  wx.request({
      url: app.d.ceshiUrl + '/Api/Product/getlist_more',
      method:'post',
      data: {
        page:page,
        ptype:that.data.ptype,
        cat_id:that.data.catId,
        cid: that.data.cid
      },
      header: {
        'Content-Type':  'application/x-www-form-urlencoded'
      },
      success: function (res) {  
        var prolist = res.data.pro;
        if(prolist==''){
          wx.showToast({
            title: '没有更多数据！',
            duration: 2000
          });
          return false;
        }
        //that.initProductData(data);
        that.setData({
          page: page+1,
          shopList:that.data.shopList.concat(prolist)
        });
        //endInitData
      },
      fail:function(e){
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    })
},

onLoad: function (options) {
  var objectId = options.title;
  //更改头部标题
  wx.setNavigationBarTitle({
      title: objectId,
  });

    //页面初始化 options为页面跳转所带来的参数
    var cat_id = options.cat_id;
    var ptype = options.ptype;
    var that = this;
    that.setData({
      ptype: ptype,
      catId: cat_id
    })
    //ajax请求数据
    wx.request({
      url: app.d.ceshiUrl + '/Api/Product/getlists',
      method:'post',
      data: {
        cat_id:cat_id,
        ptype:ptype
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var shoplist = res.data.pro;
        var clist = res.data.clist;
        if (shoplist==''){
          wx.showToast({
            title: '没有找到该分类下的产品！',
            duration: 2000
          });
          return false;
        }
        that.setData({
          shopList: shoplist,
          clist: clist,
        })
      },
      error: function(e){
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    })

  },

sortlist: function (e) {
  var that = this;
  var cat_id = that.data.catId;
  var ptype = that.data.ptype;
  var cid = that.data.cid;

  //ajax请求数据
  wx.request({
    url: app.d.ceshiUrl + '/Api/Product/getlists',
    method: 'post',
    data: {
      cat_id: cat_id,
      ptype: ptype,
      cid: cid,
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    success: function (res) {
      var shoplist = res.data.pro;
      that.setData({
        shopList: shoplist,
      })
    },
    error: function (e) {
      wx.showToast({
        title: '网络异常！',
        duration: 2000
      });
    }
  })

},

  switchSlider: function (e) {
    this.setData({
      current: e.target.dataset.index
    })
  },
  changeSlider: function (e) {
    this.setData({
      current: e.detail.current
    })
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  }

})
