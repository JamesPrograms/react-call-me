<template>
    <div class="content">
        <div class="video-part">
            <video class="my-video"
                   :src="videoInfo.videoUrl"
                   webkit-playsinline="true"
                   x5-video-player-type="h5"
                   preload="true"
                   x-webkit-airplay="true"
                   loop="loop"
                   playsinline="true"
                   :poster="videoInfo.coverUrl"
                   width="100%"
                   height="100%"
                   @play="listenPlayVideo"
                   @pause="listenPauseVideo"
            ></video>
            <button class="btn-switch" @click="changeVideo">切换主播</button>
            <img class="play-icon"
                 src="../assets/image/icon/icon_play.png"
                 v-show="!isVideoPlay"
                 @click="playVideo">
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
        name: 'videoPlayInAndriodWechat',
        data() {
            return {
                isVideoPlay: false,
                curIndex: 0,
                curPageNo: 1,
                userId: this.util.getStorage('loginInfo').userId,
                videoList: [],
                isMsgBoxShow: false, // 是否显示提示下载的标志
                isNoMoreVideo: false,
                msgBoxType: 'noMoreVideo',
                video: null,
            }
        },
        computed: {
            videoInfo() {
                return this.videoList[this.curIndex] || {};
            }
        },
        mounted() {
            let userId = this.userId;
            let _this = this;
            _this.video = document.querySelector('.my-video');
            _this.$nextTick(function () {
                _this.http.post('vod/videoCenter/queryVideoShow', {
                    appId: 1,
                    pageNo: 1,
                    pageSize: 11,
                    userId
                }).then(res => {
                    _this.videoList = this.videoList.concat(res.dataCollection);
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
            playVideo() {
                this.video.play();
            },

            listenPlayVideo() {
                this.isVideoPlay = true;
            },

            listenPauseVideo() {
                this.isVideoPlay = false;
            },

            changeVideo() {
                if (this.curIndex === 9) {
                    this.isNoMoreVideo = true;
                    return;
                }
                this.curIndex = this.curIndex + 1;
                this.$nextTick(() => {
                    this.video.play();
                });

            },

            chatByVideo() {
                this.util.downLoadApp('tip');

                // 获取主播基本信息
               /* let reqBeautyInfo = this.videoList[this.curIndex];
                let beautyInfo = {
                    userId: reqBeautyInfo.userId,
                    portrait: reqBeautyInfo.portrait,
                    nickName: reqBeautyInfo.nickName,
                    gradeIcon: reqBeautyInfo.gradeIcon,
                    yunxinId: reqBeautyInfo.yunxinId,
                };
                this.func.chatByVideo(beautyInfo);*/
            }
        },

        components: {
            SwiperItem,
            swiper,
            MyConfirmMsgBox: require('../components/MyConfirmMsgBox.vue').default,
            MyConfirmMsgBox2: require('../components/MyConfirmMsgBox2.vue').default
        },

        watch: {
            // 监听curIndex，根据条件加载更多页视频
            curIndex() {
                let _this = this;
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
            // 离开本页面时让当前页面加上播放按钮
            this.video.pause();

            // 离开页面时确保关掉弹窗
            if (this.isNoMoreVideo) {
                this.isNoMoreVideo = false;
            }

            next();
        }
    }
</script>

<style lang="less" scoped>
    @import "../assets/less/variable";

    .content {
        width: 100vw;
        height: 100vh;
        overflow: hidden;
    }

    .video-part {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;

        // 让视频适应宽高，和宽高不匹配的部分会被裁剪
        .my-video {
            object-fit: cover;
        }

        .btn-switch {
            background: linear-gradient(to right, #FF0179, #FF4BD1);
            color: @white;
            font-size: 0.14rem;
            font-weight: bold;
            border-top-right-radius: 0.24rem;
            border-bottom-right-radius: 0.24rem;
            padding: 0.04rem 0.1rem;
            display: flex;
            justify-content: center;
            align-items: center;
            position: absolute;
            left: 0.12rem;
            bottom: 1.2rem;
        }

        .play-icon {
            width: 0.42rem;
            height: 0.42rem;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
        }

        .beauty-info {
            display: flex;
            align-items: center;
            position: absolute;
            left: 0.12rem;
            bottom: 0.64rem;
            height: 0.4rem;
            @keyframes portrait-rotate {
                from {
                    transform: rotate(0deg);
                }
                to {
                    transform: rotate(360deg);
                }
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

            .share-video, .video-call {
                width: 0.36rem;
                height: 0.36rem;
                margin-top: 0.15rem;
            }
        }
    }
</style>
