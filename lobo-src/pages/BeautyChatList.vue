<template>
    <div class="wrap">
        <div class="chat-item platform-item" @click="enterChat(sysSession)">
            <img src="../assets/image/im/platform_msg_icon.png" class="portrait">
            <div class="chat-info">
                <p class="name-time">
                    <span>
                        <span class="name">平台小秘书</span>
                        <span class="official">官方</span>
                    </span>
                    <span class="time">{{util.formatDate(sysSession.updateTime)}}</span>
                </p>
                <p class="info-number">
                    <span class="info">{{sysSession.lastMsg|showLastMsg}}</span>
                    <span class="number" v-if="sysSession.unread">{{sysSession.unread > 99 ? '99+' : sysSession.unread}}</span>
                </p>
            </div>
        </div>

        <!-- :class="{'selected-item':showDeleteIndex === index}"-->
        <div class="chat-item"
             v-for="(session,index) in sessionList"
             @touchstart="showDeleteBtn(index)"
             @touchend="clearLoop"
             @click="enterChat(session)"
        >
            <img :src="session.lastMsg.custom.headurl" class="portrait" @click.stop="util.goPage({name: 'beautyListItem', query: {userid: session.lastMsg.custom.userid}})">
            <div class="chat-info">
                <p class="name-time">
                    <span class="name">{{ session.lastMsg.custom.nickname }}</span>
                    <span class="time">{{util.formatDate(session.updateTime)}}</span>
                </p>
                <p class="info-number">
                    <span class="info">{{session.lastMsg|showLastMsg}}</span>
                    <span class="number" v-if="session.unread">{{session.unread > 99 ? '99+' : session.unread}}</span>
                </p>
            </div>
            <div class="delete-btn" v-show="showDeleteIndex === index" @click.stop="deleteChatInfo(session.id)">删除</div>
        </div>

        <div class="my-modal" v-show="showDeleteIndex > 0 || showDeleteIndex === 0" @touchstart="hideDeleteBtn"></div>
    </div>
</template>

<script>
    import { MessageBox } from 'mint-ui';
    import { initNim } from '../assets/js/im/initIm.js';

    export default {
        name: 'beautyChatList',
        data() {
            return {
                loop: null, // 模拟的长按事件的定时器
                showDeleteIndex: null,
                sysSession: {
                    lastMsg: {
                        type: 'text',
                        text: 'Hi~欢迎来到CallMe,赶紧找到心仪的TA一起聊天吧！',
                        time: +new Date(),
                        custom: {
                            userid: '',
                            nickname: '平台小秘书',
                            netid: 'sys_buyer',
                            headurl: '',
                            gradeHeadUrl: ''
                        }
                    },
                    unread: 0,
                    updateTime: +new Date()
                }
            }
        },

        beforeRouteEnter(to, from, next) {
            if (!window.nim) {
                initNim();
            }
            next();
        },

        mounted() {
            // 如果本地有系统消息，就用本地的系统消息，否则创建一条最新消息
            if (!this.util.getStorage('p2p-sys_buyer',sessionStorage)) {
                let time = +new Date();

                let session = {
                    id: 'p2p-sys_buyer',
                    lastMsg: {
                        type: 'text',
                        text: 'Hi~欢迎来到CallMe,赶紧找到心仪的TA一起聊天吧！',
                        time: time,
                        custom: {
                            userid: '',
                            nickname: '平台小秘书',
                            netid: 'sys_buyer',
                            headurl: '',
                            gradeheadurl: ''
                        }
                    },
                    unread: 0,
                    updateTime: time
                };
                this.$store.commit('updateSessions', session);
                this.sysSession = session;

                let newMsg = [{
                    flow: 'in',
                    sessionId: 'p2p-sys_buyer',
                    text: 'Hi~欢迎来到CallMe,赶紧找到心仪的TA一起聊天吧！',
                    time:time,
                    custom: {
                        userid: '',
                        nickname: '平台小秘书',
                        netid: 'sys_buyer',
                        headurl: '',
                        gradeheadurl: ''
                    },
                    type: 'text'
                }];
                this.util.setStorage('p2p-sys_buyer',newMsg, sessionStorage);

            }
        },

        computed: {
            sessionList () {
                // 获取本地sessionBaseInfoList
                let beautyBaseInfo = this.util.getStorage('beautyBaseInfo',sessionStorage);
                let sessionlist = this.$store.state.sessionlist;

                // 如果state中的sessionlist无数据，则用本地的sessionlist
                if (!sessionlist.length > 0) {
                    sessionlist = JSON.parse(sessionStorage.getItem('sessionlist'));
                }

                let resutSessionList = [];
                for (let sessionInfo of sessionlist) {
                    if (sessionInfo.lastMsg.flow === 'out') {
                        let curYunxinId = sessionInfo.lastMsg.to;
                        sessionInfo.lastMsg.custom = beautyBaseInfo[curYunxinId];
                    } else {
                        let customInfo = sessionInfo.lastMsg.custom;
                        sessionInfo.lastMsg.custom = typeof customInfo === 'string' ? JSON.parse(customInfo) : customInfo;
                    }

                    if (sessionInfo.id === 'p2p-sys_buyer') {
                        this.sysSession = sessionInfo;
                        continue;
                    }

                    resutSessionList.push(sessionInfo);
                }
                console.log('系统session:',this.sysSession)
                console.log(resutSessionList)
                return resutSessionList
            }
        },

        filters: {
            showLastMsg(lastMsg) {
                let type = lastMsg.type,
                    typeWord;

                switch(type) {
                    case 'text':
                        typeWord = lastMsg.text;
                        break;
                    case 'image':
                        typeWord = '[图片]';
                        break;
                    case 'audio':
                        typeWord = '[语音]';
                        break;
                    case 'video':
                        typeWord = '[视频]';
                        break;
                }

                return typeWord;
            }
        },

        methods: {
            showDeleteBtn(index) {
                clearTimeout(this.Loop); //再次清空定时器，防止重复注册定时器
                this.loop = setTimeout(() => {
                    this.showDeleteIndex = index;
                }, 1000)
            },
            clearLoop() {
                clearTimeout(this.loop);
            },
            hideDeleteBtn(e) {
                this.showDeleteIndex = null;
            },
            deleteChatInfo(sessionId) {
                let _this = this;

                // 先隐藏删除按钮
                _this.showDeleteIndex = null;

                // 弹窗确认是否删除
                MessageBox({
                    title: '温馨提示',
                    message: '确认删除该条消息？',
                    showCancelButton: true,
                }).then(action => {
                    if (action === 'confirm') {
                        _this.$store.commit('deleteSession', sessionId);
                    }
                });

            },
            enterChat(session) {
                let custom = session.lastMsg.custom;
                this.util.goPage({
                    name: 'beautyChatContent',
                    query: {
                        userId: custom.userid,
                        nickname: custom.nickname,
                        netid: custom.netid,
                        headurl: custom.headurl,
                    }
                });
            }
        }
    }
</script>

<style lang="less" scoped>
    @import "../assets/less/variable";

    #app {
        height: 100%!important;
    }

    .wrap {
        width: 100%;
        height: 100%;
        background-color: @gray1;

        .platform-item {
            margin-bottom: 0.16rem;
        }
        .selected-item {
            background-color: #E9EAED!important;
        }
        .chat-item {
            width: 100%;
            height: 0.76rem;
            background-color: @white;
            user-select: none;
            padding: 0 0.12rem;
            box-sizing: border-box;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: relative;
            .portrait {
                width: 0.56rem;
                height: 0.56rem;
                border-radius: 100%;
            }
            .chat-info {
                width: 2.82rem;
                .name-time {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    .name {
                        font-size: 0.14rem;
                        color: @black1;
                        font-weight: bold;
                    }
                    .official {
                        font-size: 0.11rem;
                        color: @white;
                        font-weight: bold;
                        background-color: @red4;
                        border-radius: 1rem;
                        padding: 0 0.05rem;
                        margin-left: 0.05rem;
                    }
                    .time {
                        font-size: 0.12rem;
                        color: @gray5;
                    }
                }
                .info-number {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 0.04rem;
                    .info {
                        font-size: 0.14rem;
                        max-width: 2.1rem;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        color: @gray5;
                    }
                    .number {
                        font-size: 0.14rem;
                        color: @white;
                        font-weight: bold;
                        background-color: @red4;
                        border-radius: 1rem;
                        padding: 0.03rem 0.06rem;
                    }
                }
            }

            .delete-btn {
                width: 0.92rem;
                height: 0.47rem;
                font-size: 0.16rem;
                color: @white;
                text-align: center;
                line-height: 0.4rem;
                position: absolute;
                background-image: url("../assets/image/im/delete_icon.png");
                background-size: cover;
                top: -0.51rem;
                left: 1.55rem;
                z-index: 3001;
            }
        }

        .my-modal {
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            opacity: 0;
            z-index: 2000;
            background-color: @white;
        }
    }
</style>
