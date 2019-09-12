<template>
    <div class="charge-content" @click.self="closeChargeBox">
        <div class="charge-wrap">
            <div class="charge-list">
                <div class="charge-item"
                     v-for="(item,index) in chargeList"
                     @click="setActiveIndex(index)"
                     :class="{'charge-item-active': index === activeIndex && (activeIndex > 0 || activeIndex === 0)}"
                >
                    <img src="../assets/image/video-chat/icon_diamond2.png" class="diamond">
                    <span class="diamond-money">
                    <span class="diamond-mount">{{item.rechargeMoney}}</span>
                <span class="money">￥{{item.status}}</span>
            </span>
                </div>
            </div>
            <div class="balance-send">
                <div class="balance-part">
                    <span>余额:</span>
                    <img src="../assets/image/video-chat/icon_diamond.png" class="diamond">
                    <span class="balance">{{$store.state.balance}}</span>
                </div>
                <span class="send"
                      :class="{'charge-active': activeIndex > 0 || activeIndex === 0}"
                      @click="chargeDiamond"
                >充值</span>
            </div>

            <div class="zfbform" v-html="zfbhtml"></div>
        </div>
    </div>
</template>

<script>
    import md5 from 'js-md5';

    export default {
        name: 'chargeMoneyBox',
        data() {
            return {
                chargeList: [],
                activeIndex: null,
                zfbhtml: '',
            }
        },
        props: ['value'],
        computed: {
            chargeMoney() {
                return this.chargeList[this.activeIndex]['rechargeMoney'];
            },
        },
        mounted() {
            this.http.post('basic/recharge/findMoneyList.do', {
                key: '53fd1852cea27478bd09d9483f864729',
                type: 1, // 1微信或者支付宝，2苹果支付
                extraOption: {
                    noLoading: true
                }
            }).then(res => {
                this.chargeList = res.dataCollection;
            });
        },
        methods: {
            chargeDiamond() {
                if (this.util.isWechatEnv()) {
                    // 调用微信方法进行支付
                    this.util.wechatCharge(this.chargeMoney, 1); // param1: 价格, param2: 类型(1.视频内充值 2.视频外充值 3.购买特殊身份,4 vip 支付)
                } else {
                    // 使用支付宝支付
                    let _this = this;
                    this.http.get('finance/h5sign/getAlipaySign.do', {
                        key: md5(`huoaquaweixinachongz${_this.chargeMoney}`),
                        channel: this.util.getStorage('cpsChain') ? this.util.getStorage('cpsChain')[1] : 2201,
                        type: 2, // 1.视频内充值 2.视频外充值 3.购买特殊身份,4 vip 支付
                        money: _this.chargeMoney,
                        os: 1,
                        version: '1.0.0',
                        packageName: 'guoliao.H5',
                        userIdH5: this.userId

                    }).then(res => {
                        _this.zfbhtml = res;//这里返回的是一个form表单的html
                        setTimeout(() => {
                            document.forms[0].submit();
                        }, 10)
                    }).catch(err => {
                        _this.$toast({
                            message: '支付宝支付失败！',
                            duration: 1500
                        });
                    });
                }
            },
            setActiveIndex(index) {
                this.activeIndex = index;
            },
            closeChargeBox() {
                this.$emit('input',false);
            }
        }
    }
</script>

<style lang="less" scoped>
    @import "../assets/less/variable";

    .charge-content {
        position: fixed;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 100vh;
        z-index: 2;
    }

    .charge-wrap {
        position: absolute;
        background: @black1;
        box-sizing: border-box;
        padding: 0.2rem 0.15rem 0.09rem;
        width: 100%;
        left: 0;
        bottom: 0;
        z-index: 1;
    }

    .charge-list {
        width: 100%;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        overflow: hidden;
    }

    .charge-item {
        width: 1.7rem;
        height: 1rem;
        box-sizing: border-box;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 0.08rem;
        display: flex;
        align-items: center;
        margin-top: 0.05rem;

        .diamond {
            width: 0.5rem;
            height: 0.34rem;
            margin-left: 0.2rem;
        }

        .diamond-money {
            display: flex;
            flex-direction: column;
            margin-left: 0.1rem;
            overflow: hidden;

            .diamond-mount {
                font-size: 0.18rem;
                color: @white;
            }

            .money {
                font-size: 0.14rem;
                color: #C9C9C9;
                margin-top: 0.03rem;
            }

        }
    }

    .charge-item-active {
        border: 0.02rem solid #FF3E36;
    }

    .balance-send {
        width: 100%;
        box-sizing: border-box;
        padding: 0 0.15rem;
        display: flex;
        justify-content: space-between;
        margin-top: 0.23rem;

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

        .charge-active {
            border: 0;
            background: #F9517E;
            border-radius: 0.15rem;
            color: @white;
        }
    }
</style>
