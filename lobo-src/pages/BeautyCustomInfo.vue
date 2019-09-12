<template>
    <div class="content-wrap">
        <div class="user-info">
            <div class="portrait-wrap">
                <img :src="util.getStorage('loginInfo').portrait" class="portrait">
            </div>
            <div class="name-rank">
                <span class="name">{{userInfo.nickName}}</span>
                <img :src="userInfo.gradeIcon" class="rank">
            </div>
            <p class="user-id">ID:{{userInfo.showId}}</p>
            <div class="like-fans">
                <span class="follow">{{userInfo.followNum}}</span>
                <span>关注</span>
                <span class="separate-line"></span>
                <span class="fans">{{userInfo.fansNum}}</span>
                <span>粉丝</span>
            </div>
        </div>

        <div class="user-module">
            <MyCell v-model="diamondItemInfo"></MyCell>

            <!--todo: 因后台接口问题，暂时隐藏掉充值vip功能-->
<!--            <MyCell v-model="vipInfo"></MyCell>-->

            <!--            <MyCell v-model="toBeEmcee"></MyCell>-->
            <MyCell v-model="getBindPhoneNumInfo"></MyCell>
            <MyCell v-model="validCode"></MyCell>
            <MyCell v-model="shareToGetMoney"></MyCell>
        </div>

        <DownloadAppBtn/>

        <!-- 下载提示弹窗 -->
        <MyConfirmMsgBox v-model="isMsgBoxShow"></MyConfirmMsgBox>
    </div>
</template>

<script>
    export default {
        name: 'customInfo',
        components: {
            DownloadAppBtn: require('../components/DownloadAppBtn.vue').default,
            MyCell: require('../components/MyCell.vue').default,
            MyConfirmMsgBox: require('../components/MyConfirmMsgBox.vue').default,
        },
        data() {
            return {
                userInfo: '',
                isMsgBoxShow: false,
                isVip: 0,
                diamondItemInfo: {
                    bgcolor: '#FFDDE6',
                    color: '#F9517E',
                    title: '钻石',
                    content: '',
                    iconUrl: require('../assets/image/personal-center/icon_diamond.png'),
                    cb: function () {
                    }
                },
                vipInfo: {
                    bgcolor: '#F8E8E2',
                    color: '#9E4B2A',
                    title: 'VIP特权',
                    content: '',
                    iconUrl: require('../assets/image/personal-center/icon_vip.png'),
                    cb: function () {
                    }
                },
                // toBeEmcee: {
                //     title: '成为主播',
                //     iconUrl: require('../assets/image/personal-center/icon_cwzb.png'),
                //     cb: function() {}
                // },
                validCode: {
                    title: '输入邀请码',
                    iconUrl: require('../assets/image/personal-center/icon_Invitation code.png'),
                    cb: function () {
                    }
                },
                shareToGetMoney: {
                    title: '分享赚钱',
                    iconUrl: require('../assets/image/personal-center/icon_fxzq.png'),
                    cb: function () {
                    }
                }
            }
        },
        mounted() {
            // 获取用户信息
            this.http.get('user/userCenter/getUserInfo.do', {
                key: 'asqwfqwq'
            }).then(res => {
                console.log(res)
                let _this = this;
                this.userInfo = res.dataCollection;
                let diamond_monney = this.userInfo.money;
                this.diamondItemInfo.content = `${diamond_monney ? diamond_monney : 0}钻石`;

                this.diamondItemInfo.cb = function () {
                    _this.util.goPage({name: 'buyDiamond', params: {balance: diamond_monney}});
                };

                // this.toBeEmcee.cb = function() {
                //     _this.isMsgBoxShow = true;
                // };

                this.validCode.cb = function () {
                    // 安卓系统中的微信，弹窗提示
                    if (_this.util.isWechatEnv() && _this.util.curDevice() === 'android') {
                        _this.util.downLoadApp('tip');
                    } else {
                        _this.isMsgBoxShow = true;
                    }
                };

                this.shareToGetMoney.cb = function () {
                    // 安卓系统中的微信，弹窗提示
                    if (_this.util.isWechatEnv() && _this.util.curDevice() === 'android') {
                        _this.util.downLoadApp('tip');
                    } else {
                        _this.isMsgBoxShow = true;
                    }
                };

                this.http.post('user/userCenter/getVipChannelBuyInfoVo', {
                    userId: this.util.getStorage('loginInfo').userId,
                    channel: this.util.getStorage('cpsChain') ? this.util.getStorage('cpsChain')[1] : 2201,
                    extraOption: {
                        noLoading: true
                    }
                }).then(res => {
                    this.isVip = res.dataCollection.isVip;
                    this.vipInfo.content = this.isVip ? 'VIP大佬' : '开通VIP';
                });

                let loginInfo = _this.util.getStorage('loginInfo');
                this.vipInfo.cb = function () {
                    _this.util.goPage({
                        name: 'buyVip',
                        query: {
                            portrait: loginInfo.portrait,
                            isVip: _this.isVip,
                            nickName: loginInfo.nickName
                        }
                    });
                };
            });
        },
        computed: {

            getBindPhoneNumInfo() {
                let _this = this,
                    isBind = _this.$store.state.isBind;
                return {
                    title: '绑定手机号',
                    content: isBind === 1 ? '已绑定' : '未绑定',
                    contentColor: isBind === 1 ? '' : '#9C9C9C',
                    iconUrl: require('../assets/image/personal-center/icon_phone_bind.png'),
                    cb: function () {
                        // 未绑定，弹窗提醒用户绑定
                        if (isBind !== 1) {
                            _this.$store.commit('setBindBoxTag', {
                                type: 'bindPhoneBox',
                                isBindPhoneBoxShow: true,
                            });
                        }
                    }
                }
            }
        }
    }
</script>

<style lang="less" scoped>

    @import "../assets/less/variable";

    .content-wrap {
        width: 100%;
        height: 100%;
        overflow: scroll;
        // 解决上拉滑动卡顿的问题
        -webkit-overflow-scrolling: touch;
        box-sizing: border-box;
        padding: 0 0.2rem 1rem;
    }

    .user-info {
        padding: 0.4rem 0;

        .portrait-wrap {
            width: 100%;
            text-align: center;

            .portrait {
                width: 1rem;
                height: 1rem;
                border-radius: 100%;
                display: inline-block;
            }
        }

        .name-rank {
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 0.12rem;

            .name {
                font-size: 0.18rem;
                font-weight: bold;
                color: @black3;
            }

            .rank {
                height: 0.12rem;
                margin-left: 0.05rem;
            }
        }

        .user-id {
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            color: @gray6;
            font-size: 0.12rem;
            margin-top: 0.05rem;
        }

        .like-fans {
            width: 100%;
            font-size: 0.16rem;
            color: @black3;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 0.15rem;

            .follow, .fans {
                font-weight: bold;
                margin-right: 0.03rem;
            }

            .separate-line {
                width: 0.02rem;
                height: 0.08rem;
                opacity: 0.2;
                background: @black3;
                border-radius: 1px;
                margin: 0 0.13rem;
            }
        }

    }

    .user-module {
        width: 100%;
    }
</style>
