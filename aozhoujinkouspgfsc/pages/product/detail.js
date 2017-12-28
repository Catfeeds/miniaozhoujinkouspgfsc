//index.js  
//获取应用实例  
var app = getApp();
//引入这个插件，使html内容自动转换成wxml内容
var WxParse = require('../../wxParse/wxParse.js');
Page({

  data:{
     minusStatuses: ['disabled', 'disabled', 'normal', 'normal', 'disabled'],
    scrollTop: 0,
    id:0,
    png:0,
    shuxing:false,
    bannerApp:true,
    winWidth: 0,
    winHeight: 0,
    currentTab: 0, //tab切换  
    productId:0,
    itemData:{},
    bannerItem:[],
    buynum: 1,
    // 产品图片轮播
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    // 属性选择
    tabArr: {
      curHdIndex: 0,
      curBdIndex: 0
    },
    ggOneID: 0,
    ggTwoID: 0,
    gglist: [],
    attrlen: 0,
    attrlist: [],
    //数据结构：以一组一组来进行设定
    //  commodityAttr:[],
    //  attrValueList: [],
     firstIndex: -1,
     attrValueList: [],
     dataarr: [],
     zs:0,
     clicktype:'',
  },
shuxing:function(e){
 console.log(e);
      var id=e.currentTarget.dataset.id
     var i = true;
     this. setData({
        shuxing:i,
        png:1,
        id:1,
      })
  if (id==1) {
    var i = false;
    this.setData({
      shuxing: i,
      png: 0,
      id: 0,
    })
   }

},

  // 弹窗
  setModalStatus: function (e) {
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    });

    var clicktype = e.currentTarget.dataset.type;
    this.setData({
      clicktype: clicktype,
    });

    this.animation = animation
    animation.translateY(300).step();
    
    this.setData({
      animationData: animation.export()
    })

    if (e.currentTarget.dataset.status == 1) {

      this.setData(
        {
          showModalStatus: true
        }
      );
    }
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation
      })
      if (e.currentTarget.dataset.status == 0) {
        this.setData(
          {
            showModalStatus: false
          }
        );
      }
    }.bind(this), 200)
  },

  //普通产品数量加减
  changeNum: function (e) {
    var that = this;
    var buynum = that.data.buynum;
    var typess = e.target.dataset.typess;
    var stock = that.data.itemData.num;
    if (parseInt(typess) == 0) {
      if (buynum <= 1) {
        that.setData({
          buynum: 1,
        })
      } else {
        that.setData({
          buynum: parseInt(buynum) - 1
        })
      }
    } else {
      if (parseInt(buynum) >= parseInt(stock)){
        that.setData({
          buynum: parseInt(stock),
        })
      } else {
        that.setData({
          buynum: parseInt(buynum) + 1
        })
      }
    };
  },

  //普通产品数量更改
  bindManual: function (e) {
    var that = this;
    var buynum = e.detail.value;
    var stock = that.data.itemData.num;
    if (parseInt(buynum) < 1) {
      that.setData({
        buynum: 1,
      });
    } else if (parseInt(buynum) >= parseInt(stock)) {
      that.setData({
        buynum: parseInt(stock),
      });
    } else {
      that.setData({
        buynum: parseInt(buynum),
      });
    }
  },

  // 有属性产品减
  bindMinus: function (e) {
     var index = parseInt(e.currentTarget.dataset.index);
     var num = this.data.attrlist[index].num;
     // 如果只有1件了，就不允许再减了
     if (num > 0) {
        num--;
     }
     // 只有大于一件的时候，才能normal状态，否则disable状态
     var minusStatus = num <= 0 ? 'disabled' : 'normal';
     // 购物车数据
     var attrlist = this.data.attrlist;
     attrlist[index].num = num;
     // 按钮可用状态
     var minusStatuses = this.data.minusStatuses;
     minusStatuses[index] = minusStatus;
     // 将数值与状态写回
     this.setData({
       attrlist: attrlist,
        minusStatuses: minusStatuses
     });
     this.zudatajian(this.data.attrlist[index]);
  },

  //有属性产品加
  bindPlus: function (e) {
     var index = parseInt(e.currentTarget.dataset.index);
     var num = this.data.attrlist[index].num;
     // 自增
     num++;
     // 只有大于一件的时候，才能normal状态，否则disable状态
     var minusStatus = num <= 0 ? 'disabled' : 'normal';
     // 购物车数据
     var attrlist = this.data.attrlist;
     attrlist[index].num = num;
     // 按钮可用状态
     var minusStatuses = this.data.minusStatuses;
     minusStatuses[index] = minusStatus;
     // 将数值与状态写回
     this.setData({
       attrlist: attrlist,
      minusStatuses: minusStatuses
     });
     this.zudatajia(this.data.attrlist[index]);
  }, 

  //组装数据
  zudatajian: function (arr) {
    var attr_id = this.data.ggOneID;
    var gg_id = arr.id;
    var price = arr.price;
    var stock = arr.stock;
    var keys = attr_id + '-' + gg_id;
    var darr = this.data.dataarr;
    for(var i=0;i<darr.length;i++){
      if (darr[i].keys == keys){
        var thenum = parseInt(darr[i].num);
        if (thenum>0){
          darr[i].num = parseInt(thenum) - 1;
        } else {
          darr[i].num = 0;
        }
        this.setData({
          dataarr: darr,
        });
        this.sum();
        return false;
      }
    }

    var _obj = {};
    _obj.keys = keys;
    _obj.num = arr.num;
    _obj.price = price;
    _obj.stock = stock;
    this.setData({
      dataarr: this.data.dataarr.concat(_obj),
    });
    //计算总数
    this.sum();
  },

  zudatajia: function (arr) {
    var attr_id = this.data.ggOneID;
    var gg_id = arr.id;
    var price = arr.price;
    var stock = arr.stock;
    var keys = attr_id + '-' + gg_id;
    var darr = this.data.dataarr;
    for (var i = 0; i < darr.length; i++) {
      if (darr[i].keys == keys) {
        darr[i].num = parseInt(darr[i].num)+1;
        this.setData({
          dataarr: darr,
        });
        this.sum();
        return false;
      }
    }

    var _obj = {};
    _obj.keys = keys;
    _obj.num = arr.num;
    _obj.price = price;
    _obj.stock = stock;
    this.setData({
      dataarr: this.data.dataarr.concat(_obj),
    });
    //计算总数
    this.sum();
  },

  sum: function () {
    var zs = 0;
    var darr = this.data.dataarr;
    for (var i = 0; i < darr.length; i++) {
      zs += darr[i].num;
    }
    if (zs>0) {
      this.setData({
        zs: zs,
      });
    }else {
      this.setData({
        zs: 0,
      });
    }
    
  },

  // 传值
  onLoad: function (option) {
    console.log(option.productId)
    var that = this;
    that.setData({
      productId: option.productId,
    });
    //that.loadProductDetail();
  },
// 商品详情数据获取
  loadProductDetail:function(){
    console.log(this.data.productId)
    wx.showToast({
      title: '加载中...',
      icon: 'loading'
    });
    var that = this;
    wx.request({
      url: app.d.ceshiUrl + '/Api/Product/index',
      method:'post',
      data: {
        pro_id: that.data.productId,
      },
      header: {
        'Content-Type':  'application/x-www-form-urlencoded'
      },
      success: function (res) {
        //--init data 
        var status = res.data.status;
        if(status==1) {   
          var pro = res.data.pro;
          var content=pro.content;
          var gglist = res.data.gglist;
          var attrlist = res.data.attrlist;
          if (gglist != '' && attrlist!=''){
            that.setData({
              attrlen: 2,
              ggOneID: gglist[0].id,
            });
          } else if (gglist != '' && attrlist=='') {
            that.setData({
              attrlen: 1,
            });
            attrlist = gglist;
          }
          WxParse.wxParse('content', 'html', content, that, 8);
          that.setData({
            itemData:pro,
            bannerItem:pro.img_arr,
            gglist: gglist,
            attrlist: attrlist,
          });
        } else {
          wx.showToast({
            title:res.data.err,
            duration:2000,
          });
        }
      },
      error:function(e){
        wx.showToast({
          title:'网络异常！',
          duration:2000,
        });
      },
    });
  },
// 属性选择
  onShow: function () {
    this.loadProductDetail();
  },

  onReady: function () {
    // 页面渲染完成
    wx.hideToast();
  },
  /* 获取数据 */
  distachAttrValue: function (commodityAttr) {
    // 把数据对象的数据（视图使用），写到局部内
    var attrValueList = this.data.attrValueList;
    // 遍历获取的数据
    for (var i = 0; i < commodityAttr.length; i++) {
      for (var j = 0; j < commodityAttr[i].attrValueList.length; j++) {
        var attrIndex = this.getAttrIndex(commodityAttr[i].attrValueList[j].attrKey, attrValueList);
        // console.log('属性索引', attrIndex); 
        // 如果还没有属性索引为-1，此时新增属性并设置属性值数组的第一个值；索引大于等于0，表示已存在的属性名的位置
        if (attrIndex >= 0) {
          // 如果属性值数组中没有该值，push新值；否则不处理
          if (!this.isValueExist(commodityAttr[i].attrValueList[j].attrValue, attrValueList[attrIndex].attrValues)) {
            attrValueList[attrIndex].attrValues.push(commodityAttr[i].attrValueList[j].attrValue);
          }
        } else {
          attrValueList.push({
            attrKey: commodityAttr[i].attrValueList[j].attrKey,
            attrValues: [commodityAttr[i].attrValueList[j].attrValue]
          });
        }
      }
    }
    // console.log('result', attrValueList)
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        if (attrValueList[i].attrValueStatus) {
          attrValueList[i].attrValueStatus[j] = true;
        } else {
          attrValueList[i].attrValueStatus = [];
          attrValueList[i].attrValueStatus[j] = true;
        }
      }
    }
    this.setData({
      attrValueList: attrValueList
    });
  },
  getAttrIndex: function (attrName, attrValueList) {
    // 判断数组中的attrKey是否有该属性值
    for (var i = 0; i < attrValueList.length; i++) {
      if (attrName == attrValueList[i].attrKey) {
        break;
      }
    }
    return i < attrValueList.length ? i : -1;
  },
  isValueExist: function (value, valueArr) {
    // 判断是否已有属性值
    for (var i = 0; i < valueArr.length; i++) {
      if (valueArr[i] == value) {
        break;
      }
    }
    return i < valueArr.length;
  },
  /* 选择属性值事件 */
  selectAttrValue: function (e) {
    /*
    点选属性值，联动判断其他属性值是否可选
    {
      attrKey:'型号',
      attrValueList:['1','2','3'],
      selectedValue:'1',
      attrValueStatus:[true,true,true]
    }
    console.log(e.currentTarget.dataset);
    */
    var attrValueList = this.data.attrValueList;
    var index = e.currentTarget.dataset.index;//属性索引
    var key = e.currentTarget.dataset.key;
    var value = e.currentTarget.dataset.value;
    if (e.currentTarget.dataset.status || index == this.data.firstIndex) {
      if (e.currentTarget.dataset.selectedvalue == e.currentTarget.dataset.value) {
        // 取消选中
        this.disSelectValue(attrValueList, index, key, value);
      } else {
        // 选中
        this.selectValue(attrValueList, index, key, value);
      }

    }
  },
  /* 选中 */
  selectValue: function (attrValueList, index, key, value, unselectStatus) {
    // console.log('firstIndex', this.data.firstIndex);
    var includeGroup = [];
    if (index == this.data.firstIndex && !unselectStatus) { // 如果是第一个选中的属性值，则该属性所有值可选
      var commodityAttr = this.data.commodityAttr;
      // 其他选中的属性值全都置空
      // console.log('其他选中的属性值全都置空', index, this.data.firstIndex, !unselectStatus);
      for (var i = 0; i < attrValueList.length; i++) {
        for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
          attrValueList[i].selectedValue = '';
        }
      }
    } else {
      var commodityAttr = this.data.includeGroup;
    }

    // console.log('选中', commodityAttr, index, key, value);
    for (var i = 0; i < commodityAttr.length; i++) {
      for (var j = 0; j < commodityAttr[i].attrValueList.length; j++) {
        if (commodityAttr[i].attrValueList[j].attrKey == key && commodityAttr[i].attrValueList[j].attrValue == value) {
          includeGroup.push(commodityAttr[i]);
        }
      }
    }
    attrValueList[index].selectedValue = value;
    this.setData({
      attrValueList: attrValueList,
      includeGroup: includeGroup
    });

    var count = 0;
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        if (attrValueList[i].selectedValue) {
          count++;
          break;
        }
      }
    }
    if (count < 2) {// 第一次选中，同属性的值都可选
      this.setData({
        firstIndex: index
      });
    } else {
      this.setData({
        firstIndex: -1
      });
    }
  },
  /* 取消选中 */
  disSelectValue: function (attrValueList, index, key, value) {
    var commodityAttr = this.data.commodityAttr;
    attrValueList[index].selectedValue = '';

    // 判断属性是否可选
    for (var i = 0; i < attrValueList.length; i++) {
      for (var j = 0; j < attrValueList[i].attrValues.length; j++) {
        attrValueList[i].attrValueStatus[j] = true;
      }
    }
    this.setData({
      includeGroup: commodityAttr,
      attrValueList: attrValueList
    });

    for (var i = 0; i < attrValueList.length; i++) {
      if (attrValueList[i].selectedValue) {
        this.selectValue(attrValueList, i, attrValueList[i].attrKey, attrValueList[i].selectedValue, true);
      }
    }
  },

//添加到收藏
  addFavorites:function(e){
    var that = this;
    wx.request({
      url: app.d.ceshiUrl + '/Api/Product/col',
      method:'post',
      data: {
        uid: app.d.userId,
        pid: that.data.productId,
      },
      header: {
        'Content-Type':  'application/x-www-form-urlencoded'
      },
      success: function (res) {
        // //--init data        
        var data = res.data;
        if(data.status == 1){
          wx.showToast({
            title: '操作成功！',
            duration: 2000
          });
          //变成已收藏，但是目前小程序可能不能改变图片，只能改样式
          that.data.itemData.isCollect = true;
        }else{
          wx.showToast({
            title: data.err,
            duration: 2000
          });
        }
      },
      fail: function() {
        // fail
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    });
  },

  addShopCart:function(e){ //添加到购物车
    var that = this;
    var pro_type = that.data.itemData.pro_type;
    var snum = that.data.buynum;
    var darr = that.data.dataarr;
    var is_buff = that.data.itemData.is_buff;
    if (is_buff>0) {
      var zs = 0;
      for (var i = 0; i < darr.length; i++) {
        zs += darr[i].num;
      }
      if(parseInt(zs)==0){
        wx.showToast({
          title: '请输入产品数量.err-code:540',
          duration: 2000
        });
        return false;
      }
      snum = zs;
    } else {
      if (parseInt(snum)==0){
        wx.showToast({
          title: '请输入产品数量.err-code:548',
          duration: 2000
        });
        return false;
      }
    }

    if (pro_type==2) {
      var xnum = that.data.itemData.yu_num;
      if (parseInt(snum) < parseInt(xnum)){
        wx.showToast({
          title: '未达到产品最低起团数量',
          duration: 2000
        });
        return false;
      }
    }else if (pro_type==3){
      var xnum = that.data.itemData.pifa_num;
      if (parseInt(snum) < parseInt(xnum)) {
        wx.showToast({
          title: '未达到产品最低采购数量',
          duration: 2000
        });
        return false;
      }
    }

    wx.request({
      url: app.d.ceshiUrl + '/Api/Shopping/add',
      method:'post',
      data: {
        uid: app.d.userId,
        pid: that.data.productId,
        num: that.data.buynum,
        darr: JSON.stringify(darr),
        ptype: e.currentTarget.dataset.type,
      },
      header: {
        'Content-Type':  'application/x-www-form-urlencoded'
      },
      success: function (res) {
        // //--init data        
        var data = res.data;
        if(data.status == 1){
          var ptype = e.currentTarget.dataset.type;
          if(ptype == 'buynow'){
            wx.redirectTo({
              url: '../order/pay?cartId='+data.cart_id
            });
            return;
          }else{
            wx.showToast({
                title: '加入购物车成功',
                icon: 'success',
                duration: 2000
            });
          }     
        }else{
          wx.showToast({
                title: data.err,
                duration: 2000
            });
        }
      },
      fail: function() {
        // fail
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    });
  },
  bindChange: function (e) {//滑动切换tab 
    var that = this;
    that.setData({ currentTab: e.detail.current });
  },
  initNavHeight:function(){////获取系统信息
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
  },
  bannerClosed:function(){
    this.setData({
      bannerApp:false,
    })
  },
  // 产品详情、产品参数 切换
  tabFun: function (e) {
    //获取触发事件组件的dataset属性 
    var _datasetId = e.target.dataset.id;
    console.log("----" + _datasetId + "----");
    var _obj = {};
    _obj.curHdIndex = _datasetId;
    _obj.curBdIndex = _datasetId;
    this.setData({
      tabArr: _obj
    });
  },

  // 产品属性 切换
  tabggFun: function (e) {
    var that = this;
    //获取触发事件组件的dataset属性 
    var ggId = e.target.dataset.id;
    that.setData({
      ggOneID: ggId,
    });
    that.getAttrData();
  },

  //属性切换获取数据
  getAttrData: function () {
    var that = this;
    var attrId = that.data.ggOneID;
    wx.request({
      url: app.d.ceshiUrl + '/Api/Product/getattrdata',
      method: 'post',
      data: {
        uid: app.d.userId,
        ggid: attrId,
        pro_id: that.data.productId,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {  
        var status = res.data.status;
        if (status==1) {
        var data = res.data.list;
          that.setData({
            attrlist: data,
          });
        } else {
          wx.showToast({
            title: res.data.err,
            duration: 2000
          });
        }
      },
      fail: function () {
        // fail
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    });
  },

  onShareAppMessage: function () {
    var title = this.data.itemData.name;
    var productId = this.data.itemData.id;
    return {
      title: title,
      path: '/pages/product/detail?productId=' + productId,
      success: function (res) {
        // 分享成功
      },
      fail: function (res) {
        // 分享失败
      }
    }
  }
});
