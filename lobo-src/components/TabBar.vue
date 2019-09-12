<template>
    <ul class="tab-bar" :class="{'video-tab-bar': isVideoTabBar, 'android-origin-browser': isAndroidOriginBrowser}" style="z-index: 2009">
        <router-link to="/beautyList" tag="li">
            <div class="icon-beauty-list"></div>
            <p>美女聊</p>
        </router-link>
        <router-link to="/beautyRanking" tag="li">
            <div class="icon-beauty-ranking"></div>
            <p>排行榜</p>
        </router-link>
        <router-link to="/beautyVideoPlaying" tag="li">
            <div class="icon-beauty-video"></div>
            <p>视频秀</p>
        </router-link>
        <router-link to="/beautyChatList" tag="li">
            <div class="icon-beauty-news">
                <div class="red-point" v-show="hasUnreadMsg"></div>
            </div>
            <p>消息</p>
        </router-link>
        <router-link to="/beautyCustomInfo" tag="li">
            <div class="icon-beauty-info"></div>
            <p>我的</p>
        </router-link>
    </ul>
</template>

<script>
    export default {
        name: 'tabBar',
        data() {
            return {
                isVideoTabBar: false,
                isAndroidOriginBrowser: false
            }
        },
        mounted() {
            // 防止刷新视频播放页面后isVideoTabBar又变为初始状态
            if (this.$route.path === '/beautyVideoPlaying') {
                this.isVideoTabBar = true;
                // 如果是安卓端原生浏览器
                if (this.util.curDevice() === 'android' && !this.util.isWechatEnv() && !this.util.isQqBrowser()) {
                    this.isAndroidOriginBrowser = true;
                }
            }
        },
        watch: {
            // 监听路由变化，当路由跳到视频秀页面前，设置tabbar的样式为类video-tab-bar的样式
            $route(to,from) {
                if (to.name === 'beautyVideoPlaying') {
                    this.isVideoTabBar = true;
                    // 如果是安卓端原生浏览器
                    if (this.util.curDevice() === 'android' && !this.util.isWechatEnv() && !this.util.isQqBrowser()) {
                        this.isAndroidOriginBrowser = true;
                    }
                } else {
                    this.isVideoTabBar = false;
                    this.isAndroidOriginBrowser = false;
                }
            }
        },
        computed: {
            hasUnreadMsg() {
                let sessionlist = this.$store.state.sessionlist;
                if (sessionlist.length > 0) {
                    // 会话中有未读消息，就在tabbar的消息处显示红点，否则不显示
                    for (let sessionInfo of sessionlist) {
                        if (sessionInfo.unread) {
                            return true;
                        }
                    }
                }
                return false;
            }
        }
    }
</script>

<style lang="less" scoped>
    @import "../assets/less/variable";

    // 视频秀以外页面的tabbar样式
    .tab-bar {
        width: 100%;
        height: 0.48rem;
        position: fixed;
        display: flex;
        bottom: 0;
        justify-content: space-around;
        font-size: 0.1rem;

        background-color: @white;
        border-top: 1px solid #EFEFEF;
        color: @gray8;

        .icon-beauty-list {
            background: url("../assets/image/icon/tabBar/icon_home@3x.png");
            background-size: cover;
        }
        .icon-beauty-ranking {
            background: url("../assets/image/icon/tabBar/icon_phb@3x.png");
            background-size: cover;
        }
        .icon-beauty-video {
            background: url("../assets/image/icon/tabBar/icon_spx@3x.png");
            background-size: cover;
        }
        .icon-beauty-news {
            background: url("../assets/image/icon/tabBar/icon_xx@3x.png");
            background-size: cover;
            position: relative;
            .red-point {
                position: absolute;
                width: 0.06rem;
                height: 0.06rem;
                background-color: #F9517E;
                border-radius: 100%;
                top: 0.01rem;
                right: 0.01rem;
            }
        }
        .icon-beauty-info {
            background: url("../assets/image/icon/tabBar/icon_wd@3x.png");
            background-size: cover;
        }

        .router-link-active {
            color: @red4;
            .icon-beauty-list {
                background: url("../assets/image/icon/tabBar/icon_home_active@3x.png");
                background-size: cover;
            }
            .icon-beauty-ranking {
                background: url("../assets/image/icon/tabBar/icon_phb_active@3x.png");
                background-size: cover;
            }
            .icon-beauty-video {
                background: url("../assets/image/icon/tabBar/icon_spx@3x.png");
                background-size: cover;
            }
            .icon-beauty-news {
                background: url("../assets/image/icon/tabBar/icon_xx_active@3x.png");
                background-size: cover;
            }
            .icon-beauty-info {
                background: url("../assets/image/icon/tabBar/icon_wd_active@3x.png");
                background-size: cover;
            }
        }

        li {
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            div {
                width: 0.24rem;
                height: 0.24rem;
            }
            p {
                margin-top: 0.02rem;
            }
        }
    }

    // 视频秀页面的tabbar样式
    .video-tab-bar {
        background-color: rgba(0,0,0,0);
        border-top: 1px solid rgba(255,255,255,0.2);
        background-image: linear-gradient(-180deg, rgba(56,40,40,0.00) 2%, rgba(56,40,40,0.30) 98%);

        li {
            color: @white;
            opacity: 0.5;
        }

        .icon-beauty-list {
            background: url("../assets/image/icon/tabBar/icon_home2@3x.png");
            background-size: cover;
        }
        .icon-beauty-ranking {
            background: url("../assets/image/icon/tabBar/icon_phb2@3x.png");
            background-size: cover;
        }
        .icon-beauty-video {
            background: url("../assets/image/icon/tabBar/icon_spx2@3x.png");
            background-size: cover;
        }
        .icon-beauty-news {
            background: url("../assets/image/icon/tabBar/icon_xx2@3x.png");
            background-size: cover;
        }
        .icon-beauty-info {
            background: url("../assets/image/icon/tabBar/icon_wd2@3x.png");
            background-size: cover;
        }

        .router-link-active {
            color: @white;
            opacity: 1;
            .icon-beauty-video {
                background: url("../assets/image/icon/tabBar/icon_spx2@3x.png");
                background-size: cover;
            }
        }
    }

    // 安卓端浏览器tab-bar
    .android-origin-browser {
        background: black;
    }
</style>
