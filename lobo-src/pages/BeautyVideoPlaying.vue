<template>
    <div>
        <swiper class="my-swiper"
                v-if="isFirstLoaded" v-model="curIndex"
                :isVideoLoad="videoList"
                :isNoMoreVideo="isNoMoreVideo"
                @getNewVideoStatus = "getNewVideoStatus"
        >
            <swiper-item v-for="(videoInfo,index) in videoList">
                <div class="video-part">
                    <video  class="my-video"
                            :src="videoInfo.videoUrl"
                            webkit-playsinline="true"
                            x5-video-player-type="h5"
                            preload="auto"
                            x-webkit-airplay="true"
                            loop="loop"
                            playsinline="true"
                            :poster="videoInfo.coverUrl"
                            width="100%"
                            height="100%"
                    ></video>
                    <img class="play-icon"
                         src="../assets/image/icon/icon_play.png"
                         v-if="videoIndex === index"
                         @click="playVideo(index)">
                    <div class="beauty-info">
                        <img :src="videoInfo.portrait"
                             class="portrait"
                             @click="util.goPage({name: 'beautyListItem', query: {userid: videoInfo.userId}})">
                        <span class="name">{{ videoInfo.nickName }}</span>
                        <img :src="videoInfo.gradeIcon" class="rank">
                    </div>
                    <div class="operations">
                        <div class="like-info">
                            <img src="../assets/image/icon/button/icon_like.png" @click="clickToDownload">
                            <span>{{videoInfo.praiseTimes}}</span>
                        </div>
                        <img src="../assets/image/icon/button/icon_share.png" class="share-video" @click="clickToShare">
                        <img src="../assets/image/icon/button/icon_video_call.png" class="video-call" @click="chatByVideo">
                    </div>
                </div>
            </swiper-item>
        </swiper>

        <!-- 下载提示弹窗 -->
        <MyConfirmMsgBox v-model="isMsgBoxShow"></MyConfirmMsgBox>

        <!-- 非vip弹窗提示视频已用完 -->
        <MyConfirmMsgBox2 v-model="isNoMoreVideo" :type="msgBoxType"></MyConfirmMsgBox2>
    </div>
</template>

<script>
    import swiper from '../components/videoPlay/Swiper'
    import SwiperItem from '../components/videoPlay/SwiperItem'

    export default {
        name: 'sample',
        data() {
            return {
                videoIndex: 0,
                curIndex: 0,
                curPageNo: 1,
                isFirstLoaded: false,
                userId: this.util.getStorage('loginInfo').userId,
                videoList: [],
                isMsgBoxShow: false, // 是否显示提示下载的标志
                isNoMoreVideo: false,
                msgBoxType: 'noMoreVideo',
            }
        },
        mounted() {
            // let lastMsgSentTime = this.util.getStorage('lastMsgSendTime') || 0;  // 最后一条消息发送时的时间戳
            // if (!this.util.isTodayTime(lastMsgSentTime)) {
            //     this.util.setStorage('leftMsg',10);
            // }

            let userId = this.userId;
            this.http.post('vod/videoCenter/queryVideoShow', {
                appId: 1,
                pageNo: 1,
                pageSize: 11,
                userId
            }).then(res => {
                this.$nextTick(function () {
                    this.videoList = this.videoList.concat(res.dataCollection);
                    this.isFirstLoaded = true;
                });

            });
        },
        methods: {
            // swiper组件emit该事件
            getNewVideoStatus(newVideoStatus) {
                this.isNoMoreVideo = newVideoStatus;
            },

            clickToDownload() {
                // 安卓系统中的微信，弹窗提示
                if (this.util.isWechatEnv() && this.util.curDevice() === 'android') {
                    this.util.downLoadApp('tip');
                } else {
                    this.isMsgBoxShow = true;
                }
            },

            clickToShare() {
                // 判断当前页面是否处于微信环境：
                // 1. 是微信环境则调用微信接口进行分享
                // if ( this.util.getStorage('isWechatEnv') === 'true') {
                //
                // }
                // // 2. 不是微信环境，则弹窗提示下载
                // else {
                this.clickToDownload();
                // }
            },
            playVideo(index) {
                document.querySelectorAll('.my-video')[index].play();
                // 去掉播放按钮
                this.videoIndex = null;
            },
            // 点击进行视频聊天
            chatByVideo() {
                let loginInfo = this.util.getStorage('loginInfo');
                // 1. 如果没有绑定手机号，则提醒用户绑定
                if (loginInfo.isBind !== 1) {
                    this.$store.commit('setBindBoxTag', {
                        type: 'bindPhoneBox',
                        isBindPhoneBoxShow: true
                    });
                    return;
                }
                // 2. 判断当前设备是否支持视频播放，不支持则提醒下载
                if (!this.util.isSupportVideoChat()) {
                    if (this.util.isWechatEnv() && this.util.curDevice() === 'android') {
                        this.util.downLoadApp('tip');
                    } else {
                        this.isMsgBoxShow = true;
                    }
                    return;
                }
                // 3. 判断当前设备是否支持视频播放，不支持则提醒下载
                let reqBeautyInfo = this.videoList[this.curIndex];
                let beautyInfo = {
                    userId: reqBeautyInfo.id,
                    portrait: reqBeautyInfo.portrait,
                    nickName: reqBeautyInfo.nickName,
                    gradeIcon: reqBeautyInfo.gradeIcon,
                    yunxinId: reqBeautyInfo.yunxinId,
                };
                this.func.chatByVideo(beautyInfo);
            }
        },

        components: {
            SwiperItem,
            swiper,
            MyConfirmMsgBox: require('../components/MyConfirmMsgBox.vue').default,
            MyConfirmMsgBox2: require('../components/MyConfirmMsgBox2.vue').default
        },

        watch: {
            // 监听curIndex，如果curIndex和videoIndex相等，说明有播放按钮，则去掉播放按钮
            curIndex(val) {
                let _this = this;
                if (val === _this.videoIndex) {
                    _this.videoIndex = null;
                }

                // 根据条件加载更多页视频
                if (this.curIndex > this.videoList.length - 5) {
                    this.http.post('vod/videoCenter/queryVideoShow', {
                        appId: 1,
                        pageNo: _this.curPageNo + 1,
                        pageSize: 10,
                        userId: _this.userId,
                        extraOption: {
                            noLoading: true
                        }
                    }).then(res => {
                        this.$nextTick(function () {
                            this.videoList = this.videoList.concat(res.dataCollection);
                        });
                    });
                }
            }
        },

        beforeRouteLeave(to, from, next) {
            // 离开本页面时给videoIndex赋值,让当前页面加上播放按钮
            this.videoIndex = this.curIndex;

            // 离开页面时确保关掉弹窗
            if (this.isNoMoreVideo) {
                this.isNoMoreVideo = false;
            }

            next();
        }
    }
</script>

<style lang="less" scoped>
    @import "../assets/less/variable";;

    .my-swiper {
        height: 100vh;
    }
    .video-part {
        position: relative;
        width: 100vw;

        // 让视频适应宽高，和宽高不匹配的部分会被裁剪
        .my-video {
            object-fit: cover;
        }

        .play-icon {
            width: 0.42rem;
            height: 0.42rem;
            position: absolute;
            left:50%;
            top:50%;
            transform:translate(-50%,-50%);
        }
        .beauty-info {
            display: flex;
            align-items: center;
            position: absolute;
            left:0.12rem;
            bottom:0.64rem;
            height: 0.4rem;
            @keyframes portrait-rotate {
                from {transform: rotate(0deg);}
                to {transform: rotate(360deg);}
            }
            .portrait {
                width: 0.4rem;
                height: 0.4rem;
                border-radius: 100%;
                animation: portrait-rotate 3s linear infinite;
            }
            .name {
                font-size: 0.14rem;
                font-weight: bold;
                color: @white;
                margin-left: 0.05rem;
            }
            .rank {
                height: 0.14rem;
                margin-left: 0.05rem;
            }
        }
        .operations {
            width: 0.36rem;
            position: absolute;
            right: 0.12rem;
            bottom: 0.66rem;
            display: flex;
            flex-direction: column;
            .like-info {
                width: 0.36rem;
                display: flex;
                flex-direction: column;
                align-items: center;
                img {
                    width: 0.36rem;
                    height: 0.36rem;
                }
                span {
                    margin-top: 0.05rem;
                    font-size: 0.12rem;
                    font-weight: bold;
                    color: @white;
                }
            }
            .share-video,.video-call {
                width: 0.36rem;
                height: 0.36rem;
                margin-top: 0.15rem;
            }
        }
    }
</style>
