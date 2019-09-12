<template>
    <div class="chat-editor">
        <input type="text" class="msg-input"
               @blur="util.resizeScroll"
               v-model="inputMsg"
               placeholder="请输入您要说的话">
        <p class="show-msg" v-show.trim="isShowMsg">{{inputMsg}}</p>
        <span class="send-icon" :class="{'active-send-btn': inputMsg}" @click="sendMsg"></span>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                inputMsg: '',
                isShowMsg: false
            }
        },
        methods: {
            sendMsg() {
                let _this = this;

                // 有输入内容才能发送消息
                if (_this.inputMsg) {
                    let queryParams = _this.$route.query,
                        loginInfo = _this.util.getStorage('loginInfo'),
                        content = {
                            content: _this.inputMsg,
                            type: '5', // 写死传5
                            orderID: queryParams.orderNum,
                            nickName: loginInfo.nickName,
                       };
                    content = JSON.stringify(content);

                    // 发送消息
                    let msgId = nim.sendCustomSysMsg({
                        scene: 'p2p',
                        to: _this.$route.query.yunxinId,
                        content: content,
                        sendToOnlineUsersOnly: false,
                        apnsText: content,
                        done: _this.sendCustomSysMsgDone
                    });
                }
            },
            // 消息发送成功后的回调方法
            sendCustomSysMsgDone(error, msg) {
                console.log('发送' + msg.scene + '自定义系统通知' + (!error?'成功':'失败') + ', id=' + msg.idClient);

                let _this = this;

                // 显示发出的消息
                _this.isShowMsg = true;
                // 2秒后隐藏显示的消息并清空input框
                setTimeout(() => {
                    _this.isShowMsg = false;
                    _this.inputMsg = '';
                },2000);
            }
        }
    }
</script>

<style lang="less" scoped>
    @import "../assets/less/variable";

    .chat-editor {
        width: 100%;
        height: 100%;
        display: flex;
        position: absolute;
        left: 0;
        bottom: 0;
        padding: 0 0.16rem;
        box-sizing: border-box;
        justify-content: space-between;
        align-items: center;
        .msg-input {
            display: block;
            width: 3rem;
            height: 0.36rem;
            padding: 0 0.16rem;
            font-size: 0.16rem;
            color: #333333;
            box-sizing: border-box;
            border-radius: 0.8rem;
        }
        .send-icon {
            width: 0.24rem;
            height: 0.24rem;
            background-image: url('../assets/image/video-chat/icon_send_default.png');
            background-size: cover;
        }
        .active-send-btn {
            background-image: url('../assets/image/video-chat/icon_send_active.png');
            background-size: cover;
        }

        .show-msg {
            background-color: rgba(0,0,0,.4);
            border-radius: 1rem;
            font-size: 0.16rem;
            color: #FFFFFF;
            max-width: 2.95rem;
            box-sizing: border-box;
            padding: 0.1rem 0.15rem;
            position: absolute;
            line-height: 0.2rem;
            left: 0.19rem;
            bottom: 0.75rem;
            word-break: break-all;
            overflow: hidden;
        }
    }
</style>
