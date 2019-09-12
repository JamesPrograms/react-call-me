<template>
    <div class="wrap">
        <div class="app-info">
            <img class="logo" src="../assets/image/icon/login/img_logo@3x.png">
            <p class="app-name">CallMe</p>
            <div class="point"></div>
            <p class="app-desc">新生代视频社交平台</p>
        </div>
        <div class="login-module">
            <div v-if="isWechatEnv === 'true'">
                <mt-button type="primary" @click="loginByWechat">
                    <img src="../assets/image/icon/login/icon_wx@3x.png" slot="icon">
                    新用户登录
                </mt-button>
                <mt-button type="default" @click="util.goPage('loginWithSms')" class="custom-login">
                    <img src="../assets/image/icon/login/icon_phone.png" slot="icon">
                    老用户登录
                </mt-button>
                <p class="custom-login-tip">已在APP客户端注册的用户点这里</p>
            </div>
            <div v-else>
                <mt-button type="danger" @click="util.goPage('loginWithSms')" class="sms-login">
                    <img src="../assets/image/icon/login/icon_login.png" slot="icon">
                    登录
                </mt-button>
            </div>
        </div>
        <p class="protocol-module">
            登录&nbsp;/&nbsp;注册即表示您同意
            <a href="https://chat.vchat.club/#/xyregister?appname=CallMe">CallMe用户协议</a>
        </p>

        <!-- 下载提示弹窗 -->
        <MyConfirmMsgBox v-model="isMsgBoxShow"></MyConfirmMsgBox>
    </div>
</template>

<script>
    export default {
        name: 'login',
        data() {
            return {
                isWechatEnv: null,
                code: null,
                appid: this.global.wechatAppid,
                secret: this.global.wechatSecret,
                access_token: null,
                nickname: null,
                headimgurl: null,
                openid: null,
                isMsgBoxShow: false, // 是否显示提示下载的标志
            }
        },

        components: {
            MyConfirmMsgBox: require('../components/MyConfirmMsgBox.vue').default
        },

        mounted() {
            // 将当前是否是微信环境的状态加入localstorage
            this.util.setStorage('isWechatEnv', this.util.isWechatEnv());
            // 显示微信登陆按钮
            this.isWechatEnv = this.util.getStorage('isWechatEnv');

            // 微信环境
            if (this.isWechatEnv) {
                let _this = this;

                // 获取微信重定向路径中的code
                _this.code = _this.util.getParamByName('code');
                // 已经获取到微信重定向路径中的code，向后台发请求获取用户信息
                if (_this.code) {
                    _this.http.post(`user/userLogin/h5Login`, {
                        code: _this.code,
                        os: 0,
                        channel: _this.util.getStorage('cpsChain') ? _this.util.getStorage('cpsChain')[1] : 2201
                    }).then(res => {
                        // 在storage中保存登陆信息
                        if (res.dataCollection) {
                            let isBind = res.dataCollection.isBind;
                            _this.util.toast('登录成功!');
                            // 保存登陆信息
                            _this.func.saveLoginInfo(res.dataCollection);
                            setTimeout(() => {
                                // 跳转到指定页面（首页或者目标页）
                                _this.util.jumpToAimPage();
                                // 如果用户未绑定手机号则弹窗提醒绑定
                                if (isBind !== 1) {
                                    _this.$store.commit('setBindBoxTag',{
                                        type: 'bindPhoneBox',
                                        isBindPhoneBoxShow: true,
                                    });
                                }
                            },1500);
                        } else {
                            _this.util.toast('登录失败！');
                        }
                    });
                }
            }
        },
        methods: {
            loginByWechat() {
                if (this.code) {
                    return;
                }
                // https://open.weixin.qq.com/connect/oauth2/authorize?appid=APPID&redirect_uri=REDIRECT_URI&response_type=code&scope=SCOPE&state=STATE#wechat_redirect
                let urlParams,
                    appid = `appid=${this.appid}&`, // 公众号的唯一标识
                    redirect_uri = 'redirect_uri=' + encodeURIComponent(window.location.href) + '&', // 授权后重定向的回调链接地址
                    response_type = 'response_type=code&',  // 返回类型，请填写code
                    scope = 'scope=snsapi_userinfo&'; // snsapi_base,不弹出授权页面，直接跳转; snsapi_userinfo用户获取用户昵称头像等基本信息
                urlParams = `https://open.weixin.qq.com/connect/oauth2/authorize?${appid}${redirect_uri}${response_type}${scope}state=1#wechat_redirect`;
                window.location.href = urlParams;
            }
        }
    }
</script>

<style lang="less" scoped>
    @import "../assets/less/variable";

    .wrap {
        height: 100%;
        padding: 0 10%;
        background: @bg-img-linear1 no-repeat 100% 100%;

        .app-info {
            padding-top: 0.9rem;

            .logo {
                display: block;
                margin: 0 auto;
                width: 1.29rem;
            }

            .app-name {
                margin: 0.05rem auto 0;
                font-size: 0.2rem;
                text-align: center;
                color: @black1;
            }

            .point {
                width: .05rem;
                height: .05rem;
                margin: 0.1rem auto;
                border-radius: 50%;
                background-color: @brown1;
            }

            .app-desc {
                font-size: 0.14rem;
                color: @gray5;
                letter-spacing: 0.025rem;
                text-align: center;
            }
        }

        .login-module {
            padding-top: 1.3rem;
            .custom-login {
                font-size: 0.16rem;
                color: #2E2E2E;
                border: 0 solid #C9CBCF;
                margin-top: 0.2rem;
                img {
                    width: 0.15rem;
                    height: 0.2rem;
                }
            }
            .custom-login-tip {
                margin-top: 0.12rem;
                font-size: 0.11rem;
                color: #9C9C9C;
                text-align: center;
            }
            .sms-login {
                letter-spacing: 0;
                box-sizing: border-box;
                padding-top: 0.05rem;
                img {
                    width: 0.2rem;
                    height: 0.2rem;
                    display: inline-block;
                    margin-right: 0.06rem;
                }
            }
        }

        .protocol-module {
            padding-top: 0.45rem;
            // 避免页面在微信中打开时内容贴到容器底边所作的配置
            margin-bottom: 0.7rem;
            text-align: center;
            font-size: 0.11rem;
            color: @gray7;

            a {
                color: @blue2;
                text-decoration: underline;
            }
        }
    }
</style>
