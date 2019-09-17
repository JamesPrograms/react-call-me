import React, { Component } from 'react'
import Button from '../../components/Button'
import './index.less'

class Login extends Component {
    constructor(props) {
        super(props);
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
                <div className="login-module">
                    <Button text="登录" btnClick={this.btnClick.bind(this)}>
                        <img style={{width:'0.2rem',height:'0.2rem'}} src={require("../../assets/image/icon/icon_login.png")}/>
                    </Button>
                </div>
                <p className="protocol-module">
                    登录&nbsp;/&nbsp;注册即表示您同意
                    <a href="https://chat.vchat.club/#/xyregister?appname=CallMe">CallMe用户协议</a>
                </p>
            </div>
        );
    }
    btnClick() {
        this.props.history.push('/loginWithSms');
    }
}

export default Login;
