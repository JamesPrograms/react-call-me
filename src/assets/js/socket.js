import global from "./global";
import util from "./util";
import store from '../../store';

export default function (beautyInfo) {
    // 初始化io
    let socket = io.connect(global.socketUrl());

    // 定义变量
    let loginInfo = util.getStorage('loginInfo'),
        heartBeatInfo = {
            userId: loginInfo.userId,
            orderRedisId: beautyInfo.orderNum,
            status: 2, // 1 -开始,2 -5秒开始计费,3 -进行中 4 -结束
            session: loginInfo.session,
        },
        time = 0,
        timer;


    // 监听socket连接情况
    socket.on('connect', res => {
        console.log(res);
        if (res && res.resultCode === 1701) {
            console.log('Socket连接成功');
        }
    });

    // 登陆socket
    socket.emit('login300', JSON.stringify({
        userId: loginInfo.userId,
        session: loginInfo.session,
        version: '3.0.0',
        device: 'browswer',
        productCode: 1,
    }), res => {
        if (res.resultCode === 1701) {
            console.log('socket登录成功');
        }
    });

    // 监听拨打视频和挂断视频
    socket.on('videoCallRequest', res => {
        res = JSON.parse(res);
        if (res.type === 2) {
            console.log("视频通话请求-对方挂断");
            store.commit('setBreakVideoTag', 3);
            // 直接返回上一页
            util.goBack();
        }
        if (res.type === 3) {
            console.log("视频通话请求-呼叫超时")
            store.commit('setBreakVideoTag', 1);
            // 直接返回上一页
            util.goBack();
        }
    });

    // 监听socket是否断开连接
    socket.on('disconnect', (reason) => {
        console.log("socket断开，网络连接失败");
        if (timer) {
            clearInterval(timer);
        }
    });

    // 将封装好的socket加入全局
    window.mySocket = socket;

    // 心跳发送定时器
    return function(timer) {
        timer = setInterval(() => {
            // 5秒后发送第一次心跳
            if (time === 5) {
                socket.emit('videoCallHeartBeat', JSON.stringify(heartBeatInfo), res => {
                    console.log('5秒后发送心跳resultCode:' + res.resultCode);
                    if (res.resultCode === 1701) {
                        // 更新余额
                        store.commit('setBalance',res.dataCollection.buyerMoney);
                        console.log("5秒发送视频心跳成功-开始计费！")
                    }
                })
            } else
            // 5秒后，每隔30秒发送一次
            if (time > 5 && (time - 5) % 30 === 0) {
                // 更新状态为进行中
                heartBeatInfo.status = 3;
                socket.emit('videoCallHeartBeat', JSON.stringify(heartBeatInfo), res => {
                    console.log('每30秒后发送心跳resultCode:' + res.resultCode);
                    if (res.resultCode === 1701) { // 更新余额
                        store.commit('setBalance',res.dataCollection.buyerMoney)
                    } else if (res.resultCode === 17007) { // 用户余额不足三分钟
                        util.toast('当前通话余额不足三分钟了，请充值！');
                    } else if (res.resultCode === 17006) { // 余额不足
                        util.toast('您当前余额不足');
                        store.commit('setBreakVideoTag', 4);
                    } else if (res.resultCode === 17009) { // 订单异常
                        util.toast('通话订单异常');
                        store.commit('setBreakVideoTag', 5);
                    } else {//其他异常情况
                        store.commit('setBreakVideoTag', 6);
                    }
                })
            }

            // 如果通话中断或异常
            if (store.state.willBreakVideoTag) {
                console.log('接通后主动挂断标志变化：'+ store.state.willBreakVideoTag);
                // 更新状态为结束
                heartBeatInfo.status = 4;
                    socket.emit('videoCallHeartBeat', JSON.stringify(heartBeatInfo), res => {
                    let breakInfoObj = {
                        1: "呼叫超时",
                        3: "对方挂断了您的通话",
                        4: "余额不足,即将挂断",
                        5: "通话订单异常",
                        6: "通话出现异常，即将挂断"
                    };

                    // 离开房间
                    window.agoraClient.leave();

                    // 清除定时器
                    if (timer) {
                        clearInterval(timer);
                    }

                    // 返回视频页的前一页
                    if (breakInfoObj.hasOwnProperty(store.state.willBreakVideoTag)) { // store中的willBreakVideoTag为通话中断标志: 1 -呼叫超时，2 -主动挂断，3 -对方挂断，4 -余额不足挂断，5 -订单异常，6 -其他异常
                        // 如果需要提醒用户，则提醒用户后再跳转到通话前页面
                        util.toast(breakInfoObj[store.state.willBreakVideoTag]);
                        setTimeout(() => util.goBack(),1500);
                    } else {
                        // 直接返回上一页
                        util.goBack();
                    }
                })
            }
            // 更新聊天时间
            if (time > 5) {
                store.commit('updateChatTime',util.formatTime(time - 5));
            }
            time++; //每一秒加1
        }, 1000);
    };
}
