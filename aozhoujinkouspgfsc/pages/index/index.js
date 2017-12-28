var app = getApp();

//index.js
Page({
  data: {
    authType:0,
    imgUrls: [],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    circular: true,

    shop:[],
    // 滑动
    imgUrl: [],

    kb:[],
    list:[],
    // 六张图片
    productData:[],
  huanhang:'\n'
  },

  //广告图点击事件
  advtap: function (e) {
    var that = this;
    var tztype = e.currentTarget.dataset.type;
    var action = e.currentTarget.dataset.action;
    if (tztype == 'procat') {
      //分类商品列表页
      wx.navigateTo({
        url: '../listdetail/listdetail?cat_id=' + parseInt(action),
      });
    } else if (tztype == 'prolist') {
      //商品列表页
      wx.navigateTo({
        url: '../listdetail/listdetail',
      });
    } else if (tztype == 'pro') {
      //商品详情页
      wx.navigateTo({
        url: '../product/detail?productId=' + parseInt(action),
      });
    } else if (tztype == 'shoplist') {
      //商铺列表页
      wx.navigateTo({
        url: '../shop/shop',
      });
    } else if (tztype == 'shop') {
      //商铺详情页
      wx.navigateTo({
        url: '../shop_store/shop_store?shopId=' + parseInt(action),
      });
    } else if (tztype == 'join') {
      //加盟合作页
      wx.navigateTo({
        url: '../personal/personal',
      });
    } else if (tztype == 'vou') {
      //新人体验区
      wx.navigateTo({
        url: '../ritual/ritual',
      });
    } else if (tztype == 'tgys') {
      //团购预售区
      wx.navigateTo({
        url: '../slide/mei',
      });
    } else {

    }
  },

  liu:function(e){
    console.log(e.currentTarget.dataset.id)
    var proId = parseInt(e.currentTarget.dataset.id);
    wx.navigateTo({
      url: '../product/detail?productId=' + proId,
    });
  },

//后四个分类跳转
other: function(e){
  var ptype =e.currentTarget.dataset.ptype;
  var title =e.currentTarget.dataset.text;
  if (ptype == 'xrtyq'){
    wx.navigateTo({
      url: '../ritual/ritual?title=' + title
    });
  } else if (ptype =='cgzx'){
    var authType = this.data.authType;
    if (parseInt(authType)==1) {
      //已认证就跳转采购商品列表
      wx.navigateTo({
        url: '../classify/classify?title=' + title
      });
    }else{
      //没有认证就跳转认证页面
      wx.navigateTo({
        url: '../personal/personal'
      });
    }
  } else if (ptype =='yszq'){
    wx.navigateTo({
      url: '../slide/mei?title=' + title
    });
  } else if (ptype =='sjrz'){
    wx.navigateTo({
      url: '../personal/personal?title=' + title
    });
  } else if (ptype == 'gywm') {
    wx.navigateTo({
      url: '../synopsis/synopsis?title=' + title
    });
  } else if (ptype == 'shop') {
    wx.navigateTo({
      url: '../shop/shop?title=' + title
    });
  }
},

//跳转商家列表
jj:function(e){
  wx.navigateTo({
    url: '../shop/shop',
  })
},

//跳转商家详情页面
shopDetails:function(e){
    var shopId = parseInt(e.currentTarget.dataset.id);
    wx.navigateTo({
      url: '../shop_store/shop_store?shopId=' + shopId,
    })
},

  onLoad: function (options) {

  },

  onShow: function () {
    wx.showToast({
      title: '加载中...',
      icon: 'loading'
    });
    var that = this;
    wx.request({
      url: app.d.ceshiUrl + '/Api/Index/index',
      method:'post',
      data: { uid: app.d.userId},
      header: {
        'Content-Type':  'application/x-www-form-urlencoded'
      },
      success: function (res) {  
        console.log(res.data.prolist);
        var ggtop = res.data.ggtop;
        var procat = res.data.procat;
        var prolist = res.data.prolist;
        var shop = res.data.shop;
        var first = res.data.first;
        var authType = res.data.authtype;
        var list = res.data.list;
        app.d.authType = authType;
        that.setData({
          imgUrls:ggtop,
          proCat:procat,
          productData:prolist,
          shop:shop,
          kb:first,
          authType: authType,
          list:list,
        });
      },
      fail:function(e){
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      },
    })
  },

  onReady: function () {
    // 页面渲染完成
    wx.hideToast();
  },

  onShareAppMessage: function () {
    return {
      title: '澳洲进口食品官方商城',
      desc: '澳洲进口食品官方商城!',
      path: '/pages/index/index',
      success: function(res) {
        // 分享成功
      },
      fail: function(res) {
        // 分享失败
      }
    }
  },

  //   搜索
  suo: function () {
    wx.navigateTo({
      url: '../search/search',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },

  //跳转分类
  list: function (e) {
    var cid = e.currentTarget.dataset.cid;
    var title = e.currentTarget.dataset.title;
    wx.navigateTo({
      url: '../prolist/prolist?cat_id=' + cid + '&title=' + title,
    });
  },
});