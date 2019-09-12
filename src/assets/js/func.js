// 功能方法部分
import store from '../../store.js';
import util from './util';
import http from './http';
import { MessageBox } from 'mint-ui';

// 点击开启视频聊天
function chatByVideo(beautyInfo) {
    // 发起创建视频订单的请求
    http.post('order/createOrder.do', {
        buyerId: util.getStorage('loginInfo').userId,
        sellerId: beautyInfo.userId,
        // callFlag: 3,
        callType: 1, // 1.正常呼叫 2.邀请对方呼叫
        orderType: 1, // 1.视频订单 2.语音订单 默认1
        key: 'abc'
    }).then(res => {
        let resData = res.dataCollection;
        if (res.resultCode === 11003) {
            // 余额不足提醒充值
            MessageBox({
                title: '温馨提示',
                message: '您的余额不足，快去充值享受与主播的独处时光吧！',
                showCancelButton: true,
            }).then(action => {
                if (action === 'confirm') {
                    util.goPage('buyDiamond');
                }
            });
            return;

        }

        // 跳转到视频聊天页面
        if (resData.orderRedisId) {
            // 订单号存在才跳转到视频聊天页
            beautyInfo.orderNum = resData.orderRedisId;
            util.goPage({name:'videoChatPage',query:beautyInfo});
        }
    });
}

function saveLoginInfo(resLoginInfo) {
    // 获取需要保存到本地的用户信息
    let loginInfo = {
        yunxinAccid: resLoginInfo.yunxinAccid,
        userId: resLoginInfo.userId,
        session: resLoginInfo.session,
        portrait: resLoginInfo.portrait,
        nickName: resLoginInfo.nickName,
        isBind: resLoginInfo.isBind,
        balance: resLoginInfo.integerMoney
    };
    // 将登陆信息保存到本地
    util.setStorage('loginInfo',loginInfo);
    // 保存用户vip信息
    util.setStorage('vipInfo',{isVip: resLoginInfo.isVip}, sessionStorage);
}

export default {
    chatByVideo,
    saveLoginInfo
}
