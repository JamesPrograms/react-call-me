import React, { Component } from 'react';

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isShow:true
        }
        this.toToggole = this.toToggole.bind(this)
    }
    render() {
        return (
            <div className="wrap">
                <div className="app-info">
                    <img className="logo" src={require('../../assets/image/icon/login/img_logo@3x.png')}/>
                        <p className="app-name">CallMe</p>
                        <div className="point"></div>
                        <p className="app-desc">新生代视频社交平台</p>
                </div>
                {/*<div className="login-module">
                    <div v-if="isWechatEnv === 'true'">
                        <mt-button type="primary"
                        onClick="loginByWechat">
                            <img src="../assets/image/icon/login/icon_wx@3x.png" slot="icon"/>
                            新用户登录
                        </mt-button>
                        <mt-button type="default"
                           onClick="util.goPage('loginWithSms')" class="custom-login">
                            <img src="../assets/image/icon/login/icon_phone.png" slot="icon"/>
                            老用户登录
                        </mt-button>
                        <p className="custom-login-tip">已在APP客户端注册的用户点这里</p>
                    </div>
                    <div v-else>
                        <mt-button type="danger"
                           onClick="util.goPage('loginWithSms')" class="sms-login">
                            <img src="../assets/image/icon/login/icon_login.png" slot="icon"/>
                            登录
                        </mt-button>
                    </div>
                </div>*/}
                <p className="protocol-module">
                    登录&nbsp;/&nbsp;注册即表示您同意
                    <a href="https://chat.vchat.club/#/xyregister?appname=CallMe">CallMe用户协议</a>
                </p>
                {/*<MyConfirmMsgBox v-model="isMsgBoxShow"></MyConfirmMsgBox>*/}
            </div>
        );
    }

    toToggole(){
        this.setState({
            isShow:this.state.isShow ? false : true
        })
    }
}

export default Login;
