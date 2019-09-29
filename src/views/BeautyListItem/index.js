import React, {Component} from 'react'
import http from 'js/http'
import util from 'js/util'
import MySwiper from 'components/MySwiper'
import MyConfirmMsgBox from 'components/MyConfirmMsgBox'
import './index.less'

class BeautyListItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            curUserId: '',
            albumList: [], // 请求回来的相册
            reqData: {
                videos: []
            }, // 请求回来的所有数据对象
            isMsgBoxShow: false, // 显示弹窗信息的标志
            curStatus: null,
            sweetList: [], // 亲密榜
            giftIconList: [], // 礼物列表
            activeTabIndex: 0,
            isActiveVideo: null, // 是否播放video的标志
            videoLength: null,
        }
    }

    componentDidMount() {
        // 获取当前的userId
        let userId = this.props.location.state.userId;
        // 获取主播详情信息
        http.get('user/userCenter/ProfileVo340', {
            appId: 1,
            profileId: userId
        }).then(res => {
            // 赋值所有的返回数据
            let reqData = res.dataCollection;
            // 赋值主播图片列表(组合photos和albums)
            let photos = reqData.photos || [],
                albums = reqData.album || [],
                albumList = Array.from(new Set(photos.concat(albums))),
                stateInfo = {
                    reqData,
                    curStatus: reqData.status,
                    curUserId: userId,
                    albumList
                };

            // 最多显示8个礼物
            let giftIcons = reqData.giftIcons || [],
                giftIconList = giftIcons.splice(0, 8);
            if (giftIcons) {
                stateInfo.giftIconList = giftIconList;
                stateInfo.stateInfo = reqData.status;
            }

            // 更新视频条数
            let videoLength = reqData.videos.length;
            if (videoLength > 0) {
                stateInfo.videoLength = videoLength;
            }

            this.setState(stateInfo);

            // 请求亲密度接口
            http.get('user/userCenter/profileVo340/sweetRanking', {
                appId: 1,
                profileId: userId,
                extraOption: {
                    noLoading: true
                }
            }).then(res => {
                let sweetList = res.dataCollection.splice(0, 8);
                // 最多显示8个，接口返回的列表亲密度值已经是倒叙排列，此处不用再排序
                this.setState({
                    sweetList
                });
            });
        })
    }

    // 点击切换navbar的事件方法
    navbarChage(activeTabIndex) {
        // 每次点击更换当前的activeIndex
        this.setState({activeTabIndex});
    }

    // 点击播放视频
    playVideo(index) {
        this.setState({isActiveVideo: index});
        document.querySelectorAll('.my-video')[index].play();
    }

    closeVideo(index) {
        document.querySelectorAll('.my-video')[index].pause();
        this.setState({isActiveVideo: null});
    }

    showMsgBox = () => {
        // 安卓系统中的微信，弹窗提示
        if (util.isWechatEnv() && util.curDevice() === 'android') {
            util.downLoadApp('tip');
        } else {
            this.setState({isMsgBoxShow: true});
        }
    };

    hideConfirmMsgBox = () => {
        this.setState({isMsgBoxShow: false});
    };

    render() {
        let {reqData, videoLength, giftIconList, sweetList, isActiveVideo, activeTabIndex, albumList,isMsgBoxShow, curStatus} = this.state;
        return (
            <div className="wrapper">
                <div className="swipper-content">
                    <MySwiper albumList={albumList} curStatus={curStatus}/>
                </div>

                <div className="basic-info">
                    <div className="nickname-rank">
                        <span>{reqData.nickName}</span>
                        <img src={reqData.gradeIcon}/>
                    </div>
                    <div className="chat-price">
                    <span className="unit-price">
                        <img src={require('../../assets/image/icon/icon_video2@3x.png')}/>
                        <span>{reqData.price}每分钟</span>
                    </span>
                        <span className="audio-price">
                        <img src={require('../../assets/image/icon/icon_Voice2@3x.png')}/>
                        <span>{reqData.audioPrice}每分钟</span>
                    </span>
                        <span className="answer-rate">
                        <img src={require("../../assets/image/icon/icon_icon_Answer_rate_iphone@3x.png")}/>
                            <span>{reqData.answerRate ? Math.round(reqData.answerRate / 100) : 100}%</span>
                    </span>
                    </div>
                    <div className="like-fans">
                        <span className="stress-word">{reqData.followNum > 9999 ? '9999+' : reqData.followNum}</span>
                        <span className="normal-word">关注</span>
                        <span className="vertical-line"></span>
                        <span className="stress-word">{reqData.fansNum > 9999 ? '9999+' : reqData.fansNum}</span>
                        <span className="normal-word">粉丝</span>
                    </div>
                    <div className="intro">{reqData.intro}</div>
                </div>

                <div className="navbar-part">
                    <ul className="navbar">
                        <li className={`${activeTabIndex === 0 ? 'active' : ''}`}
                            onClick={this.navbarChage.bind(this, 0)}>介绍
                        </li>
                        <li className={`${activeTabIndex === 1 ? 'active' : ''}`}
                            onClick={this.navbarChage.bind(this, 1)}>视频 {videoLength}</li>
                    </ul>
                </div>

                {
                    activeTabIndex === 0 ? (
                        <div className="nav-intro-content">
                            {
                                (sweetList && sweetList.length > 0) &&
                                <div className="sweet-rank">
                                    <p className="intro-item-title">亲密榜</p>
                                    <div className="sweet-list">
                                        {
                                            sweetList.map((item, index) => {
                                                return <img key={index} src={item.portrait}/>
                                            })
                                        }
                                    </div>
                                </div>
                            }

                            {
                                (reqData.labels && reqData.labels.length > 0) &&
                                <div className="label-list">
                                    <p className="intro-item-title">标签</p>
                                    <div className="label-wrap">
                                        {
                                            reqData.labels.map((item, index) => {
                                                return <span key={index}
                                                             style={{backgroundColor: item.color}}>{item.name}</span>
                                            })
                                        }
                                    </div>
                                </div>
                            }


                            <div className="personal-info">
                                <p className="intro-item-title">个人信息</p>
                                <div className="personal-info-content">
                    <span className="info-item">
                        {
                            reqData.sex == 1 ? <img src={require("../../assets/image/icon/icon_boy.png")}/> :
                                <img src={require("../../assets/image/icon/icon_girl.png")}/>
                        }
                        <span className="info">{reqData.age}</span>
                    </span>
                                    <span className="info-item">
                        <img src={require("../../assets/image/icon/icon_addr.png")}/>
                        <span
                            className="info">{reqData.address} {reqData.distance ? (reqData.distance).toFixed(1) + 'km' : ''}</span>
                    </span>
                                    <span className="info-item">
                        <img src={require('../../assets/image/icon/icon_id.png')}/>
                        <span className="info">ID:{reqData.showId}</span>
                    </span>
                                </div>
                            </div>
                            {
                                (giftIconList && giftIconList.length > 0) &&
                                <div className="gift-box">
                                    <p className="intro-item-title">礼物柜</p>
                                    <div className="gift-list">
                                        {
                                            giftIconList.map((item, index) => {
                                                return <img key={index} src={item}/>
                                            })
                                        }
                                    </div>
                                </div>
                            }
                        </div>
                    ) : (
                        <div className="nav-video-content">
                            {
                                (reqData.videos && reqData.videos.length > 0) ?
                                    <div>
                                        {
                                            reqData.videos.map((item, index) => {
                                                return (
                                                    <div className="video-cover"
                                                         key={index}
                                                         onClick={this.playVideo.bind(this, index)}
                                                    >
                                                        <img src={item.coverUrl} className="cover-img"/>
                                                        <img src={require("../../assets/image/icon/icon_play.png")}
                                                             className="play-icon"
                                                             onClick={this.playVideo.bind(this, index)}/>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div> : <p className="no-video">暂时没有视频</p>
                            }
                        </div>
                    )
                }

                {
                    reqData.videos.map((item,index) => {
                        return (<div key={index} className="video-wrap" style={{display: isActiveVideo === index ? 'block':'none'}}>
                                    <video  className="my-video"
                                        src={item.videoUrl}
                                        playsInline
                                        poster={item.coverUrl}
                                        webkit-playsinline="true"
                                        x5-video-player-type="h5"
                                        preload="auto"
                                        x-webkit-airplay="true"
                                        loop="loop"
                                        width="100%"
                                        height="100%"
                                        style={{objectFit: 'cover'}}
                                ></video>
                            <img src={require("../../assets/image/icon/button/icon_close_opacity.png")} className="close-video" onClick={this.closeVideo.bind(this,index)}/>
                        </div>)
                    })
                }

                <div className="tabbar">
                    <img src={require("../../assets/image/icon/button/icon_msg@3x.png")} className="img-btn" onClick={this.showMsgBox}/>
                    <img src={require("../../assets/image/icon/button/icon_yy@3x.png")} className="img-btn" onClick={this.showMsgBox}/>
                    <img src={require("../../assets/image/icon/button/icon_gz@3x.png")} className="img-btn" onClick={this.showMsgBox}/>
                    <div className={`video-btn ${reqData.status != 2 ? 'video-not-available' : ''}`} onClick={this.showMsgBox}>
                        <img src={require("../../assets/image/icon/button/icon_video@3x.png")}/>
                        <span>视频聊</span>
                    </div>
                </div>

                <MyConfirmMsgBox isMsgBoxShow={isMsgBoxShow} hideConfirmMsgBox={this.hideConfirmMsgBox}></MyConfirmMsgBox>
            </div>
        );
    }
}

export default BeautyListItem;
