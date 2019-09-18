import React, {Component} from 'react';
import {NavLink} from 'react-router-dom'
import './index.less'

class TabBar extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <ul className={`tab-bar ${this.props.isVideoPage === "true" ? 'video-tab-bar':''}`}>
                <NavLink to="/beautyList" activeClassName="router-link-active">
                    <div className="icon-beauty-list"></div>
                    <p>美女聊</p>
                </NavLink>
                <NavLink to="/beautyRanking" activeClassName="router-link-active">
                    <div className="icon-beauty-ranking"></div>
                    <p>排行榜</p>
                </NavLink>
                <NavLink to="/beautyVideoPlaying" activeClassName="router-link-active">
                    <div className="icon-beauty-video"></div>
                    <p>视频秀</p>
                </NavLink>
                <NavLink to="/beautyChatList" activeClassName="router-link-active">
                    <div className="icon-beauty-news">
                        {/*<div className="red-point" v-show="hasUnreadMsg"></div>*/}
                    </div>
                    <p>消息</p>
                </NavLink>
                <NavLink to="/beautyCustomInfo" activeClassName="router-link-active">
                    <div className="icon-beauty-info"></div>
                    <p>我的</p>
                </NavLink>
            </ul>
        );
    }
}

export default TabBar;
