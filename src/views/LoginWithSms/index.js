import React, {Component} from 'react'
import Button from '../../components/Button'
import util from 'js/util'
import http from 'js/http'
import func from 'js/func'
import './index.less';

let timer = null;
class LoginWithSms extends Component {
    constructor(props) {
        super(props);
        this.state = {
            phoneNum: '',
            text: '获取验证码',
            isGetSmsNum: false,
            smsNum: ''
        }
    }

    componentDidMount() {
        this.refs.phoneNum.focus();
    }

    render() {
        return (
            <div className="wrapper">
                <div className="title-part">
                    <p className="title">验证码登录</p>
                    <div className="line"></div>
                </div>
                <p className="field-title">手机号</p>
                <div className="field-content">
                    <input type="number" placeholder="请输入手机号"
                           value={this.state.phoneNum}
                           onChange={e => {
                               this.handlePhoneChge(e.target.value)
                           }}
                           ref="phoneNum"
                    />
                </div>
                <p className="field-title title2">验证码</p>
                <div className="field-content">
                    <input type="number" placeholder="请输入验证码" value={this.state.smsNum} onChange={e => {
                        this.handleSmsChge(e.target.value)
                    }}/>
                    <button className={`get-sms-code ${this.state.isGetSmsNum ? 'left-second' : ''}`}
                            disabled={this.state.isGetSmsNum}
                            onClick={this.getSmsCode.bind(this)}>{this.state.text}</button>
                </div>
                <Button width="3.37rem"
                        marginTop="0.2rem"
                        text="登录"
                        btnClick={this.btnClick.bind(this)}/>
            </div>
        );
    }

    handlePhoneChge(phoneNum) {
        this.setState({phoneNum})
    }

    handleSmsChge(smsNum) {
        this.setState({smsNum})
    }

    getSmsCode() {
        let phoneNum = this.state.phoneNum;
        let _this = this;
        if (!util.checkPhoneNum(phoneNum)) {
            return;
        }
        if (!this.state.isGetSmsNum) {
            // 请求获取验证码
            http.post('user/userLogin/sendSmsCodeOnly', {
                userMobile: phoneNum, // 手机号
                areaNo: '86' // 手机所在区域
            }).then(res => {
                let leftTime = 60;
                _this.setState({
                    isGetSmsNum: true,
                    text: `${leftTime}s`
                });
                timer = setInterval(() => {
                    leftTime = leftTime - 1;
                    if (leftTime === 0) {
                        _this.setState({
                            text: '获取验证码',
                            isGetSmsNum: false
                        });
                        clearInterval(timer);
                    } else {
                        _this.setState({
                            text: `${leftTime}s`,
                        });
                    }
                }, 1000)
            });

        }
    }

    btnClick() {
        let that = this,
            phoneNum = that.state.phoneNum;

        if (!util.checkPhoneNum(phoneNum)) {
            return;
        }
        if (!that.state.smsNum.length) {
            util.toast('请输入验证码');
            return;
        }
        // 发起登陆请求
        http.post('user/userLogin/login', {
            smsCode: that.state.smsNum,
            appId: 1, // 写死传1
            channel: 2201,
            type: 3, // 1.QQ登录 2.微信登录 3.验证码登录 4.密码登录 userId 第三方账号 userName 昵称
            os: 0,   // 写死传0
            userMobile: phoneNum, // 手机号
            areaNo: '86' // 手机所在区域
        }).then(res => {
            if (res.resultCode === 1001) {
                // 保存登陆信息
                func.saveLoginInfo(res.dataCollection);

                // 登陆成功提示后跳转页面
                util.toast('登录成功！',()=> {
                    that.props.history.push('/beautyList');
                });

                // 清除正在进行的定时器
                if (timer) {
                    clearInterval(timer);
                }
            }
        }).catch(err => {
            if (timer) {
                clearInterval(timer);
                that.setState({
                    isGetSmsNum: false,
                    text: '获取验证码',
                });
            }
        });

    }
}

export default LoginWithSms;
