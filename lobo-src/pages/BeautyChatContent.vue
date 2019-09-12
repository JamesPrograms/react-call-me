<template>
    <div class="wrap">
        <p class="header">{{nickname}}</p>

        <ChatList :msgList="curMsgList"></ChatList>

        <ChatEditor :yunxinId="curYunxinId"></ChatEditor>
    </div>
</template>

<script>
    import { initNim } from '../assets/js/im/initIm.js';

    export default {
        name: 'beautyChatContent',

        beforeRouteEnter(to, from, next) {
            if (!window.nim) {
                initNim();
            }
            next();
        },

        components: {
            ChatEditor: require('../components/ChatEditor.vue').default,
            ChatList: require('../components/ChatList.vue').default,
        },

        mounted() {
            // 此时设置当前会话
            this.$store.dispatch('setCurrSession', this.curSessionId);
            // 进入页面重置未读消息树
            window.nim.resetSessionUnread(this.curSessionId);
            // let loginInfo = JSON.parse(localStorage.getItem('loginInfo'));
            // sendMsg({
            //     type: 'text',
            //     scene: 'p2p',
            //     to: loginInfo.yunxinAccid,
            //     text: 'Hi~欢迎来到CallMe,赶紧找到心仪的TA一起聊天吧！',
            //     custom: {
            //         netid: 'sys_buyer',
            //         userid: '',
            //         nickname: '',
            //         headurl: '',
            //         gradeHeadUrl: '',
            //         userType: 0
            //     },
            // });
        },

        computed: {
            nickname() {
              return this.$route.query.nickname;
            },

            curYunxinId() {
                return this.$route.query.netid;
            },

            curSessionId() {
                return `p2p-${this.curYunxinId}`;
            },

            curMsgList () {
                return this.$store.state.currSessionMsgs;
            }
        },
        methods: {

        },

        // 在离开聊天页面时保存对方名字头像等基本信息
        beforeRouteLeave(to, from, next) {
            // 以对象的形式保存
            let beautyBaseInfo = this.util.getStorage('beautyBaseInfo',sessionStorage);
            // 如果有会话信息
            if (beautyBaseInfo) {
                // 且会话列表中无当前的会话基本信息
                if (!beautyBaseInfo.hasOwnProperty(this.curYunxinId)) {
                    beautyBaseInfo[this.curYunxinId] = {
                        netid: this.curYunxinId,
                        headurl: from.query.headurl,
                        userid: from.query.userid,
                        nickname: from.query.nickname
                    }
                }
            } else {
                // 无会话列表，则新建一个
                beautyBaseInfo = {};
                beautyBaseInfo[this.curYunxinId] = {
                    netid: this.curYunxinId,
                    headurl: from.query.headurl,
                    userid: from.query.userid,
                    nickname: from.query.nickname
                }
            }
            // 将新的会话列表存在浏览器中
            this.util.setStorage('beautyBaseInfo',beautyBaseInfo, sessionStorage);
           // 离开页面前重置未读消息树
            window.nim.resetSessionUnread(this.curSessionId);
            next();
        }

    }
</script>

<style lang="less" scoped>
    @import "../assets/less/variable";

    .wrap {
        padding-top: 0.5rem;
    }
    .header {
        width: 100%;
        height: 0.49rem;
        border-bottom: 1px solid #D0D2D7;
        position: fixed;
        background-color: @white;
        font-weight: bold;
        font-size: 0.18rem;
        color: #353C46;
        text-align: center;
        line-height: 0.5rem;
        top: 0;
        left: 0;
        z-index: 2;
    }
</style>
