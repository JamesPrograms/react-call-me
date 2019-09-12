<template>
    <div class="wrap">
        <div class="call-part"
             :style="{backgroundImage: `url(${util.getStorage('loginInfo').portrait})`}"
             v-show="!isReceivedStream"
        >
            <div class="call-modal">
                <div class="call-modal">
                    <img :src="beautyInfo.portrait" class="beauty-portrait">
                    <p class="name-rank">
                        <span class="name">{{beautyInfo.nickName}}</span>
                        <img :src="beautyInfo.gradeIcon" class="rank">
                    </p>
                    <p class="tip">正在等待对方接收你的邀请...</p>
                    <img src="../assets/image/video-chat/icon_warm.png" class="icon-warm">
                    <p class="warm-1">通过过程中严禁出现任何涉及色情、淫秽、政治、赌博、暴力等违反国家法律法规的内容，一经发现我们将立即对账号进行封停处理</p>
                    <p class="warm-2">要求到其他平台进行交易大多是诈骗行为请举报</p>
                    <img src="../assets/image/video-chat/icon_hang_up.png" class="hang-up-btn" @click="hangUp('close')">
                </div>
            </div>
        </div>

        <div class="video-chat-part" v-show="isReceivedStream">
            <div class="remote-video-stream" id="remoteVideoStream"></div>

<!--            <div id="localVideoStream" class="local-video-stream" v-if="isSafari"></div>-->

            <img src="../assets/image/icon/icon_play.png" class="play-btn" v-show="isPlayBtnShow" @click="playRemoteVideo">

            <div class="buttom-part">
                <img class="reward-icon" src="../assets/image/video-chat/icon_gift.png" @click="showGiftList">
                <ChatEditorInVideo></ChatEditorInVideo>
            </div>

            <div class="chat-close-time-show">
                <img src="../assets/image/video-chat/icon_close.png" class="close" @click="hangUp">
                <div class="time-show">
                    <img src="../assets/image/video-chat/icon_time.png">
                    <span class="chat-time">{{$store.state.chatTime}}</span>
                </div>
                <div class="complain-micphone">
<!--                    <img src="../assets/image/video-chat/icon_report.png" @click="showComplainBox" :class="{'has-local-video':isSafari}">-->
<!--                    <img src="../assets/image/video-chat/icon_micphone.png" class="micphone-icon" @click="toHaveBetterChat" v-if="!isSafari">-->

                    <!-- 现在都提醒用户下载 -->
                    <img src="../assets/image/video-chat/icon_report.png" @click="showComplainBox">
                    <img src="../assets/image/video-chat/icon_micphone.png" class="micphone-icon" @click="toHaveBetterChat">
                </div>
<!--                <p class="title" v-if="!isSafari">畅快聊</p>-->

                <!-- 现在都提醒用户下载 -->
                <p class="title">畅快聊</p>
            </div>

            <!-- 举报弹窗 -->
            <ComplainLobo v-if="isComplainBoxShow" v-model="isComplainBoxShow"></ComplainLobo>

            <!-- 打赏弹窗 -->
            <RewardLobo v-if="isGiftBoxShow" v-model="isGiftBoxShow"></RewardLobo>
        </div>
    </div>
</template>

<script>
    import agoraFunc from '../assets/js/agoraFunc';
    import { MessageBox } from 'mint-ui';

    export default {
        name: 'videoChatPage',
        components: {
            ComplainLobo: require('../components/ComplainLobo.vue').default,
            RewardLobo: require('../components/RewardLobo.vue').default,
            ChatEditorInVideo: require('../components/ChatEditorInVideo.vue').default,
        },
        data() {
            return {
                isDownloadTipShow: false,
                client: null,
                isComplainBoxShow: false,
                isGiftBoxShow: false,
                isMuted: false, // 静音标志
                isMuteVideo: false, // 禁止床送本地视频标志
                isPlayBtnShow: true, // 播放按钮显示的标志
            }
        },
        computed: {
            beautyInfo() {
                return this.$route.query;
            },
            isReceivedStream() {
                return this.$store.state.isReceivedStream;
            },
            isSafari() {
                console.log('isSafari：' + this.util.isSafari());
                return this.util.isSafari();
            }
        },
        mounted() {
            // 将接收流的标志重置为false
            this.$store.commit('setStreamTag', false);
            // 将挂断标志置为0
            this.$store.commit('setBreakVideoTag', 0);
            // 建立通话链接前先将显示时间清空
            this.$store.commit('updateChatTime', '00:00');
            // 建立和远程流的连接
            this.client = agoraFunc.connectRemoteStream(this.beautyInfo, 'remoteVideoStream', 'localVideoStream');
        },
        methods: {
            // 主动挂断
            hangUp(close) {
                let _this = this;
                this.leaveChannel(function(){
                    if (close === 'close') {
                        // agora离开房间
                        _this.client.leave();
                        console.log('未接通主动挂断');
                        _this.util.goBack(); // 有goback标签，说明是点击的关闭按钮(此时已经订阅到远端流)
                    } else {
                        console.log('已接通主动挂断');
                        _this.$store.commit('setBreakVideoTag', 2);
                    }
                });
            },
            // 离开频道的方法
            leaveChannel(callback) {
                let _this = this,
                    loginInfo = _this.util.getStorage('loginInfo');
                this.http.post('order/videoCallRequestHttp.do', {
                    fromUserId: loginInfo.userId,
                    toUserId: _this.beautyInfo.userId,
                    orderId: _this.beautyInfo.orderNum,
                    yunxinMsgId: '',
                    yunxinId: loginInfo.yunxinAccid,
                    type: 2,
                    orderType: 1,
                    session: loginInfo.session
                }).then(res => {
                    callback();
                });
            },

            // 点击显示礼物列表
            showGiftList() {
                this.isGiftBoxShow = true;
            },

            showComplainBox() {
                this.isComplainBoxShow = true;
            },

            toHaveBetterChat() {
                // 都提醒用户去下载
                let _this = this;
                MessageBox({
                    title: '温馨提示',
                    message: '需要下载App去体验畅快聊，马上下载体验?',
                    confirmButtonText: '确定',
                    showCancelButton: true,
                }).then(action => {
                    if (action === 'confirm') {
                        _this.util.downLoadApp('guide');
                    }
                });


                /*let curDevice = this.util.curDevice(),
                _this = this;
                // android端提醒用户去下载
                if (curDevice === 'android') {
                    MessageBox({
                        title: '温馨提示',
                        message: '需要下载App去体验畅快聊，关闭当前通话去下载?',
                        confirmButtonText: '确定',
                        showCancelButton: true,
                    }).then(action => {
                        if (action === 'confirm') {
                            _this.leaveChannel(function(){
                                _this.util.downLoadApp('guide');
                            });
                        }
                    });
                }
                // ios端提醒用户关闭去体验
                if (curDevice === 'ios') {
                    MessageBox({
                        title: '温馨提示',
                        message: '体验畅快聊之前，当前通话将被关闭',
                        confirmButtonText: '关闭去体验',
                        showCancelButton: true,
                    }).then(action => {
                        if (action === 'confirm') {
                            _this.leaveChannel(function(){
                                _this.util.goBack();
                                _this.$store.commit('setChatGuidTag',true);
                            });
                        }
                    });
                }*/
            },

            playRemoteVideo() {
                // 获取渲染远端视频流的播放控件video
                let remoteVideo = document.querySelector("#remoteVideoStream").querySelector("video");
                remoteVideo.play();
                this.isPlayBtnShow = false;
            },

            mutedSwitch() {
                let remoteStream = window.remoteStream;
                if (!remoteStream) {
                    return;
                }

                if (this.isMuted) {
                    // 放出声音
                    remoteStream.setAudioVolume(50);
                } else {
                    // 静音
                    remoteStream.setAudioVolume(0);
                }
                this.isMuted = !this.isMuted;
            },
            mutedVideoSwitch() {
                let localStream = window.localStream;
                if (!localStream) {
                    return;
                }

                if (this.isMuteVideo) {
                    // 禁止向远端发送视频
                    localStream.muteVideo();
                } else {
                    // 向远端发送视频
                    localStream.play('localVideoStream');
                }
                this.isMuteVideo = !this.isMuteVideo;
            }
        }
    }
</script>

<style lang="less" scoped>
    .wrap {
        width: 100%;
        height: 100%;
    }

    .call-part {
        width: 100%;
        height: 100%;
        background-size: cover;
    }

    .call-modal {
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, .6);
        overflow: hidden;

        .beauty-portrait {
            width: 0.9rem;
            height: 0.9rem;
            display: block;
            margin: 0.45rem auto 0;
            border-radius: 100%;
        }

        .name-rank {
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 0.2rem;

            .name {
                font-size: 0.18rem;
                color: #FFFFFF;
            }

            .rank {
                width: 0.22rem;
                height: 0.12rem;
                margin-left: 0.05rem;
            }
        }

        .tip {
            font-size: 0.14rem;
            color: #FFFFFF;
            text-align: center;
            margin-top: 0.1rem;
        }

        .icon-warm {
            width: 0.25rem;
            height: 0.25rem;
            display: block;
            margin: 0.5rem auto 0;
        }

        .warm-1 {
            width: 2.77rem;
            font-size: 0.12rem;
            color: whitesmoke;
            text-align: center;
            margin: 0.21rem auto 0;
            line-height: 0.18rem;
        }

        .warm-2 {
            font-size: 0.12rem;
            color: #FFFFFF;
            font-weight: 600;
            text-align: center;
            width: 2.2rem;
            margin: 0.14rem auto 0;
            line-height: 0.18rem;
        }

        .hang-up-btn {
            width: 0.8rem;
            height: 0.8rem;
            border-radius: 100%;
            display: block;
            margin: 0.5rem auto 0;
        }
    }

    .video-chat-part {
        width: 100%;
        height: 100%;
        position: relative;

        .remote-video-stream {
            width: 100%;
            height: 100%;
        }

        .local-video-stream {
            width: 0.72rem;
            height: 1.28rem;
            position: absolute;
            top: 0.1rem;
            right: 0.1rem;
            border-radius: 0.05rem;
            z-index: 3;
        }
    }

    .play-btn {
        width: 0.42rem;
        height: 0.42rem;
        position: absolute;
        left:50%;
        top:50%;
        transform:translate(-50%,-50%);
    }

    .buttom-part {
        position: absolute;
        width: 100%;
        height: 0.5rem;
        left: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.70);
        padding: 0 0.2rem;
        box-sizing: border-box;

        .reward-icon {
            width: 0.34rem;
            height: 0.34rem;
            border-radius: 100%;
            position: absolute;
            right: 0.1rem;
            top: -0.45rem;
        }
    }

    .chat-close-time-show {
        position: absolute;
        top: 0.15rem;
        left: 0;
        padding: 0 0.15rem;
        box-sizing: border-box;
        width: 100%;
        height: 0.26rem;
        display: flex;
        justify-content: space-between;
        z-index: 3;

        .close {
            width: 0.26rem;
            height: 0.26rem;
        }

        .time-show {
            height: 0.26rem;
            margin-left: 0.05rem;
            display: flex;
            box-sizing: border-box;
            padding: 0.05rem 0.1rem 0.05rem 0.05rem;
            background: rgba(36, 34, 30, .3);
            border-radius: 1rem;
            font-size: 0.14rem;
            align-items: center;
            color: #FFFFFF;

            img {
                width: 0.16rem;
                height: 0.16rem;
            }

            .chat-time {
                margin-left: 0.05rem;
            }
        }
        .complain-micphone {
            img {
                width: 0.26rem;
                height: 0.26rem;
            }
            .micphone-icon {
                margin-left: 0.12rem;
            }
            .has-local-video {
                margin-right: 1.5rem;
            }
        }
        .title {
            position: absolute;
            bottom: -0.16rem;
            right: 0.1rem;
            font-size: 0.1rem;
            color: #F9517E;
        }
    }
</style>
