import global from './global';
import util from './util';
import http from './http';
import store from '../../store';
import socketConnect from './socket';

/*
* 连接远端流
*/
function connectRemoteStream(beautyInfo, remotePlayId, localPlayId) {
    // 获取通话需要的常量
    let webRtcInfo = global.webRtcInfo;
    // 获取本地存储的登陆信息
    let loginInfo = util.getStorage('loginInfo');

    // 1. 创建通话实例
    let client = AgoraRTC.createClient({mode: webRtcInfo.mode, codec: webRtcInfo.codec});
    // 2. 初始化
    client.init(webRtcInfo.appId, function () {
        console.log("AgoraRTC初始化成功！");

        // 3. 加入频道
        client.join(webRtcInfo.appId, beautyInfo.orderNum, loginInfo.userId, function (uid) {
            console.log("用户" + uid + "成功加入频道");

            client.setClientRole("host", function () {
                console.log("setHost success");
            }, function (e) {
                console.log("setHost failed", e);
            })

            // 4. 向远端发起通话请求
            http.post('order/videoCallRequestHttp.do', {
                fromUserId: loginInfo.userId,
                toUserId: beautyInfo.userId,
                orderId: beautyInfo.orderNum,
                yunxinMsgId: '',
                yunxinId: loginInfo.yunxinAccid,
                type: 1,
                orderType: 1,
                session: loginInfo.session
            }).then(res => {
                // 邀请对方成功后初始化socket
                let timerFunc = socketConnect(beautyInfo);
                // 订阅远端流
                _subscribeStream(client, beautyInfo, remotePlayId, timerFunc);

                // 如果是safari才发布本地流
                /*if (util.isSafari()) {
                    // 发布本地流
                    _publishStream(client, uid, localPlayId);
                }*/
            });

        }, function (err) {
            console.log("加入频道失败", err);
        });

    }, function (err) {
        console.log("AgoraRTC初始化失败", err);
    });
    window.agoraClient = client;
    return client;
}

/*
* 订阅远端流
**/
function _subscribeStream(client, beautyInfo, playId, timerFunc) {
    // 订阅远端视频流
    client.on('stream-added', function (evt) {
        let stream = evt.stream;
        console.log('有新的音视频流: ', stream);
        client.subscribe(stream, function (err) {
            console.log('订阅音视频流失败', err);
        });
    });
    client.on('first-video-frame-decode', function (evt) {
        console.log('first-video-frame-decode', evt);
    });
    // 订阅远程视频
    client.on('stream-subscribed', function (evt) {
        console.log('订阅远程音视频流成功！');

        timerFunc();

        if (!store.state.isReceivedStream) {
            store.commit('setStreamTag', true);
        }

        let remoteStream = evt.stream;

        // 将remoteStream加入全局
        window.remoteStream = remoteStream;

        remoteStream.play(playId, {
            fit: 'cover',
            muted: false
        });
    });
}

/*
* 发布本地流
**/
function _publishStream(client, uid, playId) {
    // 创建本地流
    let localStream = AgoraRTC.createStream({
            streamID: uid,
            audio: true,
            video: true,
            screen: false
        }
    );

    // 初始化创建的流
    localStream.init(function () {
        if (!store.state.isReceivedStream) {
            store.commit('setStreamTag', true);
        }
        console.log("创建流成功");
        // 播放本地流
        localStream.play(playId);
    }, function (err) {
        console.log("创建本地流失败", err);
    });

    // 发布本地流
    client.publish(localStream, function (err) {
        console.log("发布本地流失败" + err);
    });
    client.on('stream-published', function (evt) {
        // 将localStream加入全局
        window.localStream = localStream;
        console.log("发布本地流成功");
    });
}

export default {
    connectRemoteStream
}
