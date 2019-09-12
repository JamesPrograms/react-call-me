import Vue from 'vue'
import Vuex from 'vuex'
import util from './assets/js/util.js'

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        homeNavBarData: null, // 首页导航动态数据
        downLoadTipInfo: {   // 引导下载app的提示信息
            type: null, // 提示类型: guide/tip
            isShow: false // 是否显示提示的标志
        },

        chatTime: '00:00', // 通话时间显示
        isReceivedStream: false, // 是否收到了流
        willBreakVideoTag: 0, // 即将中断通话的标志（大于0都会中断视频）

        balance: util.getStorage('loginInfo').balance, // 钻石余额
        isBindPhoneBoxShow: false, // 是否显示绑定手机号的弹窗
        isWarmBoxShow: false, // 已经绑定过手机号的警告弹窗
        isBind: util.getStorage('loginInfo').isBind, // 是否绑定过手机号的标志
        isChatGuideShow: false, // 是否显示在外部浏览器打开进行通话的标志
        canUseAlipayTag: false, // 是否可以用支付宝的标志
        willEnterPage: null, // 登陆成功后即将跳转的页面

        currSessionId: null, // 当前的sessionId
        currSessionLastMsg: null,
        currSessionMsgs: [], // 当前session对应的聊天记录
        updateSessions: null,
        sessionlist: [],
        sessionMap: {},
        hasUnread: false, // 未读数
    },

    mutations: {
        setBindBoxTag(state, obj) { // 设置绑定手机弹窗的标志
            if (obj.type === 'bindPhoneBox') {
                state.isBindPhoneBoxShow = obj.isBindPhoneBoxShow;
            }
            if (obj.type === 'warmBox') {
                state.isWarmBoxShow = obj.isWarmBoxShow;
            }
            if (obj.type === 'setIsBind') {
                // 1. 更新store中的isBind
                state.isBind = obj.isBind;
                // 2. 更新本地保存的isBind
                let loginInfo = util.getStorage('loginInfo');
                loginInfo.isBind = obj.isBind;
                util.setStorage('loginInfo',loginInfo);
            }
        },

        setBreakVideoTag(state, tag) {
            state.willBreakVideoTag = tag;
        },

        setChatGuidTag(state, tag) {
            state.isChatGuideShow = tag;
        },

        updateChatTime(state, chatTime) {
            state.chatTime = chatTime;
        },

        setStreamTag(state, tag) {
            state.isReceivedStream = tag;
        },

        setBalance(state, newBalance) {
            // 更新store中的balance
            state.balance = newBalance;
            // 更新本地保存的balance
            let loginInfo = util.getStorage('loginInfo');
            loginInfo.balance = newBalance;
            util.setStorage('loginInfo',loginInfo);

        },

        setNavBarData(state, httpData) { // 更新首页导航数据
            state.homeNavBarData = httpData;
        },

        recordWillEnterPage(state, willEnterPage) { // 跳转到登陆页面之前，记录当前路由页面
            state.willEnterPage = willEnterPage;
        },

        setDownloadAppFlag(state, info) {
            if (info === 'close') {
                state.downLoadTipInfo.isShow = false;
            } else {
                state.downLoadTipInfo = info;
            }
        },

        setAlipayStateFlag(state, flagState) {
            state.canUseAlipayTag = flagState;
        },

        // 更新当前会话id，用于唯一判定是否在current session状态
        updateCurrSessionId(state, obj) {
            let type = obj.type || ''
            if (type === 'destroy') {
                state.currSessionId = null
            } else if (type === 'init') {
                if (obj.sessionId && (obj.sessionId !== state.currSessionId)) {
                    state.currSessionId = obj.sessionId
                }
            }
        },

        // 更新当前会话列表的聊天记录，包括历史消息、单聊消息等
        updateCurrSessionMsgs(state, obj) {
            let type = obj.type || ''
            if (type === 'destroy') { // 清空会话消息
                state.currSessionMsgs = []
                state.currSessionLastMsg = null
                store.commit('updateCurrSessionId', {
                    type: 'destroy'
                })
            } else if (type === 'init') { // 初始化会话消息列表
                if (state.currSessionId) {
                    let sessionId = state.currSessionId;
                    let localMsgs = util.getStorage(sessionId, sessionStorage);
                    let currSessionMsgs = [].concat(localMsgs || []);
                    let lastMsgTime = 0;

                    state.currSessionMsgs = [];
                    currSessionMsgs.forEach(msg => {
                        if ((msg.time - lastMsgTime) > 1000 * 60 * 5) {
                            lastMsgTime = msg.time
                            msg.showTime = util.formatDate(msg.time, false);
                        }
                        state.currSessionMsgs.push(msg)
                    })
                }
            } else if (type === 'put') { // 追加一条消息
                let newMsg = obj.msg;
                let lastMsgTime = 0;
                let lenCurrMsgs = state.currSessionMsgs.length;
                if (lenCurrMsgs > 0) {
                    lastMsgTime = state.currSessionMsgs[lenCurrMsgs - 1].time
                }
                if (newMsg) {
                    // 如果下一条消息和上一条消息间隔五分钟以上，则吓一跳消息要显示消息时间
                    if ((newMsg.time - lastMsgTime) > 1000 * 60 * 5) {
                        newMsg.showTime = util.formatDate(newMsg.time, false);
                    }

                    // 当新消息主播id和当前聊天主播的消息一致时，才往currSessionMsgs添加新消息，避免当前聊天页面出现其他主播发来的消息
                    if (newMsg.sessionId === state.currSessionId) {
                        state.currSessionMsgs.push(newMsg);
                    }
                }
            }
        },

        // 更新sessions
        updateSessions(state, sessions) {
            const nim = window.nim;

            // 如果是系统消息，则给session加上custom
            if (sessions.id === 'p2p-sys_buyer') {
                sessions.lastMsg.custom = {
                    netid: 'sys_buyer',
                    headurl: '',
                    userid: '',
                    nickname: '平台小秘书',
                    gradeheadurl: ''
                }
            }

            state.sessionlist = nim.mergeSessions(util.getStorage('sessionlist', sessionStorage) || [], sessions);
            state.sessionlist.sort((a, b) => {
                return b.updateTime - a.updateTime
            })

            state.sessionlist.forEach(item => {
                state.sessionMap[item.id] = item
            })

            // 每次session更新，也同步更新本地的sessionlist，确保在刷新页面时，state中的sessionlist被清空
            util.setStorage('sessionlist', state.sessionlist, sessionStorage);
        },

        // 删除会话
        deleteSession(state, sessionId) {
            // 在sessionlist中删除会话
            let sessionlist = state.sessionlist;
            for (let i = 0; i < sessionlist.length; i++) {
                if (sessionlist[i].id === sessionId) {
                    sessionlist.splice(i, 1);
                }
            }

            // 在本地会话中删除会话
            let localSessionList = util.getStorage('sessionlist', sessionStorage);
            for (let j = 0; j < localSessionList.length; j++) {
                if (localSessionList[j].id === sessionId) {
                    localSessionList.splice(j, 1);
                }
            }
            util.setStorage('sessionlist', localSessionList, sessionStorage);

            // 删除currSessionMsgs中对应的对话记录
            state.currSessionMsgs.length = 0;

            // 在本地历史记录中删除聊天记录
            util.rmStorage(sessionId, sessionStorage);
        }

    },

    // 与mutation通讯，ui层写入内存数据的接口，可异步操作
    actions: {
        setCurrSession({state, commit, dispatch}, sessionId) {
            const nim = window.nim;
            if (sessionId) {
                commit('updateCurrSessionId', {
                    type: 'init',
                    sessionId
                })
                if (nim) {
                    // 如果在聊天页面刷新，此时还没有nim实例，需要在onSessions里同步
                    commit('updateCurrSessionMsgs', {
                        type: 'init',
                        sessionId
                    })
                }
            }
        },
    }
});

export default store
