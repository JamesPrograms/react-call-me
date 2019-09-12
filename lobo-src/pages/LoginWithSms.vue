<template>
    <div class="wrapper">
        <div class="title-part">
            <p class="title">验证码登录</p>
            <div class="line"></div>
        </div>
        <p class="field-title">手机号</p>
        <div class="field-content">
            <input type="number" placeholder="请输入手机号" v-focus v-model.trim="phoneNum" @blur="util.resizeScroll">
        </div>
        <p class="field-title title2">验证码</p>
        <div class="field-content">
            <input type="number" placeholder="请输入验证码" v-model.trim="smsNum" @blur="util.resizeScroll">
            <button class="get-sms-code" :class="{'left-second': isGetSmsNum}" :disabled="isGetSmsNum" @click="getSmsCode">{{text}}</button>
        </div>
        <mt-button type="danger" class="login" @click="login">登录</mt-button>
    </div>
</template>

<script>
    export default {
        name: 'loginWithSms',
        data() {
            return {
                phoneNum: '',
                text: '获取验证码',
                isGetSmsNum: false,
                smsNum: '',
                timer: null,
            }
        },
        // mounted() {
        //
        // },
        methods: {
            getSmsCode() {
                let phoneNum = this.phoneNum;
                let _this = this;
                if (!this.util.checkPhoneNum(phoneNum)) {
                    return;
                }
                if (!this.isGetSmsNum) {
                    // 请求获取验证码
                    this.http.post('user/userLogin/sendSmsCodeOnly',{
                        userMobile: phoneNum, // 手机号
                        areaNo: '86' // 手机所在区域
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
                }
            },

            login() {
                let that = this,
                    phoneNum = that.phoneNum;

                if (!this.util.checkPhoneNum(phoneNum)) {
                    return;
                }
                if (!this.smsNum.length) {
                    this.util.toast('请输入验证码');
                    return;
                }
                // 发起登陆请求
                this.http.post('user/userLogin/login',{
                    smsCode: that.smsNum,
                    appId: 1, // 写死传1
                    channel: that.util.getStorage('cpsChain') ? that.util.getStorage('cpsChain')[1] : 2201,
                    type: 3, // 1.QQ登录 2.微信登录 3.验证码登录 4.密码登录 userId 第三方账号 userName 昵称
                    os: 0,   // 写死传0
                    userMobile: phoneNum, // 手机号
                    areaNo: '86' // 手机所在区域
                }).then(res => {
                    if (res.resultCode === 1001) {
                        // 保存登陆信息
                        that.func.saveLoginInfo(res.dataCollection);

                        // 登陆成功提示后跳转页面
                        that.util.toast('登录成功!');
                        setTimeout(() => {
                            // 跳转到指定页面（首页或者目标页）
                            that.util.jumpToAimPage();
                        },1500);

                        // 清除正在进行的定时器
                        if (that.timer) {
                            clearInterval(that.timer);
                        }
                    }
                }).catch(err => {
                    if (that.timer) {
                        clearInterval(that.timer);
                        that.isGetSmsNum = false;
                        that.text = '获取验证码';
                    }
                });

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

    .wrapper {
        padding: 0.7rem 5% 0;
    }

    .title-part {
        .title {
            font-size: 0.18rem;
            font-weight: bold;
            color: @black1;
            text-align: center;
        }

        .line {
            margin: 0.2rem auto 0;
            width: 0.26rem;
            height: 0.02rem;
            background-color: @gray2;
        }

        margin-bottom: 0.4rem;
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
            width: 60%;
            box-sizing: border-box;
            height: 100%;
            font-size: 0.14rem;
            background-color: @gray1;
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

    .login {
        margin-top: 0.2rem;
    }

</style>
