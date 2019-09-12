<template>
    <div class="wrap">
        <div class="bind-phone">
            <div class="title">绑定手机号</div>
            <div class="input-group">
                <p class="field-title">手机号</p>
                <div class="field-content">
                    <input type="number" placeholder="请输入手机号" v-focus v-model.trim="phoneNum" @blur="util.resizeScroll">
                </div>
                <p class="field-title title2">验证码</p>
                <div class="field-content">
                    <input type="number" class="sms-input" placeholder="请输入验证码" v-model.trim="smsNum" @blur="util.resizeScroll">
                    <button class="get-sms-code"
                            :class="{'left-second': isGetSmsNum}"
                            :disabled="isGetSmsNum"
                            @click="getSmsCode">
                        {{text}}
                    </button>
                </div>
            </div>
            <button class="confirm-btn" @click="bindPhoneNum">确定</button>
        </div>
        <div class="my-modal bind-phone-modal" @click="closeBindPhoneBox"></div>

        <div class="warm-box" v-show="isWarmBoxShow">
            <div class="title">绑定手机号</div>
            <p class="content">您当前手机已经绑定过账号，若强制绑定可能导致老账号无法登陆</p>
            <div class="buttons">
                <button class="cancel" @click="hideBox">取消</button>
                <button class="confirm" @click="keepBindPhoneNum">确定</button>
            </div>
        </div>
        <div class="my-modal warm-box-modal" v-show="isWarmBoxShow" @click="closeWarmPhoneBox"></div>
    </div>
</template>

<script>
    import md5 from 'js-md5'; // 引入md5加密

    export default {
        name: 'bindPhoneBox',
        data() {
            return {
                phoneNum: '',
                text: '获取验证码',
                isGetSmsNum: false,
                smsNum: '',
                timer: null,
                hasBinded: false,
            }
        },
        methods: {
            hideBox() {
                this.$store.commit('setBindBoxTag',{
                    type: 'warmBox',
                    isWarmBoxShow: false,
                });
                this.$store.commit('setBindBoxTag',{
                    type: 'bindPhoneBox',
                    isBindPhoneBoxShow: false,
                });
            },

            getSmsCode() {
                let phoneNum = this.phoneNum;
                let _this = this;
                if (!this.util.checkPhoneNum(phoneNum)) {
                    return;
                }
                if (!this.isGetSmsNum) {
                    // 请求是否已经绑定过手机号：
                    // 1. 若绑定过手机号，则接口会返回10033，再次调用sendSmsCodeOnly获取验证码，然后再  弹窗提醒用户已经绑定过手机号
                    // 2. 未绑定过手机号，用户会收到验证码
                    this.http.post('user/userLogin/sendSmsCode',{
                        type: 3,
                        userMobile: phoneNum, // 手机号
                        areaNo: '86' // 手机所在区域
                    }).then(res => {
                        if (res.resultCode === 10033) {
                            // 已绑定过手机号
                            // 将已绑定过手机的标志置为true
                            _this.hasBinded = true;
                            // 调接口获取验证码
                            _this.http.post('user/userLogin/sendSmsCodeOnly',{
                                userMobile: phoneNum, // 手机号
                                areaNo: '86', // 手机所在区域
                                extraOption: {
                                    noLoading: true
                                }
                            }).then(res => {
                                let leftTime = 60;
                                this.isGetSmsNum = true;
                                this.text = `${leftTime}s`;
                                // 显示验证码剩余时间的定时器
                                _this.timer = setInterval(() => {
                                    leftTime = leftTime -1;
                                    if (leftTime === 0) {
                                        this.text = '获取验证码';
                                        this.isGetSmsNum = false;
                                        clearInterval(_this.timer);
                                    } else {
                                        this.text = `${leftTime}s`;
                                    }
                                },1000);
                            });
                        } else {
                            let leftTime = 60;
                            this.isGetSmsNum = true;
                            this.text = `${leftTime}s`;
                            // 显示验证码剩余时间的定时器
                            _this.timer = setInterval(() => {
                                leftTime = leftTime -1;
                                if (leftTime === 0) {
                                    this.text = '获取验证码';
                                    this.isGetSmsNum = false;
                                    clearInterval(_this.timer);
                                } else {
                                    this.text = `${leftTime}s`;
                                }
                            },1000);
                        }
                    });
                }
            },

            bindPhoneNum() {
                if (!this.util.checkPhoneNum(this.phoneNum)) {
                       return;
                   }
                if (!this.smsNum.length) {
                    this.util.toast('请输入验证码');
                    return;
                }

                if (this.hasBinded) {
                    // 已经绑定过电话则弹窗提醒
                    this.$store.commit('setBindBoxTag', {
                        type: 'warmBox',
                        isWarmBoxShow: true,
                    });
                } else {
                    // 未绑定过则直接绑定
                    let that = this,
                        phoneNum = that.phoneNum;

                    // 发起绑定请求
                    that.http.post('user/userLogin/ForceBindPhone.do',{
                        smsCode: that.smsNum,
                        userMobile: phoneNum, // 手机号
                        key: md5(`abcd${phoneNum}`),
                        areaNo: '86' // 手机所在区域
                    }).then(res => {
                        if (res.resultCode === 1007) {
                            that.util.toast('绑定成功！');
                            setTimeout(function(){
                                that.$store.commit('setBindBoxTag',{
                                    type: 'warmBox',
                                    isWarmBoxShow: false,
                                });
                                that.$store.commit('setBindBoxTag',{
                                    type: 'bindPhoneBox',
                                    isBindPhoneBoxShow: false
                                });
                            },1500);
                            // 更改本地登陆数据中的isBind
                            let loginInfo = that.util.getStorage('loginInfo');
                            loginInfo.isBind = 1;
                            that.util.setStorage('loginInfo',loginInfo);
                            that.$store.commit('setBindBoxTag',{
                                type: 'setIsBind',
                                isBind: 1
                            });
                        }
                    })
                }
            },

            keepBindPhoneNum() {
                this.hasBinded = false;
                this.bindPhoneNum();
            },

            closeBindPhoneBox() {
                this.$store.commit('setBindBoxTag',{
                    type: 'bindPhoneBox',
                    isBindPhoneBoxShow: false
                });
            },

            closeWarmPhoneBox() {
                this.$store.commit('setBindBoxTag',{
                    type: 'warmBox',
                    isWarmBoxShow: false
                });
            }
        },
        computed: {
            isWarmBoxShow() {
                return this.$store.state.isWarmBoxShow;
            }
        },
        directives: { // 自定义指令
            focus: {
                // 当被绑定的元素插入到 DOM时，自动聚焦
                inserted(el) {
                    el.focus();
                }
            }
        }
    }
</script>

<style lang="less" scoped>
    @import "../assets/less/variable";

    .wrap {
        position: fixed;
        width: 100vw;
        height: 100vh;
        left: 0;
        top: 0;
        z-index: 3001;
    }

    .bind-phone {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: @white;
        width: 2.9rem;
        border-radius: 0.04rem;
        font-size: 0.14rem;
        box-sizing: border-box;
        padding: 0.26rem 0.2rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        z-index: 3003;

        .title {
            text-align: center;
            font-size: 0.18rem;
            font-weight: bold;
            color: #2E2E2E;
        }

        .input-group {
            margin: 0.2rem 0 0.2rem;
        }

        .confirm-btn {
            width: 100%;
            height: 0.38rem;
            border-radius: 1rem;
            color: @white;
            background-color: #F9517E;
            line-height: 0.38rem;
            font-size: 0.16rem;
            letter-spacing: 0.15rem;
        }

        .field-title {
            font-size: 0.12rem;
            color: @black1;
            padding-left: 0.12rem;
            margin-bottom: 0.06rem;
        }

        .title2 {
            margin-top: 0.1rem;
        }

        .field-content {
            width: 100%;
            height: 0.45rem;
            box-sizing: border-box;
            padding: 0.08rem 0.1rem 0.08rem 0.25rem;
            background: @gray1;
            border-radius: 1rem;

            input {
                width: 80%;
                box-sizing: border-box;
                height: 100%;
                font-size: 0.14rem;
                background-color: @gray1;
            }

            .sms-input {
                width: 50%;
            }

            .get-sms-code {
                width: 0.9rem;
                padding: 0.08rem 0.1rem;
                height: 100%;
                line-height: 100%;
                box-sizing: border-box;
                display: inline-block;
                border-radius: 1rem;
                color: white;
                font-size: 0.14rem;
                font-weight: bold;
                background-color: @yellow1;
                float: right;
            }

            .left-second {
                background-color: #D2D5D9;
                font-weight: normal;
            }
        }

    }
    .bind-phone-modal {
        z-index:3002;
    }

    .warm-box {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: @white;
        width: 2.9rem;
        border-radius: 0.04rem;
        font-size: 0.14rem;
        box-sizing: border-box;
        padding: 0.26rem 0.2rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        z-index: 3005;

        .title {
            text-align: center;
            font-size: 0.18rem;
            font-weight: bold;
            color: #2E2E2E;
        }

        .content {
            line-height: 0.2rem;
            margin: 0.3rem 0 0.34rem;
        }

        .buttons {
            width: 100%;
            height: 0.38rem;
            display: flex;
            justify-content: space-between;

            button {
                width: 1.2rem;
                border-radius: 1rem;
                font-size: 0.16rem;
                font-weight: bold;
            }

            .confirm {
                background: #F9517E;
                color: @white;
            }

            .cancel {
                background-color: #F2F3F6;
                color: #595959;
            }
        }
    }
    .warm-box-modal {
        z-index:3004;
    }

    .my-modal {
        position: fixed;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        opacity: 0.5;
        background-color: black;
    }
</style>
