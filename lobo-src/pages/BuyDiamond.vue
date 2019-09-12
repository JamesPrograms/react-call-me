<template>
    <div class="wrapper">
        <div class="balance">
            <span>余额:</span>
            <img src="../assets/image/personal-center/icon_Diamonds.png">
            <span class="my-balance">{{balance}}</span>
        </div>

        <div class="diamond-content">
            <div class="diamond-item"
                 v-for="(item,index) in diamondChargeList"
                 :class="{'selected-item': curIndex === index}"
                 @click="setCurIndex(index)">
                <div class="diamond-icon-wrap">
                    <img src="../assets/image/personal-center/icon_buy_diamond.png">
                </div>
                <p class="diamond-mount">
                    {{item.rechargeMoney}}
                </p>
                <p class="diamond-money">
                    &#65509;{{item.status}}
                </p>
                <img src="../assets/image/personal-center/icon_recharging_selected.png" class="selected-icon" v-show="curIndex === index">
            </div>
        </div>

        <div class="wechat-charge-btn">
            <img src="../assets/image/personal-center/img_weixin_pay.png" v-if="util.isWechatEnv()" @click="chargeWithWechat">
            <img src="../assets/image/personal-center/img_zfb_pay.png" v-else @click="chargeWithAlipay">
        </div>
        <!--<div class="charge-btn" v-else>
            <img src="../assets/image/personal-center/img_wechat_pay.png" @click="chargeWithWechat">
            <img src="../assets/image/personal-center/img_alipay.png" @click="chargeWithAlipay">
        </div>-->

        <div class="zfbform" v-html="zfbhtml"></div>
    </div>
</template>

<script>
    import md5 from 'js-md5';

    export default {
        name: 'buyDiamond',
        data() {
            return {
                curIndex: null,
                diamondChargeList: [],

                zfbhtml: '',
                userId: this.util.getStorage('loginInfo').userId
            }
        },
        computed: {
            chargeMoney() {
                return this.diamondChargeList[this.curIndex]['rechargeMoney'];
            },
            balance() {
                return this.$store.state.balance;
            }
        },

        mounted() {
            let _this = this;

            this.http.post  ('basic/recharge/findMoneyList.do', {
                key: '53fd1852cea27478bd09d9483f864729',
                type: 1, // 1微信或者支付宝，2苹果支付
            }).then(res => {
                this.diamondChargeList = res.dataCollection;
            });

            this.http.get('user/userCenter/getUserMoney.do', {
                key: '3ed0db41584e118b1da414ead871a782',
                extraOption: {
                    noLoading: true
                }
            }).then(res => {
                // 设置钻石余额
                let balance = res.dataCollection;
                _this.$store.commit('setBalance',balance);
            });
        },
        methods:  {
            setCurIndex(index) {
                this.curIndex = index;
            },
            isSelectedDiamond() {
                if (this.curIndex > 0 || this.curIndex === 0) {
                    return true;
                } else {
                    this.util.toast('请先选择充值钻石');
                    return false;
                }
            },
            chargeWithWechat() {
                // 先验证是否选择了钻石
                if (!this.isSelectedDiamond()) {
                    return;
                }

                // 调用支付方法进行支付
                this.util.wechatCharge(this.chargeMoney,2); // param1: 价格, param2: 类型(1.视频内充值 2.视频外充值 3.购买特殊身份,4 vip 支付)
            },
            chargeWithAlipay()  {
                // 先验证是否选择了钻石
                if (!this.isSelectedDiamond()) {
                    return;
                }

                // 如果是在微信中，则让用户在浏览器打开页面再用支付宝支付
                if (this.util.isWechatEnv()) {
                    this.$store.commit('setAlipayStateFlag', true);
                    return;
                }

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
                    _this.zfbhtml= res;//这里返回的是一个form表单的html
                    setTimeout(()=>{
                        document.forms[0].submit();
                    },10)
                }).catch(err => {
                    _this.$toast({
                        message: '支付宝支付失败！',
                        duration: 1500
                    });
                });
            }
        }
    }
</script>

<style lang="less" scoped>
    @import "../assets/less/variable";

    .wrapper {
        background: @gray1!important;
        height: 100vh!important;
        overflow: scroll;
    }

    .balance {
        background-color: @white;
        width: 100%;
        height: 0.8rem;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 0.14rem;
        font-weight: bold;
        color: @gray5;
        img {
            width: 0.19rem;
            height: 0.16rem;
            margin: 0 0.05rem;
        }
        .my-balance {
            font-size: 0.16rem;
            color: @black1;
        }
    }

    .diamond-content {
        width: 100%;
        box-sizing: border-box;
        padding: 0.1rem  0.06rem 0;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        .diamond-item {
            width: 1.18rem;
            height: 1.4rem;
            padding-top: 0.34rem;
            margin-bottom: 0.04rem;
            box-sizing: border-box;
            border-radius: 0.04rem;
            background-color: @white;
            .diamond-icon-wrap {
                width: 100%;
                box-sizing: border-box;
                text-align: center;
                border-radius: 0.04rem;
                img {
                    width: 0.5rem;
                    height: 0.34rem;
                    display: inline-block;
                }
            }
            .diamond-mount {
                font-size: 0.2rem;
                padding-left: 0.13rem;
                margin-top: 0.29rem;
                color: #F9517E;
                font-weight: bold;
            }
            .diamond-money {
                font-size: 0.14rem;
                color: @black1;
                margin-top: 0.01rem;
                font-weight: bold;
                padding-left: 0.13rem;
            }
        }
        .selected-item {
            border: 1px solid @green;
            position: relative;
            .selected-icon {
                position: absolute;
                width: 0.22rem;
                height: 0.22rem;
                right: 0;
                bottom: 0;
                /*border-bottom-right-radius: 0.04rem;*/
            }
        }
        &:after {
            content: '';
            width: 1.18rem;
        }
    }

    .charge-btn {
        width: 100%;
        box-sizing: border-box;
        padding: 0 0.2rem;
        height: 0.8rem;
        background-color: @white;
        position: fixed;
        left: 0;
        bottom: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        img {
            width: 1.58rem;
            height: 0.38rem;
        }
    }

    .zfbform{
        width: 1px; height: 1px; overflow: hidden;opacity: 0;
    }

</style>
