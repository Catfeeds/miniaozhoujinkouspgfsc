// pages/classify/classify.js
var app = getApp();
Page({
  data:{
    // 供求
    page:1,
    catId:0,
    ptype:'',
    atype:'',
    proData:[],
    keyword: '',
    no0:false,
    no1: false,
    no2: false,
    tabArr: {
      curHdIndex: '',
      curBdIndex: '',
    },
    tab:0,
    bei:false,
    dequ:'分类',
    huxing:'价格',
    paxing:'上新',
    catList: [],
    prices: [],
    times: [],
  },
  // tab切换
  tabFun: function (e) {
    //获取触发事件组件的dataset属性 
    var _datasetId = e.target.dataset.id;
    if (_datasetId==0){
         this.setData({
           no0:true,
           no1:false,
           no2: false,
           tab: 1
         })
         }
      if (_datasetId == 1) {
           this.setData({
             no1: true,
             no0: false,
             no2: false,
             tab: 1
           })
   }
      if (_datasetId == 2) {
        this.setData({
          no2: true,
          no1: false,
          no0: false,
          tab: 1
        })
      }
    var _obj = {};
    _obj.curHdIndex = _datasetId;
    _obj.curBdIndex = _datasetId;
    this.setData({
      tabArr: _obj,
      bei:true,
      tab: 1
    })
  },
kk:function(){
  this.setData({
    no0: false,
    no1: false,
    no2: false, tab: 0
  });
},

//分类 筛选项点击操作
filter0: function (e) {
  var that = this
  var _dataset = e.currentTarget.dataset.id;
  var title = e.currentTarget.dataset.txt;
  that.setData({
    dequ: title,
    catId: _dataset,
    page: 1
  });
  that.loadData();
},

filter1: function (e) {
  var that = this;
  var _dataset = e.currentTarget.dataset.id;
  var title = e.currentTarget.dataset.txt;
  that.setData({
    huxing: title,
    atype: _dataset,
    page: 1
  });
  that.loadData();
},

filter2: function (e) {
    var that=this
    var _dataset = e.currentTarget.dataset.id;
    var title = e.currentTarget.dataset.txt;
    that.setData({
      paxing: title,
      ptype: _dataset,
      page:1
    });
    that.loadData();
},

onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var title = options.title;
    wx.setNavigationBarTitle({ title: title });
    var that = this;
    that.loadData();
  },

  //点击加载更多
  getMore: function (e) {
    var that = this;
    that.loadData();

  },

  //加载数据
  loadData: function (e) {
    var that = this;
    //设置当前分类标题
    var page = that.data.page;
    //ajax请求数据
    wx.request({
      url: app.d.ceshiUrl + '/Api/Product/pifa_list',
      method: 'post',
      data: {
        cat_id: that.data.catId,
        ptype: that.data.ptype,
        atype: that.data.atype,
        page: page
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var proList = res.data.pro;
        var catList = res.data.clist;
        if (proList==''){
          wx.showToast({
            title: '没有找到更多数据！',
            duration: 2000
          });
          return false;
        }
        that.setData({
          proData: proList,
          catList: catList,
          prices: res.data.price,
          times: res.data.times,
          page: parseInt(page)+1
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

  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})