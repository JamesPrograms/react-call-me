<template>
    <div class="chat-list">
        <div class="chat-item" v-for="(msg,index) in msgList" :key="index">
            <p class="chat-time-wrap" v-if="msg.showTime">
                <span class="chat-time">{{msg.showTime}}</span>
            </p>
            <div class="chat-content-out" v-if="msg.flow === 'out'">
                <img :src="msg.custom.headurl" class="portrait" @click="util.goPage('beautyCustomInfo')">
                <div class="msg-box">
                    {{msg.text}}
                    <img src="../assets/image/im/bg_bubble_red.png" class="right-up-radio">
                </div>
            </div>
            <div class="chat-content-in" v-else>
                <img src="../assets/image/im/platform_msg_icon.png" class="portrait" v-if="msg.sessionId === 'p2p-sys_buyer'">
                <img v-else :src="msg.custom.headurl" class="portrait" @click="util.goPage({name: 'beautyListItem', query: {userid: msg.custom.userid}})">
                <div class="msg-box" v-if="msg.type === 'text'">
                    {{msg.text}}
                    <img src="../assets/image/im/bg_bubble_white.png" class="left-up-radio">
                </div>
                <div class="msg-box msg-box-image" v-else-if="msg.type === 'image'" @click="showBigImg(msg.file.url)">
                    <img :src="msg.file.url" class="msg-img">
                    <img src="../assets/image/im/bg_bubble_white.png" class="left-up-radio">
                </div>
                <div class="msg-box"
                     :class="{'msg-box-audio': curAudioPlayIndex !== index,'msg-audio-active': curAudioPlayIndex === index}"
                     v-else-if="msg.type === 'audio'"
                     @click.self="controlAudio(index,$event)">
                    <span>{{Math.floor(msg.file.dur/1000)}}'</span>
                    <audio :src="msg.file.url"></audio>
                    <img src="../assets/image/im/bg_bubble_white.png" class="left-up-radio">
                </div>
            </div>
        </div>

        <div class="my-model" v-show="showModel" @click="closeBigImg">
            <img :src="showImgSrc">
        </div>

        <!-- 该标签用于每次发送消息后将滚动条滚动到底部 -->
        <p class="blank-ele"></p>
    </div>
</template>

<script>
    export default {
        name: 'chatList',
        data() {
            return {
                showImgSrc: null,
                showModel: false,
                curAudioPlayIndex: null,
            }
        },

        props: {
            msgList: {
                type: Array,
                default () {
                    return []
                }
            },
        },

        watch: {
            msgList() {
                // 显示空白元素用以达到将滚动条滚动到底部的目的
                let blankEle = document.querySelector('.blank-ele');
                blankEle.scrollIntoView();
            }
        },

        mounted() {
            console.log(this.msgList)
        },

        methods: {
            showBigImg(src) {
                this.showImgSrc = src;
                this.showModel = true;
            },

            closeBigImg() {
                this.showModel = false;
            },

            controlAudio(index,e) {
                let audioEle = e.target.querySelector('audio');
                let _this = this;

                // 正在播放audio,停止，否则开始播放
                if (_this.curAudioPlayIndex === index) {
                    audioEle.pause();
                    _this.curAudioPlayIndex = null;
                } else {
                    _this.curAudioPlayIndex = index;
                    audioEle.play();
                }

                // 监听是否已播放完成
                audioEle.addEventListener('ended',() => _this.curAudioPlayIndex = null);
            }
        }
    }
</script>

<style lang="less" scoped>
    @import "../assets/less/variable";

    .chat-list {
        width: 100%;
        box-sizing: border-box;
        padding: 0 0.18rem;
        overflow: scroll;
        .chat-item {
            width: 100%;
            padding-top: 0.18rem;
            .chat-time-wrap {
                width: 100%;
                text-align: center;
            }
            .chat-time {
                background: @gray1;
                border-radius: 0.5rem;
                font-size: 0.13rem;
                line-height: 0.13rem;
                color: @gray5;
                padding: 0 0.08rem;
            }
        }

        .chat-content-out {
            margin-top: 0.14rem;
            overflow: hidden;
            .portrait {
                width: 0.4rem;
                height: 0.4rem;
                border-radius: 100%;
                margin-left: 0.14rem;
                display: inline-block;
                float: right;
            }
            .msg-box {
                float: right;
                padding: 0.09rem 0.11rem;
                height: auto;
                background-color: @red4;
                border-radius: 0.07rem 0 0.07rem 0.07rem;
                font-size: 0.14rem;
                max-width: 2.05rem ;
                line-height: 0.18rem;
                word-break: break-word;
                position: relative;
                color: @white;
                .right-up-radio {
                    position: absolute;
                    width: 0.22rem;
                    height: 0.15rem;
                    top: 0;
                    right: -0.11rem ;
                }
            }
        }

        .chat-content-in {
            margin-top: 0.14rem;
            overflow: hidden;
            .portrait {
                width: 0.4rem;
                height: 0.4rem;
                border-radius: 100%;
                display: inline-block;
                margin-right: 0.14rem;
                float: left;
            }
            .msg-box {
                float: left;
                padding: 0.09rem 0.11rem;
                height: auto;
                background-color: @gray1;
                border-radius: 0 0.07rem 0.07rem 0.07rem;
                font-size: 0.14rem;
                max-width: 2.05rem ;
                line-height: 0.18rem;
                word-break: break-word;
                position: relative;
                color: @black1;
                .left-up-radio {
                    position: absolute;
                    width: 0.22rem;
                    height: 0.15rem;
                    top: 0;
                    left: -0.11rem;
                }
            }
            .msg-box-image {
                width: 1rem;
                padding: 0.06rem;
                display: flex;
                align-items: center;
                .left-up-radio {
                    z-index: 0;
                }
                .msg-img {
                    width: 1rem;
                    height: auto;
                    z-index: 1;
                }
            }
            /*.msg-box-audio {*/
            /*    display: flex;*/
            /*    align-items: center;*/
            /*}*/
            .msg-box-audio:after {
                content: '';
                display: inline-block;
                margin-left: 0.4rem;
                width: 0.11rem;
                height: 0.14rem;
                background-image: url('../assets/image/im/icon_audio.png');
                background-size: cover;
            }
            .msg-audio-active:after {
                content: '';
                display: inline-block;
                margin-left: 0.4rem;
                width: 0.11rem;
                height: 0.14rem;
                background-image: url('../assets/image/im/audio_active.gif');
                background-size: cover;
            }
        }

        .blank-ele {
            width: 100%;
            padding-bottom: 1.8rem;
        }

        .my-model {
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            background-color: rgba(0, 0, 0, 0.95);
            display: flex;
            align-items: center;
            z-index: 3;
            img {
                width: 100%;
            }
        }
    }
</style>
