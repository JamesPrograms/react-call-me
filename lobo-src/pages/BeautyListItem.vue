<template>
    <div class="wrapper">
        <div class="swipper-content">
            <MySwiper :albumList="albumList" :curStatus="curStatus"/>
        </div>

        <div class="basic-info">
            <div class="nickname-rank">
                <span>{{reqData.nickName}}</span>
                <img :src="reqData.gradeIcon">
            </div>
            <div class="chat-price">
                    <span class="unit-price">
                        <img src="../assets/image/icon/icon_video2@3x.png">
                        <span>{{reqData.price}}每分钟</span>
                    </span>
                <span class="audio-price">
                        <img src="../assets/image/icon/icon_Voice2@3x.png">
                        <span>{{reqData.audioPrice}}每分钟</span>
                    </span>
                <span class="answer-rate">
                        <img src="../assets/image/icon/icon_icon_Answer_rate_iphone@3x.png">
                    <!-- 默认显示为100% -->
                        <span>{{reqData.answerRate ? Math.round(reqData.answerRate/100 ): 100}}%</span>
                    </span>
            </div>
            <div class="like-fans">
                <span class="stress-word">{{ reqData.followNum > 9999 ? '9999+' : reqData.followNum }}</span>
                <span class="normal-word">关注</span>
                <span class="vertical-line"></span>
                <span class="stress-word">{{ reqData.fansNum > 9999 ? '9999+' : reqData.fansNum }}</span>
                <span class="normal-word">粉丝</span>
            </div>
            <div class="intro">{{reqData.intro}}</div>
        </div>

        <div class="navbar-part">
            <ul class="navbar">
                <li :class="{active: activeTabIndex === 0}" @click="navbarChage(0)">介绍</li>
                <li :class="{active: activeTabIndex === 1}" @click="navbarChage(1)">视频 {{videoLength}}</li>
            </ul>
        </div>

        <div class="nav-intro-content" v-show="activeTabIndex === 0">
            <div class="sweet-rank" v-if="sweetList && sweetList.length > 0">
                <p class="intro-item-title">亲密榜</p>
                <div class="sweet-list">
                    <img v-for="item in sweetList" :src="item.portrait">
                </div>
            </div>
            <div class="label-list" v-if="reqData.labels && reqData.labels.length > 0">
                <p class="intro-item-title">标签</p>
                <div class="label-wrap">
                    <span v-for="item in reqData.labels" :style="{'background-color': item.color}">
                        {{item.name}}
                    </span>
                </div>
            </div>
            <div class="personal-info">
                <p class="intro-item-title">个人信息</p>
                <div class="personal-info-content">
                    <span class="info-item">
                        <img src="../assets/image/icon/icon_boy.png" v-if="reqData.sex == 1">
                        <img src="../assets/image/icon/icon_girl.png" v-else>
                        <span class="info">{{reqData.age}}</span>
                    </span>
                    <span class="info-item">
                        <img src="../assets/image/icon/icon_addr.png">
                        <span class="info">{{reqData.address}} {{reqData.distance ? (reqData.distance).toFixed(1) + 'km' : ''}}</span>
                    </span>
                    <span class="info-item">
                        <img :src="require('../assets/image/icon/icon_id.png')">
                        <span class="info">ID:{{reqData.showId}}</span>
                    </span>
                </div>
            </div>
            <div class="gift-box" v-if="giftIconList && giftIconList.length > 0">
                <p class="intro-item-title">礼物柜</p>
                <div class="gift-list">
                    <img v-for="imgSrc in giftIconList" :src="imgSrc">
                </div>
            </div>
        </div>
        <div class="nav-video-content" v-show="activeTabIndex === 1">
            <div v-if="reqData.videos && reqData.videos.length > 0">
                <div class="video-cover"
                     v-for="(video,index) in reqData.videos"
                     @click="playVideo(index)"
                >
                    <img :src="video.coverUrl" class="cover-img">
                    <img src="../assets/image/icon/icon_play.png" class="play-icon"  @click="playVideo(index)">
                </div>
            </div>
            <p class="no-video" v-else>暂时没有视频</p>
        </div>

        <div class="video-wrap" v-for="(item,index) in reqData.videos" v-show="isActiveVideo === index">
            <video  class="my-video"
                    :src="item.videoUrl"
                    playsinline="true"
                    :poster="item.coverUrl"
                    webkit-playsinline="true"
                    x5-video-player-type="h5"
                    preload="auto"
                    x-webkit-airplay="true"
                    loop="loop"
                    width="100%"
                    height="100%"
                    style="object-fit: cover;"
            ></video>
            <img src="../assets/image/icon/button/icon_close_opacity.png" class="close-video" @click="closeVideo(index)">
        </div>

        <div class="tabbar">
            <img src="../assets/image/icon/button/icon_msg@3x.png" class="img-btn" @click="jumpToImChat">
            <img src="../assets/image/icon/button/icon_yy@3x.png" class="img-btn" @click="showMsgBox">
            <img src="../assets/image/icon/button/icon_gz@3x.png" class="img-btn" @click="showMsgBox">
            <div class="video-btn" :class="{'video-not-available': reqData.status != 2}" @click="chatByVideo">
                <img src="../assets/image/icon/button/icon_video@3x.png">
                <span>视频聊</span>
            </div>
        </div>

        <!-- 下载提示弹窗 -->
        <MyConfirmMsgBox v-model="isMsgBoxShow"></MyConfirmMsgBox>
    </div>
</template>

<script>
    export default {
        name: 'beautyListItem',
        data() {
            return {
                curUserId: '',
                albumList: [], // 请求回来的相册
                reqData: {}, // 请求回来的所有数据对象
                isMsgBoxShow: false, // 显示弹窗信息的标志
                curStatus: null,
                sweetList: [], // 亲密榜
                giftIconList: [], // 礼物列表
                activeTabIndex: 0,
                isActiveVideo: null, // 是否播放video的标志
                videoLength: null,
            }
        },
        components: {
            MySwiper: require('../components/MyImageSwiper.vue').default,
            MyConfirmMsgBox: require('../components/MyConfirmMsgBox.vue').default,
        },
        mounted() {
            // 获取当前的userId
            this.curUserId = this.$route.query.userid;
            // 获取主播详情信息
            this.http.get('user/userCenter/ProfileVo340', {
                appId: 1,
                profileId: this.curUserId
            }).then(res => {
                // 赋值所有的返回数据
                this.reqData = res.dataCollection;
                console.log(this.reqData);
                // 赋值主播图片列表(组合photos和albums)
                let photos = res.dataCollection.photos || [],
                    albums = res.dataCollection.album || [];
                this.albumList = Array.from(new Set(photos.concat(albums)));

                // 最多显示8个礼物
                let giftIcons = res.dataCollection.giftIcons;
                if (giftIcons) {
                    this.giftIconList = giftIcons.splice(0, 8);
                }

                // 更新当前在线状态
                this.curStatus = res.dataCollection.status;
                // 更新视频条数
                let videoLength = res.dataCollection.videos.length;
                if (videoLength > 0) {
                    this.videoLength = videoLength;
                }
                // 请求亲密度接口
                this.http.get('user/userCenter/profileVo340/sweetRanking', {
                    appId: 1,
                    profileId: this.curUserId,
                    extraOption: {
                        noLoading: true
                    }
                }).then(res => {
                    // 最多显示8个，接口返回的列表亲密度值已经是倒叙排列，此处不用再排序
                    this.sweetList = res.dataCollection.splice(0, 8);
                });
            });
        },
        methods: {
            showMsgBox() {
                // 安卓系统中的微信，弹窗提示
                if (this.util.isWechatEnv() && this.util.curDevice() === 'android') {
                    this.util.downLoadApp('tip');
                } else {
                    this.isMsgBoxShow = true;
                }
            },
            // 点击切换navbar的事件方法
            navbarChage(activeTabIndex) {
                // 每次点击更换当前的activeIndex
                this.activeTabIndex = activeTabIndex;
            },
            // 点击播放视频
            playVideo(index) {
                this.isActiveVideo = index;
                document.querySelectorAll('.my-video')[index].play();
            },
            closeVideo(index) {
                document.querySelectorAll('.my-video')[index].pause();
                this.isActiveVideo = null;
            },
            jumpToImChat() {
                let beautyInfo = this.reqData;
                // 把将要对话的组播基础信息传给im对话页
                let beautyBaseInfo = {
                    netid: beautyInfo.yunxinId,
                    userid: beautyInfo.id,
                    nickname: beautyInfo.nickName,
                    headurl: beautyInfo.portrait,
                    // gradeHeadUrl: beautyInfo.gradeHeadUrl,
                    // userType: beautyInfo.userType
                };

                this.util.goPage({name: 'beautyChatContent',query: beautyBaseInfo});

                // if (!window.localStorage.getItem(beautyInfo.yunxinId)) {
                //     window.localStorage.setItem(beautyInfo.yunxinId, JSON.stringify(beautyBaseInfo));
                // }
            },
            // 点击进行视频聊天
            chatByVideo() {
                let loginInfo = this.util.getStorage('loginInfo');
                // 1. 当前主播不是处于空闲状态，则不能进行视频通话
                if (this.reqData.status != 2) {
                    return;
                }
                // 2. 如果没有登陆则跳转到登陆页
                if (!loginInfo) {
                    this.util.goPage('login');
                    return;
                }
                // 3. 如果没有绑定手机号，则提醒用户绑定
                if (loginInfo.isBind !== 1) {
                    this.$store.commit('setBindBoxTag', {
                        type: 'bindPhoneBox',
                        isBindPhoneBoxShow: true
                    });
                    return;
                }
                // 4. 判断当前设备是否支持视频播放，不支持则提醒下载
                if (!this.util.isSupportVideoChat()) {
                    if (this.util.isWechatEnv() && this.util.curDevice() === 'android') {
                        this.util.downLoadApp('tip');
                    } else {
                        this.isMsgBoxShow = true;
                    }
                    return;
                }
                // 5. 获取主播基本信息并调用发放进行播放
                let reqBeautyInfo = this.reqData;
                let beautyInfo = {
                    userId: reqBeautyInfo.id,
                    portrait: reqBeautyInfo.portrait,
                    nickName: reqBeautyInfo.nickName,
                    gradeIcon: reqBeautyInfo.gradeIcon,
                    yunxinId: reqBeautyInfo.yunxinId,
                };
                this.func.chatByVideo(beautyInfo);
            }
        }
    }
</script>

<style lang="less" scoped>
    @import "../assets/less/variable";

    .wrapper {
        overflow: scroll;
        // 解决上拉滑动卡顿的问题
        -webkit-overflow-scrolling: touch;
    }

    .swipper-content {
        width: 100%;
        height: 3.75rem;
    }

    .tabbar {
        width: 100%;
        padding: 0 0.15rem;
        box-sizing: border-box;
        position: fixed;
        bottom: 0;
        background-color: @white;
        height: 0.56rem;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .img-btn {
            width: 0.36rem;
            height: 0.36rem;
        }

        .video-btn {
            width: 1.83rem;
            height: 0.36rem;
            background-image: linear-gradient(-270deg, #A1EC0B 0%, #67CB00 100%);
            border-radius: 1rem;
            font-size: 0.14rem;
            font-weight: bold;
            display: flex;
            color: @white;
            justify-content: center;
            align-items: center;

            img {
                height: 0.16rem;
                margin-right: 0.05rem;
            }
        }
        .video-not-available {
            background-image: none;
            background-color: @gray4;
        }
    }

    .basic-info {
        width: 100%;
        box-sizing: border-box;
        padding: 0 0.15rem;
        margin-top: 0.2rem;

        .nickname-rank {
            display: flex;

            span {
                max-width: 2rem;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                font-size: 0.2rem;
                font-weight: bold;
                color: @black1;
            }

            img {
                height: 0.16rem;
                align-self: flex-end;
                margin-left: 0.05rem;
            }
        }

        .chat-price {
            height: 0.16rem;
            margin-top: 0.06rem;

            > span {
                display: inline-block;
                height: 100%;
                line-height: 0.14rem;
                font-size: 0.1rem;
                padding: 0 0.04rem;
                box-sizing: border-box;
                border-radius: 0.04rem;

                img {
                    height: 0.09rem;
                }

                span {
                    margin-left: 0.02rem;
                }
            }

            .unit-price, .audio-price {
                color: @red4;
                border: 1px solid @red4;
                margin-right: 0.04rem;
            }

            .answer-rate {
                img {
                    height: 0.1rem;
                }

                color: @gray5;
                border: 1px solid @gray5;
            }

        }

        .like-fans {
            height: 0.14rem;
            display: flex;
            align-items: flex-end;
            margin-top: 0.2rem;

            .stress-word {
                color: @black1;
                font-size: 0.14rem;
                font-weight: bold;
            }

            .normal-word {
                color: #9096A2;
                font-size: 0.12rem;
                margin-left: 0.04rem;
            }

            .vertical-line {
                width: 0.02rem;
                height: 0.08rem;
                align-self: center;
                background-color: #E9EBEF;
                border-radius: 0.02rem;
                margin: 0 0.1rem;
            }
        }

        .intro {
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            margin-top: 0.2rem;
            font-size: 0.14rem;
            color: @black1;
        }
    }

    .navbar-part {
        width: 100%;
        margin-top: 0.4rem;

        .navbar {
            width: 100%;
            height: 0.25rem;
            box-sizing: border-box;
            display: flex;
            padding-left: 0.15rem;
            justify-content: flex-start;
            align-items: flex-start;
            border-bottom: 0.02rem solid @gray1;
            font-size: 0.16rem;
            color: #9096A2;

            li {
                height: 100%;
                padding: 0 0.15rem;
                margin-right: 0.15rem;
            }

            .active {
                color: @black1;
                border-bottom: 0.02rem solid @red4;
            }

        }
    }

    .nav-intro-content {
        width: 100%;
        padding: 0 0.15rem;
        box-sizing: border-box;

        .intro-item-title {
            font-size: 0.12rem;
            color: @black1;
        }

        // 亲密榜
        .sweet-rank {
            margin-top: 0.4rem;

            .sweet-list {
                width: 100%;
                margin-top: 0.15rem;
                height: 0.35rem;
                display: flex;

                img {
                    width: 0.35rem;
                    height: 0.35rem;
                    border-radius: 50%;
                    margin-right: 0.09rem;
                }
            }
        }

        // 标签部分
        .label-list {
            width: 100%;
            margin-top: 0.3rem;

            .label-wrap {
                margin-top: 0.08rem;
                width: 100%;
                display: flex;
                flex-wrap: wrap;

                span {
                    font-size: 0.14rem;
                    color: @white;
                    border-radius: 0.12rem;
                    padding: 0.05rem 0.1rem;
                    margin: 0.07rem 0.1rem 0 0;
                }

            }
        }

        // 个人信息部分
        .personal-info {
            width: 100%;
            margin-top: 0.3rem;

            .personal-info-content {
                width: 100%;
                display: flex;
                flex-wrap: wrap;
                font-size: 0.14rem;
                color: #9096A2;

                .info-item {
                    border: 1px solid #D2D5D9;
                    border-radius: 0.12rem;
                    padding: 0.03rem 0.09rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin: 0.15rem 0.08rem 0 0;

                    img {
                        height: 0.13rem;
                    }

                    .info {
                        margin-left: 0.02rem;
                    }
                }
            }
        }

        // 礼物柜部分
        .gift-box {
            width: 100%;
            margin-top: 0.3rem;

            .gift-list {
                width: 100%;
                margin: 0.15rem 0 1rem;
                display: flex;

                img {
                    width: 0.35rem;
                    height: 0.35rem;
                    margin-right: 0.09rem;
                }
            }
        }
    }

    .nav-video-content {
        width: 100%;
        margin: 0.08rem 0 1rem;
        div {
            width: 100%;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            // 此处用于解决换行之后排列问题
            &:after {
                content: '';
                width: 1.23rem;
            }
            .video-cover {
                width: 1.24rem;
                height: 1.6rem;
                margin-top: 0.02rem;
                position: relative;

                .cover-img {
                    object-fit: cover;
                    height: 100%;
                    width: 100%;
                    display: inline-block;
                }
                .play-icon {
                    width: 0.24rem;
                    height: 0.24rem;
                    position: absolute;
                    left:50%;
                    top:50%;
                    transform:translate(-50%,-50%);
                }
            }
        }
        // 无视频文字样式
        .no-video {
            width: 100%;
            margin-top: 0.2rem;
            text-align: center;
            font-size: 0.14rem;
            color: #8B8B8B;
        }
    }

    .video-wrap {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        background-color: black;

        .close-video {
            width: 0.35rem;
            height: 0.35rem;
            display: block;
            position: absolute;
            top: 0.15rem;
            left: 0.15rem;
            opacity: 0.8;
            z-index: 9999;
        }
    }
</style>
