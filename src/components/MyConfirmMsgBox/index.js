import React, {Component} from 'react'
import util from 'js/util'
import './index.less'

class MyConfirmMsgBox extends Component {
    constructor(props) {
        super(props);
    }

    closeMsgBox = () => {
        this.props.hideConfirmMsgBox();
    };

    downloadApp = () => {
        util.downLoadApp('tip');
    };

    render() {
        let {isMsgBoxShow} = this.props;
        return (
            isMsgBoxShow &&
            <div className="wrap">
                <div className="msg-box">
                    <div className="box-content">
                        <img src={require('../../assets/image/icon/button/icon_Close2@3x.png')} className="close-box"
                             onClick={this.closeMsgBox}/>
                        <div className="box-body">
                            某些功能为APP客户端用户专享，快去下载APP体验更好的服务吧！
                        </div>
                        <div className="box-footer">
                            <div onClick={this.downloadApp}>
                                <span>立即下载</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="my-modal" onClick={this.closeMsgBox}></div>
            </div>
        );
    }
}

export default MyConfirmMsgBox;
