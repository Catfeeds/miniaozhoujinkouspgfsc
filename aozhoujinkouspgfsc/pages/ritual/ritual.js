// pages/panic/panic.js
var app = getApp();
Page({
  data:{
    nullHouse: true,  //先设置隐藏
    VerifyCode:'发送',
    lol:true,
    linkTel:'',
    authType:0,
    vou:[],
    thecode:'',
    codes:'',
    vouId:0,
  },
  aa: function () {
    this.setData({
      nullHouse: true, //弹窗隐藏
    })
  },

  clickArea: function (e) {
    var that = this;
    var vouId = parseInt(e.currentTarget.dataset.vouid);
    this.setData({
      nullHouse: false, //弹窗显示
      vouId: vouId,
    })
  },

  //点击领取事件
  getvou:function(e){
    var vid = e.currentTarget.dataset.vid;
    var uid = app.d.userId;
    wx.request({
      url: app.d.ceshiUrl + '/Api/Voucher/get_voucher',
      method:'post',
      data: {vid:vid,uid:uid},
      header: {
        'Content-Type':  'application/x-www-form-urlencoded'
      },
      success: function (res) {  
        var status = res.data.status;
        if(status==1){
          wx.showToast({
            title: '领取成功！',
            duration: 2000
          });
        }else{
          wx.showToast({
            title: res.data.err,
            duration: 2000
          });
        }
        //endInitData
      },
      fail:function(e){
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      },
    });
  },
      
  // 页面初始化 options为页面跳转所带来的参数
  onLoad:function(options){
    var that = this;
    wx.request({
      url: app.d.ceshiUrl + '/Api/Voucher/index',
      method:'post',
      data: {
        uid: app.d.userId
      },
      header: {
        'Content-Type':  'application/x-www-form-urlencoded'
      },
      success: function (res) { 
        var vou = res.data.vou;
        that.setData({
          vou:vou,
          authType: res.data.authtype,
        });
      },
      error:function(e){
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      },
    });
  },

  //手机输入框遗失光标则获取value然后把数据放入this.data.linkTel中去
  blurTel: function (e) {
  var linkTel = e.detail.value.replace(/\s/g, "");
    this.setData({
      linkTel: linkTel
    })
  },

  //验证码输入框失去焦点
  blurCode: function (e) {
    var codes = e.detail.value;
    this.setData({
      codes: codes
    })
  },

  //验证手机验证码
  checkcode: function (e) {
    var that = this;
    var codes = that.data.codes;
    var thecode = that.data.thecode;
    if (!codes || codes!=thecode) {
      wx.showToast({
        title: '验证码错误！',
        duration: 2000
      });
      return false;
    }
    that.getuservou();
  },

  //手机验证 领取优惠券事件
  getuservou: function (e) {
    var that = this;
    var vid = that.data.vouId;
    var uid = app.d.userId;
    var tel = that.data.linkTel;
    wx.request({
      url: app.d.ceshiUrl + '/Api/Voucher/get_vou',
      method: 'post',
      data: { vid: vid, uid: uid, tel: tel },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var status = res.data.status;
        if (status == 1) {
          wx.showToast({
            title: '领取成功！',
            duration: 2000
          });
          this.setData({
            nullHouse: true, //弹窗隐藏
          })
        } else {
          wx.showToast({
            title: res.data.err,
            duration: 2000
          });
        }
        //endInitData
      },
      fail: function (e) {
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      },
    });
  },

  //点击发送验证码，获取手机号码，往后台发送数据
  setVerify: function (e) {
    var that = this;
    var linkTel = that.data.linkTel;
    if (!linkTel) {
      wx.showToast({
        title: '请输入手机号码！',
        duration: 2000
      });
      return false;
    }
    
    wx.request({
      url: app.d.ceshiUrl + '/Api/Voucher/get_code',
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: { 
        tel: linkTel,
        uid: app.d.userId
      },
      success: function (res) {
        var status = res.data.status;
        console.log(res.data);
        if (status == 1) {
          wx.showToast({
            title: '验证码发送成功！',
            duration: 2500
          });
          var total_micro_second = 60 * 1000;    //表示60秒倒计时，想要变长就把60修改更大
          //验证码倒计时
          count_down(that, total_micro_second);
          that.setData({
            lol: false,
            thecode: res.data.codes
          });
        }else{
          wx.showToast({
            title: res.data.err,
            duration: 2000
          });
        }
      },
      fail: function (res) {
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      },
    });
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



//下面的代码在page({})外面
/* 毫秒级倒计时 */
function count_down(that, total_micro_second) {
  if (total_micro_second <= 0) {
    that.setData({
      VerifyCode: "重新发送",
      lol:true
    });
    // timeout则跳出递归
    return;
  }

  // 渲染倒计时时钟
  that.setData({
    VerifyCode: date_format(total_micro_second) + " 秒"
  });

  setTimeout(function () {
    // 放在最后--
    total_micro_second -= 10;
    count_down(that, total_micro_second);
  }, 10)



}

// 时间格式化输出，如03:25:19 86。每10ms都会调用一次
function date_format(micro_second) {
  // 秒数
  var second = Math.floor(micro_second / 1000);
  // 小时位
  var hr = Math.floor(second / 3600);
  // 分钟位
  var min = fill_zero_prefix(Math.floor((second - hr * 3600) / 60));
  // 秒位
  var sec = fill_zero_prefix((second - hr * 3600 - min * 60));// equal to => var sec = second % 60;
  // 毫秒位，保留2位
  var micro_sec = fill_zero_prefix(Math.floor((micro_second % 1000) / 10));

  return sec;
}

// 位数不足补零
function fill_zero_prefix(num) {
  return num < 10 ? "0" + num : num
}