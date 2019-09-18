/**
 * 共通方法
 */

import http from './http.js';
import global from './global.js'; // 引入全局常量
import md5 from 'js-md5'; // 引入md5加密
import {Toast} from 'antd-mobile'
const usrAgent = window.navigator.userAgent; // user agent

// 跳转到指定页面
const goPage = function (option) {
    console.log(22)
};

// 返回上一页
const goBack = function () {
    // router.go(-1);
};

// 设置请求头
const setRequestInfo = function (config) { // config为axios的config
    const loginInfo = this.getStorage('loginInfo');
    if (loginInfo) {
        config.headers.session = loginInfo.session;
        config.headers.userId = loginInfo.userId;
    } else {
        config.headers.session = '';
        config.headers.userId = '';
    }
};

// 判断当前是否是微信浏览器
function isWechatEnv () {
    if (usrAgent.toLowerCase().match(/MicroMessenger/i) == 'micromessenger') {
        return true;
    } else {
        return false;
    }
}

// 判断当前是否是qq浏览器
const isQqBrowser = function () {
    if (usrAgent.indexOf(' qq') > -1 && usrAgent.indexOf('mqqbrowser') < 0) {
        //qq内置浏览器
        return true;
    }
    if (usrAgent.indexOf('mqqbrowser') > -1 && usrAgent.indexOf(" qq") < 0) {
        //qq浏览器
        return true;
    }
    return false;
};

// 判断是否是safari浏览器
function isSafari() {
    if (usrAgent.indexOf("Safari") > -1 && usrAgent.indexOf("Chrome") === -1) {
        return true;
    } else {
        return false;
    }
}

function curDevice () {
    if (usrAgent.indexOf('Android') > -1 || usrAgent.indexOf('Adr') > -1) { //android终端
        return 'android';
    }
    if (!!usrAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) { // ios终端
        return 'ios';
    }
}

const stringifyDate = function (datetime, simple = false) {
    // let weekMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    let weekMap = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    datetime = new Date(datetime)
    let year = datetime.getFullYear()
    let simpleYear = datetime.getYear() - 100
    let month = datetime.getMonth() + 1
    month = month > 9 ? month : '0' + month
    let day = datetime.getDate()
    day = day > 9 ? day : '0' + day
    let hour = datetime.getHours()
    hour = hour > 9 ? hour : '0' + hour
    let min = datetime.getMinutes()
    min = min > 9 ? min : '0' + min
    let week = datetime.getDay()
    week = weekMap[week]
    let thatDay = (new Date(year, month - 1, day, 0, 0, 0)).getTime()

    if (simple) {
        return {
            withYear: `${day}/${month}/${simpleYear}`,
            withMonth: `${month}-${day}`,
            withDay: `${week}`,
            withLastDay: `昨天`,
            withHour: `${hour}:${min}`,
            thatDay
        }
    } else {
        return {
            withYear: `${year}-${month}-${day} ${hour}:${min}`,
            withMonth: `${month}-${day} ${hour}:${min}`,
            withDay: `${week} ${hour}:${min}`,
            withLastDay: `昨天 ${hour}:${min}`,
            withHour: `${hour}:${min}`,
            thatDay
        }
    }
};

// 格式化日期
const formatDate = function (datetime, simple = false) {
    let tempDate = (new Date()).getTime()
    let result = stringifyDate(datetime, simple)
    let thatDay = result.thatDay
    let deltaTime = (tempDate - thatDay) / 1000
    if (deltaTime < 3600 * 24) {
        return result.withHour
    } else if (deltaTime < 3600 * 24 * 2) {
        return result.withLastDay
    } else if (deltaTime < 3600 * 24 * 7) {
        return result.withDay
    } else if (deltaTime < 3600 * 24 * 30) {
        return result.withMonth
    } else {
        return result.withYear
    }
};

const setStorage = function (key, value, type = localStorage) {
    if (typeof value === 'object') {
        value = JSON.stringify(value);
    }
    type.setItem(key, value);
};

const getStorage = function (key, type = localStorage) {
    let value = type.getItem(key);
    if (value) {
        if (value.includes('[') || value.includes('{')) {
            value = JSON.parse(value);
        }
        return value;
    } else {
        return '';
    }
};

const rmStorage = function (key, type = localStorage) {
    type.removeItem(key);
};

// 判断时间戳是否是今天的时间
const isTodayTime = function (time) {
    // 将时间戳转化成日期格式
    let dateTime = new Date(parseInt(time)).toDateString();
    // 判断是否是当天时间
    if (dateTime === new Date(+new Date()).toDateString()) {
        return true;
    }
    return false;
};

// 获取url中的参数
const getParamByName = function (name) {
    /*let match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.href);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' ').replace('#', ''));*/
};

// 封装toast
const toast = function (msg,cb) {
    Toast.info(msg,1.5,()=> {
        if (cb) {
            cb();
        }
    })
};

const getVipInfo = function () {
    return this.getStorage('vipInfo',sessionStorage);
};

// 向服务端请求下载链接并进行下载
const getDownloadUrl = function (func) {
    let localDownloadInfo = getStorage('downloadInfo', sessionStorage);
    // 获取下载链接信息并保存
    if (!localDownloadInfo) {
        localDownloadInfo = {};
        http.post('user/userCenter/getH5DownloadUrl', {
            extraOption: {
                noLoading: true
            }
        }).then(res => {
            for (let urlInfo of res.dataCollection) {
                if (urlInfo.type === '1') {
                    localDownloadInfo.iosUrl = urlInfo['downloadUrl'];
                }
                if (urlInfo.type === '2') {
                    localDownloadInfo.androidUrl = urlInfo['downloadUrl'];
                }
            }
            // 将请求到的下载地址保存到本地
            setStorage('downloadInfo', localDownloadInfo, sessionStorage);
            func(localDownloadInfo);
        });
    } else {
        func(localDownloadInfo);
    }
};

// 根据不同系统的设备跳转到不同下载地址
const jumpToDownloadUrl = function (downloadInfo, type, cpsChain) {
    let curDev = curDevice(),
        isWechatDev = isWechatEnv();

    if (curDev === 'ios') {
        // location.href = downloadInfo['iosUrl'];
    } else if (curDev === 'android') {
        if (!isWechatDev) {
            // location.href = downloadInfo['androidUrl'];
        } else {
            // 跳转到下载的落地页
            goPage({name: 'downloadPage',query: {type,cpsChain: cpsChain || ''}});
        }
    }
};

// 根据情况进行并进行下载
const downLoadApp = function (type,cpsChain) {
    let cpsChainList = getStorage('cpsChain') || cpsChain,
        downloadInfo = {};
    // 根据链接中是否有渠道参数拼接下载路径
    if (cpsChainList) {
        cpsChainList[2] = '25';
        // 获取本地地址并进行下载
        getDownloadUrl(function (localDownloadInfo) {
            if (localDownloadInfo.iosUrl.indexOf('?') !== -1) {
                downloadInfo.iosUrl = `${localDownloadInfo.iosUrl}&user_channel_chain=${cpsChainList.join('_')}`;
            } else {
                downloadInfo.iosUrl = `${localDownloadInfo.iosUrl}?user_channel_chain=${cpsChainList.join('_')}`;
            }

            if (localDownloadInfo.androidUrl.indexOf('?') !== -1) {
                downloadInfo.androidUrl = `${localDownloadInfo.androidUrl}&user_channel_chain=${cpsChainList.join('_')}`;
            } else {
                downloadInfo.androidUrl = `${localDownloadInfo.androidUrl}?user_channel_chain=${cpsChainList.join('_')}`;
            }

            // 跳转到相应链接进行下载
            jumpToDownloadUrl(downloadInfo, type, cpsChainList.join('_'));
        });
    } else {
        downloadInfo.iosUrl = `${global.downloadIosAppUrl}`;
        downloadInfo.androidUrl = `${global.downloadAndroidAppUrl}`;
        jumpToDownloadUrl(downloadInfo, type);
    }
};

// 跳到到登陆成功后的页面
const jumpToAimPage = function () {
    // let willEnterPage = store.state.willEnterPage;
    // // store中有目标页面，则跳转到目标页面
    // if (willEnterPage) {
    //     goPage(willEnterPage);
    // } else {
    //     // 否则跳转到首页
    //     goPage('beautyList');
    // }
};

// 微信内置浏览器拉起微信支付
const _wxChargeInWechat = function (chargeMoney, type) {
    http.get('finance/sign/smallProgram/getWechatSign.do', {
        key: md5(`xiaochengxuweixchongz${chargeMoney}`),
        type, // 1.视频内充值 2.视频外充值 3.购买特殊身份,4 vip 支付
        money: chargeMoney,
    }).then(res => {
        let sign = res.dataCollection || {}; // 获取接口相关参数
        if (!sign.sign) {//后端返回空对象的情况
            toast('获取微信支付签名失败');
            return;
        }

        // 微信内置浏览器调用支付形式
        /*WeixinJSBridge.invoke(
            'getBrandWCPayRequest',
            {
                appId: sign.appId,     //公众号名称，由商户传入
                timeStamp: sign.timeStamp,   //时间戳，自1970年以来的秒数
                nonceStr: sign.nonceStr, //随机串
                package: sign.package,
                signType: sign.signType,  //微信签名方式：
                paySign: sign.sign //微信签名
            },
            function (res) {
                if (res.err_msg == "get_brand_wcpay_request:ok") {
                    // 更新余额
                    http.get('user/userCenter/getUserMoney.do', {
                        key: '3ed0db41584e118b1da414ead871a782',
                        extraOption: {
                            noLoading: true
                        }
                    }).then(res => {
                        // 设置钻石余额
                        let balance = res.dataCollection;
                        // store.commit('setBalance',balance);
                    });
                    // 支付成功提示
                    toast('支付成功！');
                }
                if (res.err_msg == "get_brand_wcpay_request:cancel") {
                    toast('支付已取消');
                }
                if (res.err_msg == "get_brand_wcpay_request:fail") {
                    toast('支付失败');
                }
            }
        );*/

    }).catch(err => {
        toast('微信支付失败');
    });
};

// 微信外浏览器调用微信支付
const _wxChargeOutWechat = function (chargeMoney, type) {
    http.get('finance/sign/getWechatSign.do', {
        key: md5(`huoaquaweixinachongz${chargeMoney}`),
        type, // 1.视频内充值 2.视频外充值 3.购买特殊身份,4 vip 支付
        money: chargeMoney,
        os: 1,
        version: '1.0.0',
        packageName: 'guoliao.H5',
        channel: 1
    }).then(res => {
        let sign = res.dataCollection || {};
        if (!sign.prepayid || !sign.package) {//后端返回空对象的情况
            toast('获取微信支付签名失败！');
            return;
        }

        // let redirect_url = encodeURIComponent(location.href + '/#/recharge_callback');//返回结果回调地址
        // let wechatHref = "https://wx.tenpay.com/cgi-bin/mmpayweb-bin/checkmweb?prepay_id=" + sign.prepayid + "&package=" + sign.package + "&redirect_url=" + redirect_url;
        // window.location.href = wechatHref;

    }).catch(err => {
        toast('微信支付失败');
    });
};

const wechatCharge = function (chargeMoney, type) {
    // 微信内置浏览器拉起微信支付
    /*if (window.WeixinJSBridge) {
        _wxChargeInWechat(chargeMoney, type);
    } else {
        // 微信外浏览器调用微信支付
        _wxChargeOutWechat(chargeMoney, type);
    }*/
};

// 验证手机号
const checkPhoneNum = function(phoneNum) {
    if (!phoneNum.length) {
        toast('请输入手机号码');
        return false;
    }

    if (!(/^1[34578]\d{9}|[9]{5}\d{6}$/.test(phoneNum))) {
        toast('手机号码不正确');
        return false;
    }
    return true;
};

// 解决微信浏览器中，input失焦页面没有滚回原来位置的bug
function resizeScroll() {
    document.body.scrollTop = 0;
}

// 根据value(秒数)格式化时间
function formatTime(value) {
    const formatNumber = n => { //格式化时间中添0操作
        n = n.toString();
        return n[1] ? n : '0' + n;
    };
    let secondTime = parseInt(value);// 秒
    let minuteTime = 0;// 分
    let hourTime = 0;// 小时
    if (secondTime > 60) {//如果秒数大于60，将秒数转换成整数
        minuteTime = parseInt(secondTime / 60);//获取分钟，除以60取整数，得到整数分钟
        secondTime = parseInt(secondTime % 60); //获取秒数，秒数取佘，得到整数秒数
        if (minuteTime > 60) { //如果分钟大于60，将分钟转换成小时
            hourTime = parseInt(minuteTime / 60);//获取小时，获取分钟除以60，得到整数小时
            minuteTime = parseInt(minuteTime % 60); //获取小时后取佘的分，获取分钟除以60取佘的分
        }
    }
    if (hourTime > 0) {//含小时
        return formatNumber(parseInt(hourTime)) + ":" + formatNumber(parseInt(minuteTime)) + ":" + formatNumber(parseInt(secondTime))
    }
    if (minuteTime > 0) {//含分
        return formatNumber(parseInt(minuteTime)) + ":" + formatNumber(parseInt(secondTime));
    }
    return "00:" + formatNumber(parseInt(secondTime));
}

// 因为声网的限定，暂对safari和ios中的微信开发视频通话功能
function isSupportVideoChat() {
    if (!global.hasVideoChat) {
        return false;
    }
    if (global.isDevEnv) {
        return true;
    }
    if (isSafari()) {
        return true;
    }
    if (isWechatEnv() && curDevice() === 'ios') {
        return true;
    }
    return false;
}

export default {
    goPage,
    goBack,
    setRequestInfo,
    isWechatEnv,
    isQqBrowser,
    curDevice,
    formatDate,
    setStorage,
    getStorage,
    rmStorage,
    isTodayTime,
    getParamByName,
    toast,
    getVipInfo,
    downLoadApp,
    jumpToAimPage,
    wechatCharge,
    checkPhoneNum,
    resizeScroll,
    formatTime,
    isSafari,
    isSupportVideoChat
}
