<template>
    <div class="container" @click.self="closeRewardBox">
        <div class="reward-wrap"
             :class="{'reward-show': isSendGift}"
             ref="giftBox">
            <div class="swiper-container">
                <div class="swiper-wrapper">
                    <div class="gift-item swiper-slide"
                         :class="{'gift-item-active': index === activeIndex && (activeIndex > 0 || activeIndex === 0)}"
                         v-for="(gift,index) in giftList"
                         @click="setActiveIndex(index)">
                        <img :src="gift.smallPictureUrl" class="gift-pic">
                        <span class="diamond">{{gift.money}}</span>
                    </div>
                </div>
                <div class="swiper-pagination"></div>
            </div>
            <div class="svga-container" v-show="isSendGift" id="svgaContainer">
            </div>
            <div class="balance-send" v-show="isRewardBottomShow">
                <div class="balance-part">
                    <span>余额:</span>
                    <img src="../assets/image/video-chat/icon_diamond.png" class="diamond">
                    <span class="balance">{{$store.state.balance}}</span>
                    <img src="../assets/image/video-chat/icon_add_diamond.png" class="add" @click="chargeDiamondBox">
                </div>
                <span class="send" :class="{'send-active': activeIndex > 0 || activeIndex === 0}"
                      @click="sendGift">赠送</span>
            </div>

            <ChargeMoneyBox v-show="isChargeBoxShow" v-model="isChargeBoxShow"></ChargeMoneyBox>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'rewardLobo',
        components: {
            ChargeMoneyBox: require('../components/ChargeMoneyBox.vue').default
        },
        data() {
            return {
                giftList: [],
                activeIndex: null,
                isChargeBoxShow: false,
                isSendGift: false,
                isRewardBottomShow: true,
            }
        },
        computed: {
          getQueryParams() {
            return this.$route.query;
          },
        },
        props: ['value'],
        mounted() {
            let _this = this;
            _this.http.post('gratuity/gratuity/findAllGratuity', {
                extraOption: {
                    noLoading: true
                }
            }).then(res => {
                _this.giftList = res.dataCollection;
                _this.$nextTick(() => {
                    new Swiper('.swiper-container', {
                        slidesPerView: 4,
                        slidesPerColumn: 2,
                        spaceBetween: 3,
                        pagination: {
                            el: '.swiper-pagination',
                            clickable: true,
                        },
                    });
                });
            });
        },
        methods: {
            setActiveIndex(index) {
                this.activeIndex = index;
            },
            showGift(activeIndex) {
                let _this = this;
                this.isSendGift = true;
                let avgaSrc = this.giftList[activeIndex]['svgFileUrl'];
                var player = new SVGA.Player('#svgaContainer');
                var parser = new SVGA.Parser('#svgaContainer');

                // 隐藏底部部分
                this.isRewardBottomShow = false;

                player.setContentMode('AspectFill');
                parser.load(avgaSrc, function (videoItem) {
                    player.loops = 1;
                    player.setVideoItem(videoItem);
                    player.startAnimation();
                    player.setContentMode("AspectFit");
                });
                player.onFinished(() => {
                    // 隐藏svga动效播放的容器
                    _this.isSendGift = false;
                    // 隐藏礼物列表
                    _this.$emit('input',false);
                })
            },
            sendGift() {
                // 选中礼物才做相应发送操作
                let _this = this,
                    activeIndex = this.activeIndex,
                    loginInfo = this.util.getStorage('loginInfo'),
                    curActiveGiftInfo = this.giftList[activeIndex];

                if (activeIndex !== 0 && window.mySocket) {
                    window.mySocket.emit('gratuity300', JSON.stringify({
                        fromUserId: loginInfo.userId,
                        toUserId: _this.getQueryParams.userId,
                        type: 1, // 1: 视频内打赏
                        gratuityConfigId: curActiveGiftInfo.id,
                        money: curActiveGiftInfo.money,
                        key: 'ds',
                        session: loginInfo.session
                    }), res => {
                        if (res.resultCode === 13004) {
                            // 提醒
                            _this.util.toast('您的余额不足');
                        }
                        if (res.resultCode === 13005) {
                            // 提醒
                            _this.util.toast('您的余额不足');
                        }
                        if (res.resultCode === 23001) {
                            // 提醒
                            _this.util.toast('只有拥有VIP才能打赏该礼物');
                        }
                        if (res.resultCode === 1300) {
                            // 展示礼物送出动效
                            _this.showGift(activeIndex);
                            // 更新余额
                            _this.$store.commit('setBalance',res.dataCollection.buyerMoney);
                        }
                    });
                }
            },
            chargeDiamondBox() {
                this.isChargeBoxShow = true;
            },
            closeRewardBox() {
                this.$emit('input',false);
            }
        }
    }
</script>

<style lang="less" scoped>
    @import "../assets/less/variable";
    .container {
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
    }

    .reward-wrap {
        width: 100%;
        position: absolute;
        left: 0;
        bottom: 0;
        background: #353C46;
        box-sizing: border-box;
        padding: 0.05rem 0.03rem 0.09rem;
    }

    .reward-show {
        background: rgba(0, 0, 0, 0);
    }

    .gift-item {
        width: 0.9rem;
        height: 0.9rem;
        background-color: rgba(255, 255, 255, .1);
        border-radius: 0.08rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        box-sizing: border-box;
        overflow: hidden;

        .gift-pic {
            margin-top: 0.05rem;
            width: 0.6rem;
            height: 0.6rem;
        }

        .diamond {
            font-size: 0.12rem;
            color: #C9C9C9;
        }
    }

    .gift-item-active {
        border: 0.02rem solid #F9517E;
    }

    .balance-send {
        width: 100%;
        box-sizing: border-box;
        padding: 0 0.15rem;
        display: flex;
        justify-content: space-between;

        .balance-part {
            display: flex;
            align-items: center;
            font-size: 0.12rem;
            color: #C9C9C9;

            .diamond {
                width: 0.2rem;
                height: 0.17rem;
                margin: 0 0.03rem;
            }

            .add {
                width: 0.24rem;
                height: 0.24rem;
                margin-left: 0.06rem;
            }
        }

        .send {
            border: 1px solid #8B8B8B;
            border-radius: 0.15rem;
            font-size: 0.14rem;
            color: #8B8B8B;
            box-sizing: border-box;
            line-height: 0.3rem;
            padding: 0 0.2rem;
        }

        .send-active {
            border: 0;
            background: #F9517E;
            border-radius: 0.15rem;
            color: @white;
        }
    }

    .svga-container {
       width: 100%;
        height: 100vh;
        overflow: hidden;
    }
</style>
