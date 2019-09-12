<template>
    <div class="chat-editor">
        <div class="input-send">
            <input type="text"
                   v-model.trim="inputMsg"
                   class="input-comp"
                   @blur="util.resizeScroll"
            >
            <span class="send-btn"
                  :class="{'send-btn-active': inputMsg}"
                  @click="sendMsg"></span>
        </div>

        <div class="edit-btn">
            <img src="../assets/image/im/icon_yy2.png" class="audio" @click="showDownloadBox">
            <img src="../assets/image/im/icon_Video_chat.png"
                 class="video"
                 v-if="$route.query.netid !== 'sys_buyer'"
                 @click="chatByVideo">
            <img src="../assets/image/im/icon_img.png" class="img-send-btn" @click="showDownloadBox">
        </div>

        <!-- 下载提示弹窗 -->
        <MyConfirmMsgBox v-model="isMsgBoxShow"></MyConfirmMsgBox>

        <MyConfirmMsgBox2 v-model="isMsgTipBox" :type="msgBoxType"></MyConfirmMsgBox2>
    </div>
</template>

<script>
    import {sendMsg} from '../assets/js/im/msgs.js';

    export default {
        name: 'chatEditor',
        data() {
            return {
                isMsgBoxShow: false,
                inputMsg: '',
                isVip: this.util.getVipInfo().isVip,
                isMsgTipBox: false,
                msgBoxType: 'rewardTip'
            }
        },

        props: {
            yunxinId: {
                type: String,
                default () {
                    return ''
                }
            },
        },

        mounted() {
            // 是否显示奖励提示, 不是vip且第一次进入页面才显示
            let leftMsg = this.util.getStorage('leftMsg');
            if (this.isVip === 0) {
                // 第一次登陆使用消息功能，判断是否存有leftMsg
                if (leftMsg === '') {
                    this.isMsgTipBox = true;
                    this.util.setStorage('leftMsg',10);
                } else {
                    // 不是第一次使用消息功能，则判断最后一次发送的是否是当天时间
                    let lastMsgSentTime = this.util.getStorage('lastMsgSendTime') || 0;  // 最后一条消息发送时的时间戳
                    if (!this.util.isTodayTime(lastMsgSentTime)) {
                        this.util.setStorage('leftMsg',10);
                    }
                }
            }
        },
        components: {
            MyConfirmMsgBox: require('../components/MyConfirmMsgBox.vue').default,
            MyConfirmMsgBox2: require('../components/MyConfirmMsgBox2.vue').default
        },
        methods: {
            showDownloadBox() {
                // 安卓系统中的微信，弹窗提示
                if (this.util.isWechatEnv() && this.util.curDevice() === 'android') {
                    this.util.downLoadApp('tip');
                } else {
                    this.isMsgBoxShow = true;
                }
            },

            sendMsg() {
                if (this.inputMsg) {
                    // 非vip情况下,对剩余msg条数做处理
                    if (!this.isVip) {
                        let leftMsg = parseInt(this.util.getStorage('leftMsg'));
                        if ( leftMsg === 0) {
                            this.isMsgTipBox = true;
                            this.msgBoxType = 'noMoreMsg';
                            return;
                        }
                    }

                    // 输入框有值才能发送
                    let loginInfo = this.util.getStorage('loginInfo');
                    sendMsg({
                        type: 'text',
                        scene: 'p2p',
                        to: this.yunxinId,
                        text: this.inputMsg,
                        custom: {
                            netid: loginInfo.yunxinAccid,
                            userid: loginInfo.userId,
                            nickname: loginInfo.nickName,
                            headurl: loginInfo.portrait,
                            gradeHeadUrl: loginInfo.gradeHeadUrl ? loginInfo.gradeHeadUrl : "",
                            userType: 0
                        },
                    });
                    this.inputMsg = null;
                }

            },

            chatByVideo() {
                let loginInfo = this.util.getStorage('loginInfo');

                // 1. 如果没有绑定手机号，则提醒用户绑定
                if (loginInfo.isBind !== 1) {
                    this.$store.commit('setBindBoxTag', {
                        type: 'bindPhoneBox',
                        isBindPhoneBoxShow: true
                    });
                    return;
                }
                // 2. 判断当前设备是否支持视频播放，不支持则提醒下载
                if (!this.util.isSupportVideoChat() && !Global.hasVideoChat) {
                    if (this.util.isWechatEnv() && this.util.curDevice() === 'android') {
                        this.util.downLoadApp('tip');
                    } else {
                        this.isMsgBoxShow = true;
                    }
                    return;
                }
                // 3. 获取主播基本信息并调用发放进行播放
                let reqBeautyInfo = this.$route.query;
                let beautyInfo = {
                    userId: reqBeautyInfo.userid,
                    portrait: reqBeautyInfo.headurl,
                    nickName: reqBeautyInfo.nickname,
                    gradeIcon: '', // todo: 此处暂时没有等级图标
                    yunxinId: reqBeautyInfo.yunxinId,
                };
                this.func.chatByVideo(beautyInfo);
            }
        }
    }
</script>

<style lang="less" scoped>
    @import "../assets/less/variable";

    .chat-editor {
        position: fixed;
        left: 0;
        bottom: 0;
        width: 100%;
        z-index: 2;
        background-color: @white;
        .input-send {
            width: 100%;
            box-sizing: border-box;
            height: 0.36rem;
            padding: 0 0.07rem 0 0.1rem;
            display: flex;
            justify-content: space-between;
            .input-comp {
                width: 88%;
                height: 100%;
                font-size: 0.14rem;
                background-color: @gray1;
                border-radius: 0.04rem;
                text-indent: 0.05rem;
            }
            .send-btn {
                width: 0.36rem;
                height: 100%;
                background-image: url('../assets/image/im/icon_send message.png');
                background-size: cover;
            }
            .send-btn-active {
                background-image: url('../assets/image/im/icon_send messageh.png');
                background-size: cover;
            }
        }

        .edit-btn {
            width: 100%;
            box-sizing: border-box;
            padding: 0.17rem 0.32rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            .audio {
                height: 0.2rem;
            }
            .video,.img-send-btn {
                height: 0.16rem;
            }
        }
    }
</style>
