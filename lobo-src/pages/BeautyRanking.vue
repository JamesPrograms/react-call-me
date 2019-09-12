<template>
    <div>
        <ul class="nav-bar">
            <li v-for="item in rankNavData" :class="{'first-nav-active': curMenuId === item.menuId}" @click="changeFirstNav(item.menuId)">{{item.name}}</li>
        </ul>

        <div class="load-more">
            <mt-loadmore
                    :bottom-method="loadBottom"
                    :bottom-all-loaded="allLoaded"
                    ref="loadmore"
                    :auto-fill="false"
            >
                <div class="submenu-top3">
                    <ul class="sub-nav-bar"
                        v-for="firstNav in rankNavData"
                        v-show="curMenuId === firstNav.menuId">
                        <li v-for="subNav in firstNav.child"
                            :class="{'sub-nav-active': curSubMenuId === subNav.menuId}"
                            @click="changeSubNav(subNav.menuId)"
                        >{{subNav.name}}</li>
                    </ul>

                    <div class="top-three-part">
                        <div class="top-one">
                            <div class="top-one-img">
                                <img :src="curTopOneInfo.portrait"
                                     @click="jumpToDetailPage(curTopOneInfo.userId)"
                                     class="portrait">
                                <img src="../assets/image/rank-page/icon_gold.png" class="gold-crown-icon">
                                <img :src="curTopOneInfo|getFollowIcon" class="follow-status-icon" @click="showMsgBox(curTopOneInfo)">
                            </div>
                            <p class="name-rank" @click="jumpToDetailPage(curTopOneInfo.userId)">
                                <span class="name">{{curTopOneInfo.nickName}}</span>
                                <img :src="curTopOneInfo.gradeIcon" class="rank">
                            </p>
                        </div>
                        <div class="top-2-3">
                            <div class="top-2">
                                <div class="top-img">
                                    <img :src="curTopTwoInfo.portrait"
                                         @click="jumpToDetailPage(curTopTwoInfo.userId)"
                                         class="portrait">
                                    <img src="../assets/image/rank-page/icon_copper.png" class="crown-icon">
                                    <img :src="curTopTwoInfo|getFollowIcon" class="follow-status-icon" @click="showMsgBox(curTopTwoInfo)">
                                </div>
                                <p class="name-rank" @click="jumpToDetailPage(curTopTwoInfo.userId)">
                                    <span class="name">{{curTopTwoInfo.nickName}}</span>
                                    <img :src="curTopTwoInfo.gradeIcon" class="rank">
                                </p>
                            </div>
                            <div class="top-3">
                                <div class="top-img">
                                    <img :src="curTopThreeInfo.portrait"
                                         @click="jumpToDetailPage(curTopThreeInfo.userId)"
                                         class="portrait">
                                    <img src="../assets/image/rank-page/icon_silver.png" class="crown-icon">
                                    <img :src="curTopThreeInfo|getFollowIcon" class="follow-status-icon" @click="showMsgBox(curTopThreeInfo)">
                                </div>
                                <p class="name-rank" @click="jumpToDetailPage(curTopThreeInfo.userId)">
                                    <span class="name">{{curTopThreeInfo.nickName}}</span>
                                    <img :src="curTopThreeInfo.gradeIcon" class="rank">
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="display-list">
                    <div class="list-item" v-for="beautyInfo in curRankListData">
                        <span class="serial-num">{{beautyInfo.ranking}}</span>
                        <div class="beauty-info" @click="jumpToDetailPage(beautyInfo.userId)">
                            <img :src="beautyInfo.portrait" class="portrait">
                            <span class="name">{{beautyInfo.nickName}}</span>
                            <img :src="beautyInfo.gradeIcon" class="rank">
                        </div>
                        <img :src="beautyInfo|getFollowIcon" class="follow-status" @click="showMsgBox(beautyInfo)">
                    </div>
                </div>
            </mt-loadmore>
        </div>

        <!-- 下载提示弹窗 -->
        <MyConfirmMsgBox v-model="isMsgBoxShow"></MyConfirmMsgBox>

        <DownloadAppBtn/>
    </div>
</template>

<script>
    export default {
        name: 'beautyRanking',
        data() {
            return {
                rankNavData: [], // 导航信息列表
                currentPage: 0, // 请求的页数
                rankList: {},  // 用于存储的列表对象
                isMsgBoxShow: false, // 显示弹窗信息的标志
                allLoaded: false, // 数据全部加载成功后的标志
                curMenuId: null, // 一级导航menuId
                curSubMenuId: null, // 二级导航menuId
                curTopOneInfo: {}, // top one主播信息
                curTopTwoInfo: {}, // top two主播信息
                curTopThreeInfo: {}, // top three主播信息
                curRankListData: [],  // 当前前三位之后的主播列表
                scrollTop: null, // list容器滚动条位置
            }
        },
        components: {
            MyConfirmMsgBox: require('../components/MyConfirmMsgBox.vue').default,
            DownloadAppBtn: require('../components/DownloadAppBtn.vue').default

        },
        mounted() {
            // 请求顶部导航和二级导航数据
            this.http.get('mapper/rank/rankingListMenu', {
                appId: 1
            }).then(res => {
                // 页面只显示魅力榜和富豪榜
                let rankNavData = res.dataCollection.slice(0, 2);
                // 将一级和二级导航列表数据加入data
                for (let navInfo of rankNavData) {
                    // navInfo.child = navInfo.child.reverse(); // 接口返回的数据顺序是正确的，不需要倒序排列
                    this.rankNavData.push(navInfo);
                }

                // 将接受到的第一个menuId作为默认选中的menuId
                this.curMenuId = this.rankNavData[0].menuId;
                // 将接受到的第一个sub menuId作为默认选中的sub menuId
                this.curSubMenuId = this.rankNavData[0].child[0].menuId;
                // 遍历返回的数据，使其以对象的形式存储(一级属性名为menuId,二级属性名为subMenuId)
                for (let menuInfo of this.rankNavData) {
                    this.rankList[menuInfo.menuId] = {};
                    for (let subMenuId of menuInfo.child) {
                        this.rankList[menuInfo.menuId][subMenuId.menuId] = {};
                    }
                }

                // 第一次导航到本页面进行初始化
                this.initLoadData(this.curMenuId,this.curSubMenuId);
            });
        },
        filters: {
            getFollowIcon(beautyInfo) {
                let followIconObj = {
                    1: require('../assets/image/rank-page/icon_followed.png'),
                    2: require('../assets/image/rank-page/icon_follow.png'),
                    3: require('../assets/image/rank-page/icon_follow_eachother.png')
                };
                return followIconObj[beautyInfo.followsStats];
            }
        },
        methods: {
            jumpToDetailPage(userid) { // 点击跳转到详情页
                this.util.goPage({name:'beautyListItem',query:{userid}});
            },
            initLoadData(menuId,subMenuId,noLoading) {
                let params = {
                    appId: 1,
                    menuId: subMenuId,
                    pageNo: 1,
                    pageSize: 20
                };
                if (noLoading) {
                    params.extraOption = {
                        noLoading: true
                    }
                }
                this.http.get('mapper/rank/list', params).then(res => {
                    // 获取当前的二级导航对象
                    let curSubMenuObj =  this.rankList[menuId][subMenuId];
                    // 保存相关信息
                    curSubMenuObj.data = [];
                    // 如果初始化请求返回的当前页和总的页数相等，则将allLoaded置为true
                    if (res.currentPage === res.totalPage) {
                        this.allLoaded = true;
                    }
                    this.currentPage = 1; // 每次初始化数据将当前页数置为1
                    this.curTopOneInfo = res.dataCollection[0][0];
                    this.curTopTwoInfo = res.dataCollection[1][0];
                    this.curTopThreeInfo = res.dataCollection[2][0];
                    for (let beautyList of res.dataCollection.slice(3)) {
                        curSubMenuObj.data.push(beautyList[0]);
                    }
                    this.curRankListData = curSubMenuObj.data;
                });
            },
            showMsgBox(beautyInfo) {
                if (beautyInfo.followsStats !== 2) {
                    return;
                }
                // 安卓系统中的微信，弹窗提示
                if (this.util.isWechatEnv() && this.util.curDevice() === 'android') {
                    this.util.downLoadApp('tip');
                } else {
                    this.isMsgBoxShow = true;
                }
            },
            changeFirstNav(menuId) {
                // 点击原来的一级导航，不做任何处理
                if (this.curMenuId === menuId) {
                    return;
                }
                // 重置标志allLoaded
                this.allLoaded = false;
                this.curMenuId = menuId;
                this.curSubMenuId = Object.keys(this.rankList[this.curMenuId])[0];
                // 点击原来的二级导航，不做任何处理
                this.initLoadData(this.curMenuId,this.curSubMenuId,true);

            },
            changeSubNav(subMebuId) {
                // 点击原来的二级导航，不做任何处理
                if (this.curSubMenuId === subMebuId) {
                    return;
                }
                // 重置标志allLoaded
                this.allLoaded = false;
                this.curSubMenuId = subMebuId;
                // 第三个参数为无loading的标志
                this.initLoadData(this.curMenuId,this.curSubMenuId,true);
            },
            loadBottom() {
                let curSubMenuId = this.curSubMenuId,
                    curPageNum = this.currentPage + 1; // 每次请求下一页将当前页数加1
                this.http.get('mapper/rank/list', {
                    appId: 1,
                    menuId: curSubMenuId,
                    pageNo: curPageNum,
                    pageSize: 20,
                    extraOption: {
                        noLoading: true
                    }
                }).then(res => {
                    this.currentPage++; // 更新当前页数
                    // 合并数据到当前的数据列表中
                    for(let rankList of res.dataCollection) {
                        this.curRankListData.push(rankList[0]);
                    }
                    this.$refs.loadmore.onBottomLoaded();
                    // 如果初始化请求返回的当前页和总的页数相等，则将allLoaded置为true
                    if (res.currentPage === res.totalPage) {
                        this.allLoaded = true;
                    }
                });


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

    .nav-bar {
        width: 100%;
        position: fixed;
        z-index: 6000;
        background-color: @red4;
        display: flex;
        justify-content: center;
        box-sizing: border-box;
        height: 0.51rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.3);

        li {
            display: flex;
            align-items: center;
            height: 100%;
            box-sizing: border-box;
            padding: 0 0.2rem;
            font-size: 0.16rem;
            color: @white;
        }

        .first-nav-active {
            border-bottom: 0.03rem solid @white;
            font-weight: bold;
        }
    }

    .submenu-top3 {
        width: 100%;
        height: 3.7rem;
        background-image: url("../assets/image/bg-img/bg_top3.png");
        background-size: cover;
        overflow: hidden;

        .sub-nav-bar {
            margin-top: 0.12rem;
            display: flex;
            justify-content: center;

            li {
                padding: 0.04rem 0.14rem;
                border: 1px solid @white;
                border-radius: 0.11rem;
                font-size: 0.14rem;
                font-weight: bold;
                color: @white;
                opacity: 0.5;

                &:first-child {
                    margin-right: 0.06rem;
                }

                &:last-child {
                    margin-left: 0.06rem;
                }
            }

            .sub-nav-active {
                opacity: 1;
            }
        }

        .top-three-part {
            padding: 0.18rem 0 0;
            width: 100%;
            box-sizing: border-box;

            .top-one {
                .top-one-img {
                    margin: 0 auto;
                    width: 1.48rem;
                    height: 1.26rem;
                    background-image: url("../assets/image/rank-page/bg_top1.png");
                    background-size: cover;
                    display: flex;
                    position: relative;
                    justify-content: center;
                    align-items: flex-end;
                    .portrait {
                        object-fit: cover;
                        width: 1rem;
                        height: 1rem;
                        border-radius: 100%;
                        border: 0.05rem solid @white;
                    }
                    .gold-crown-icon {
                        width: 0.42rem;
                        height: 0.42rem;
                        position: absolute;
                        top: 0.03rem;
                        left: 0.1rem;
                    }
                    .follow-status-icon {
                        width: 0.24rem;
                        height: 0.24rem;
                        position: absolute;
                        right: 0.25rem;
                        bottom: 0.02rem;
                    }

                }
                .name-rank {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-top: 0.12rem;
                    .name {
                        font-size: 0.16rem;
                        font-weight: bold;
                        color: @white;
                    }
                    .rank {
                        height: 0.14rem;
                        margin-left: 0.04rem;
                    }
                }
            }
        }

        .top-2-3 {
            display: flex;
            justify-content: center;
            margin-top: 0.22rem;
            .top-2 {
                margin-right: 0.35rem;
            }
            .top-3 {
                margin-left: 0.35rem;
            }
            .top-2,.top-3 {
                .top-img {
                    margin: 0 auto;
                    width: 0.82rem;
                    height: 0.82rem;
                    position: relative;
                    .portrait {
                        object-fit: cover;
                        width: 0.72rem;
                        height: 0.72rem;
                        border-radius: 100%;
                        border: 0.05rem solid @white;
                    }
                    .crown-icon {
                        width: 0.42rem;
                        height: 0.42rem;
                        position: absolute;
                        top: -0.1rem;
                        left: -0.18rem;
                    }
                    .follow-status-icon {
                        width: 0.24rem;
                        height: 0.24rem;
                        position: absolute;
                        right: 0;
                        bottom: 0;
                    }
                }
                .name-rank {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-top: 0.12rem;
                    .name {
                        font-size: 0.16rem;
                        font-weight: bold;
                        color: @white;
                    }
                    .rank {
                        height: 0.14rem;
                        margin-left: 0.04rem;
                    }
                }
            }
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

        .display-list {
            margin-bottom: 0.3rem;
        }

        .list-item {
            width: 100%;
            height: 0.46rem;
            margin-top: 0.25rem;
            box-sizing: border-box;
            padding: 0 0.15rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            .serial-num {
                font-size: 0.14rem;
                font-weight: bold;
                color: #9096A2;
            }
            .beauty-info {
                width: 70%;
                display: flex;
                align-items: center;
                .portrait {
                    object-fit: cover;
                    width: 0.46rem;
                    height: 0.46rem;
                    border-radius: 100%;
                }
                .name {
                    font-size: 0.14rem;
                    font-weight: bold;
                    color: @black1;
                    margin-left: 0.15rem;
                }
                .rank {
                    height: 0.14rem;
                    margin-left: 0.05rem;
                }
            }
            .follow-status {
                width: 0.24rem;
                height: 0.24rem;
            }
        }
    }
</style>
