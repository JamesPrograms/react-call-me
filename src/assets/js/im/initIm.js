/*
 * SDK连接相关
 */

// import {onSessions, onUpdateSession} from './session'
import store from "../../../store";
import util from '../util';

import {onMsg} from './msgs'
import router from "../../../router";


// 初始化 NIM SDK
export function initNim() {
    let loginInfo = util.getStorage('loginInfo');

    // 初始化IM SDK
    window.nim = NIM.getInstance({
        appKey: '5496955336632c1d113fed098d9cd53b',
        account: loginInfo.yunxinAccid, // 云信ID
        token: loginInfo.session,  // session
        db: false,
        syncSessionUnread: true,

        onconnect: function onConnect() {
            console.log('连接成功');
        },

        // 初始化只能获取发出去的会话，不能获取进来的会话，不用该api
        // onsessions: function(session) {
        //     console.log('收到初始化session:',session);
        //     store.commit('updateSessions', session);
        // },

        onupdatesession: function(session) {
            console.log('更新session:', session);
            store.commit('updateSessions', session)
        },

        /*onerror: function onError() {
            util.toast('网络连接状态异常');
            util.rmStorage('loginInfo');
            setTimeout(() => {
                // 跳转到登陆页面
                util.goPage('login');
            },1500);
        },*/
        onwillreconnect: function onWillReconnect() {
            // 此时说明 `SDK` 已经断开连接
            console.log('即将重连');

            // 在界面中提醒用户sdk正在重新建立连接
        },
        /*ondisconnect: function onDisconnect(error) {
            //  `SDK` 处于断开状态
            console.log('丢失连接', error);
            if (error) {
                switch (error.code) {
                    // 账号或者密码错误, 请跳转到登录页面并提示错误
                    case 302:
                        util.toast('通信断开，即将重新登陆');
                        util.rmStorage('loginInfo');
                        setTimeout(function(){
                            util.goPage('login');
                        },2000);
                        break;
                    // 被踢, 请提示错误后跳转到登录页面
                    case 'kicked':
                        util.toast('你已被踢下线，即将重新登陆');
                        util.rmStorage('loginInfo');
                        setTimeout(function(){
                            util.goPage('login');
                        },2000);
                        break;
                    default:
                        break;
                }
            }
        },*/
        // 会话
        // onsessions: onSessions,
        // onupdatesession: onUpdateSession,

        // 收到消息的回调
        onmsg: onMsg,

        // 漫游消息
        // onroamingmsgs: onRoamingMsgs,

        // 离线消息
        // onofflinemsgs: onOfflineMsgs,

        // 同步完成
        onsyncdone: function onSyncDone() {
            // 说明在聊天列表页
            // if (store.state.currSessionId) {
            //     dispatch('setCurrSession', store.state.currSessionId)
            // }
        }
    })
}
