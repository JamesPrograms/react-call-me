<template>
    <div>
        <!--<div class="banner">
            <div class="swiper-wrap">
                <mt-swipe :show-indicators="false" :auto="3000">
                    <mt-swipe-item v-for="(item,index) in bannerList" :key="index">
                        <div class="img-wrap">
                            <img :src="item.imgUrl" class="album-img" @click="jumpToLink(item.linkToUrl)">
                        </div>
                    </mt-swipe-item>
                </mt-swipe>
            </div>
        </div>-->

        <ul class="navBar">
            <li v-for="(item, index) in homeNavBarData" :class="{active: activeMenuIndex === index}"
                @click="changeTab(item.id, index)">{{ item.name }}
            </li>
        </ul>

        <div class="load-more">
            <mt-loadmore
                    :top-method="loadTop"
                    :bottom-method="loadBottom"
                    :bottom-all-loaded="allLoaded"
                    :auto-fill="false"
                    ref="loadmore"
            >
                <div class="display-list">
                    <!-- 点击跳转到主播详情页 -->
                    <div class="list-item" v-for="item in curDataList"
                         @click="util.goPage({name: 'beautyListItem', query: {userid: item.userId}})">
                        <div class="cover-part">
                            <img :src="item.cover" :alt="item.nickName +'图片'">
                            <p class="status" :class="'status-bgc-'+ item.status"></p>
                        </div>
                        <p class="name-grade">
                            <span>{{item.nickName}}</span>
                            <img :src="item.gradeIcon">
                        </p>
                    </div>
                </div>
            </mt-loadmore>
        </div>

        <DownloadAppBtn/>
    </div>

</template>

<script>
    import {mapState} from 'vuex';

    export default {
        name: 'beautyList',
        components: {
            DownloadAppBtn: require('../components/DownloadAppBtn.vue').default
        },
        data() {
            return {
                activeMenuIndex: null,
                curMenuId: null,
                curDataList: [],
                // bannerList: [],
                pageSize: 20,
                pageNum: 1,
                scrollTop: null,
                totalPage: null,
                allLoaded: false
            }
        },
        mounted() {
            // 请求banner列表
            /*this.http.post('mapper/advert/getBannerList', {
                type: 2, // 1：大图（老版本默认）2：小图
                deviceType: this.util.curDevice() === 'android' ? 1:2 //1：Android 2：IOS
            }).then(res => {
                this.bannerList = res.dataCollection;
            });*/

            // beautyList组件挂载成功后首先判断是否有顶部导航数据
            if (!this.homeNavBarData) {
                // 没有顶部导航数据需要先加载
                this.http.post('mapper/menu/getHomeList', {
                    appId: 1,
                    // userId: this.util.getStorage('loginInfo').userId
                }).then(res => {
                    // 获取渲染navbar导航需要的列表数据

                    // 因为h5中没有做关注功能，这里筛选出不是关注的数据
                    let menuList = res.dataCollection.menuList;
                    menuList = menuList.filter((item) => {
                        return item.name !== '关注';
                    });
                    // 更新状态homeNavBarData
                    this.$store.commit('setNavBarData', menuList);
                    // 展示第一个顶部导航首页列表
                    this.changeTab(menuList[0].id, 0);
                });
            }
        },
        computed: {
            ...mapState([
                'homeNavBarData',
            ])
        },
        methods: {
            jumpToLink(linkUrl) {
                location.href = linkUrl;
            },
            changeTab(menuId, activeMenuIndex) {
                this.pageNum = 1;
                this.activeMenuIndex = activeMenuIndex;
                this.curMenuId = menuId;
                this.http.post('mapper/list/getHomeData', {
                    appId: 1,
                    menuId: this.curMenuId,
                    pageNo: 1,
                    pageSize: this.pageSize,
                    extraOption: {
                        noLoading: true
                    }
                }).then((res) => {
                    this.allLoaded = false;
                    if (res.currentPage === res.totalPage) {
                        this.allLoaded = true;
                    }
                    // 把请求到的数据添加到列表
                    this.curDataList = res.dataCollection;
                })
            },

            loadTop() {
                this.http.post('mapper/list/getHomeData', {
                    appId: 1,
                    menuId: this.curMenuId,
                    pageNo: 1,
                    pageSize: this.pageSize,
                    extraOption: {
                        noLoading: true
                    }
                }).then((res) => {
                    this.pageNum = 1;
                    this.allLoaded = false;
                    if (res.currentPage === res.totalPage) {
                        this.allLoaded = true;
                    }
                    // 把请求到的数据添加到列表
                    this.curDataList = res.dataCollection;
                    this.$refs.loadmore.onTopLoaded();
                })
            },
            loadBottom() {
                this.pageNum = this.pageNum + 1;
                this.http.post('mapper/list/getHomeData', {
                    appId: 1,
                    menuId: this.curMenuId,
                    pageNo: this.pageNum,
                    pageSize: this.pageSize,
                    extraOption: {
                        noLoading: true
                    }
                }).then((res) => {
                    // 把请求到的数据添加到列表
                    this.curDataList = this.curDataList.concat(res.dataCollection);
                    this.$refs.loadmore.onBottomLoaded();
                    if (res.currentPage === res.totalPage) {
                        this.allLoaded = true;
                    }
                })
            }
        },
        //进入该页面时，用之前保存的滚动位置赋值
        beforeRouteEnter (to, from, next) {
            next(vm => {
                document.querySelector('.load-more').scrollTop = vm.scrollTop;
            })
        },
        //在页面离开时记录滚动位置
        beforeRouteLeave (to, from, next) {
            this.scrollTop = document.querySelector('.load-more').scrollTop;
            next();
        }
    }
</script>

<style lang="less" scoped>
    @import "../assets/less/variable";

    .banner {
        width: 100%;
        box-sizing: border-box;
        padding: 0.15rem 0.15rem 0;
        height: 0.96rem;
        position: fixed;
        left: 0;
        top: 0;
        .swiper-wrap {
            width: 100%;
            height: 100%;
            .img-wrap {
                width: 100%;
                height: 100%;
                background-color: @white;
                display: flex;
                justify-content: center;
                .album-img {
                    object-fit: cover;
                    height: 100%;
                    width: 100%;
                    border-radius: 0.06rem;
                    display: inline-block;
                }
            }
        }
    }

    .navBar {
        width: 100%;
        position: fixed;
        left: 0;
        top: 0;
        z-index: 3000;
        background-color: @white;
        padding: 0.15rem 0 0.15rem 0.15rem;
        box-sizing: border-box;
        height: 0.51rem;
        overflow-x: scroll;
        // 解决滑动卡顿问题: 即使用滚动回弹效果，当手指从触屏上一开，内容会保持一段时间滚动效果
        -webkit-overflow-scrolling: touch;
        white-space: nowrap; //可以强制目前布局而不让子元素自动换行

        li {
            display: inline-block;
            margin-right: 0.11rem;
            height: 0.21rem;
            line-height: 0.21rem;
            font-size: 0.14rem;
            padding: 0 0.09rem;
            color: @black1;
        }

        .active {
            background-color: @red4;
            border-radius: 1rem;
            color: @white;
            font-weight: bold;
        }
    }


    .load-more {
        overflow: scroll;
        // 解决上拉滑动卡顿的问题
        -webkit-overflow-scrolling: touch;
        width: 100%;
        height: auto;
        position: fixed;
        top: 0.51rem;
        bottom: 0.49rem;
        z-index: 3001;
    }

    .display-list {
        width: 100%;
        box-sizing: border-box;
        padding: 0 0.15rem;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
    }

    .list-item {
        width: 1.7rem;

        .cover-part {
            width: 100%;
            height: 1.7rem;
            border-radius: 0.08rem;
            position: relative;

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 0.08rem;
            }

            .status {
                width: 0.08rem;
                height: 0.08rem;
                position: absolute;
                right: 0.08rem;
                bottom: 0.08rem;
                border-radius: 50%;
            }

            // 忙碌
            .status-bgc-3 {
                background-color: #FF7D7D;
            }

            // 空闲
            .status-bgc-2 {
                background-color: #14E952;
            }

            // 勿扰
            .status-bgc-1 {
                background-color: #BDBDBD;
            }
        }

        .name-grade {
            height: 0.14rem;
            padding: 0.1rem 0 0.15rem;
            color: @black1;
            font-size: 0.14rem;
            font-weight: bold;
            display: flex;

            span {
                display: inline-block;
                max-width: 1.26rem;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            img {
                height: 0.14rem;
                width: auto;
                max-width: 0.31rem;
                margin-left: 0.06rem;
            }
        }
    }

</style>
