import store from "../../../store";
import util from '../util';

export function onMsg(msg) {
    if (msg.flow === 'out') {
        console.log(`发送消息:${msg.text}`, msg);
    } else {
        console.log(`收到消息:${msg.text}`, msg);
    }
    // store.commit('putMsg', msg)
    // // if (msg.sessionId === store.state.currSessionId) {
    // store.commit('updateCurrSessionMsgs', {
    //     type: 'put',
    //     msg
    // });

    // 每接收/发送一条消息就存入localStorage
    let yunxinid = msg.sessionId,
        localMsgList;

    if (util.getStorage(yunxinid,sessionStorage)) {
        localMsgList = util.getStorage(yunxinid,sessionStorage);
    }

    // 先把custom中的内容转为对象
        msg.custom = msg.custom ? JSON.parse(msg.custom) : {
            netid: yunxinid,
            headurl: '',
            userid: '',
            nickname: '平台小秘书',
            gradeheadurl: ''
        };

    if (localMsgList) {
        // 如果本地有当前聊天消息列表，将当前消息加入列表后再更新本地列表
        localMsgList.push(msg);
        util.setStorage(yunxinid,localMsgList,sessionStorage);
    } else {
        // 如果本地无当前聊天消息列表，将msg以数组形式加入本地
        util.setStorage(yunxinid,[msg],sessionStorage);
    }
    store.commit('updateCurrSessionMsgs', {
        type: 'put',
        msg
    });

    // 如果是发出的消息，且不是系统消息
    if (msg.flow === 'out' && msg.sessionId !== 'p2p-sys_buyer') {
        // 如果leftMsg大于0，则减一
        let leftMsg = util.getStorage('leftMsg');
        if (parseInt(leftMsg) > 0) {
            leftMsg = parseInt(leftMsg) - 1;
            localStorage.setItem('leftMsg', leftMsg);
            // 发送完十条消息后保存当前的时间戳
            if (leftMsg === 0) {
                util.setStorage('lastMsgSendTime',+new Date());
            }
        }
    }
}


export function updateLocalMsg({state, commit}, msg) {
    store.commit('updateCurrSessionMsgs', {
        type: 'replace',
        idClient: msg.idClient,
        msg: msg
    })
    state.nim.updateLocalMsg({
        idClient: msg.idClient,
        localCustom: msg.localCustom
    })
    store.commit('replaceMsg', {
        sessionId: msg.sessionId,
        idClient: msg.idClient,
        msg: msg
    })
}

// 发送普通消息
export function sendMsg(obj) {
    const nim = window.nim;
    obj = obj || {};
    nim.sendText({
        scene: obj.scene,
        to: obj.to,
        text: obj.text,
        custom: obj.custom,
        done(error, msg) {
            if (error) {
                // 被拉黑
                if (error.code === 7101) {
                    msg.status = 'success'
                    alert(error.message)
                } else {
                    alert(error.message)
                }
            }
            onMsg(msg)
        },
        needMsgReceipt: true
    })
}


// 发送消息已读回执
/*export function sendMsgReceipt ({state, commit}) {
    // 如果有当前会话
    let currSessionId = store.state.currSessionId
    if (currSessionId) {
        let msgs = store.state.currSessionMsgs
        const nim = state.nim
        if (state.sessionMap[currSessionId]) {
            nim.sendMsgReceipt({
                msg: state.sessionMap[currSessionId].lastMsg,
                done: function sendMsgReceiptDone (error, obj) {
                    // do something
                }
            })
        }
    }
}*/

/*function sendMsgReceiptDone(error, obj) {
    console.log('发送消息已读回执' + (!error?'成功':'失败'), error, obj);
}

export function getHistoryMsgs ({state, commit}, obj) {
    const nim = state.nim
    if (nim) {
        let {scene, to} = obj
        let options = {
            scene,
            to,
            reverse: false,
            asc: true,
            limit: config.localMsglimit || 20,
            done: function getHistoryMsgsDone (error, obj) {
                if (obj.msgs) {
                    if (obj.msgs.length === 0) {
                        commit('setNoMoreHistoryMsgs')
                    } else {
                        let msgs = obj.msgs.map(msg => {
                            return formatMsg(msg)
                        })
                        commit('updateCurrSessionMsgs', {
                            type: 'concat',
                            msgs: msgs
                        })
                    }
                }
                store.dispatch('hideLoading')
            }
        }
        if (state.currSessionLastMsg) {
            options = Object.assign(options, {
                lastMsgId: state.currSessionLastMsg.idServer,
                endTime: state.currSessionLastMsg.time,
            })
        }
        store.dispatch('showLoading')
        nim.getHistoryMsgs(options)
    }
}

export function resetNoMoreHistoryMsgs ({commit}) {
    commit('resetNoMoreHistoryMsgs')
}*/

