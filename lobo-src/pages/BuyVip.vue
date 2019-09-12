<template>
    <div class="wrapper">
        <div class="vip-info">
            <div class="user-info">
                <div class="portrait-name">
                    <img :src="userInfo.portrait" class="portrait">
                    <span class="name">{{ userInfo.nickName }}</span>
                </div>
                <div class="vip-status">
                    <img src="../assets/image/personal-center/icon_vip_status.png" class="vip-icon">
                    <span class="status-info">{{userInfo.isVip == 1 ? 'VIP大佬' : '开通VIP特权'}}</span>
                </div>
            </div>

            <div class="vip-list">
                <p class="title">选择购买VIP时长</p>
                <div class="vip-item"
                     v-for="(item,index) in vipList"
                     @click="selectedVipStyle(index)"
                >
                    <div class="icon-vipDesc">
                        <img src="../assets/image/personal-center/icon_vip_2.png" class="vip-icon">
                        <span class="vip-desc"
                              :class="{'selected-vip-desc': curIndex === index}"
                        >{{ item.type|getVipDesc}}</span>
                    </div>
                    <span class="price"
                          :class="{'selected-price': curIndex === index}"
                    >{{(item.vipPrice/100).toFixed()}}元</span>
                    <div class="average-daily">
                        <span class="average-daily" v-if="item.type !== 4">
                            <span class="average-price">{{(item.vipPrice/item.duration/100).toFixed(2)}}</span>
                            <span>/天</span>
                        </span>
                    </div>
                    <img src="../assets/image/personal-center/selected_vip_frame.png" class="selected-cover"
                         v-show="curIndex === index">
                </div>
            </div>
        </div>

        <div class="vip-rights">
            <p class="title">会员特权</p>
            <div class="right-desc-list">
                <div class="right-desc-wrap">
                    <img src="../assets/image/personal-center/right_icon_vip.png" class="right-icon">
                    <p class="right-title">尊贵的超级会员标识</p>
                    <p class="right-desc">瞬间提升曝光率让女生离你更近一步</p>
                </div>

                <div class="right-desc-wrap">
                    <img src="../assets/image/personal-center/right_icon_msg.png" class="right-icon">
                    <p class="right-title">私信文字聊天全免费</p>
                    <p class="right-desc">与所有女神的私信聊天全部免费</p>
                </div>

                <div class="right-desc-wrap">
                    <img src="../assets/image/personal-center/right_icon_video.png" class="right-icon">
                    <p class="right-title">无限畅看私密视频</p>
                    <p class="right-desc">可免费畅看所有心仪女神的私密视频秀</p>
                </div>
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
    import md5 from 'js-md5'; // 引入md5加密

    export default {
        name: 'buyVip',
        data() {
            return {
                userInfo: this.$route.query,
                curIndex: null,
                vipList: [],

                zfbhtml: '',
                userId: this.util.getStorage('loginInfo').userId,
            }
        },

        computed: {
            chargeMoney() {
                let curVipItem = this.vipList[this.curIndex];
                return curVipItem.vipPrice.toFixed();
            },

            configId() {
                return this.vipList[this.curIndex]['id'];
            }
        },

        mounted() {
            this.http.get('user/userCenter/getBaseVipConfig', {}).then(res => {
                this.vipList = res.dataCollection;
                console.log(res.dataCollection)
            });
        },
        methods: {
            isSelectedDiamond() {
                if (this.curIndex > 0 || this.curIndex === 0) {
                    return true;
                } else {
                    this.util.toast('请先选择再进行支付');
                    return false;
                }
            },
            chargeWithWechat() {
                // 先验证是否选择了vip
                if (!this.isSelectedDiamond()) {
                    return;
                }

                // 调用支付方法进行支付
                this.util.wechatCharge(this.chargeMoney,4, this.configId); // param1: 价格, param2: 类型(1.视频内充值 2.视频外充值 3.购买特殊身份,4 vip 支付),configId: vip类型
            },
            chargeWithAlipay()  {
                // 先验证是否选择了vip
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
                    type: 4, // 1.视频内充值 2.视频外充值 3.购买特殊身份,4 vip 支付
                    money: _this.chargeMoney,
                    os: 1,
                    version: '1.0.0',
                    packageName: 'guoliao.H5',
                    configId: _this.configId,
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
            },
            selectedVipStyle(index) {
                this.curIndex = index;
            }
        },
        filters: {
            getVipDesc(type) { // 根据当前状态过滤出当前vip描述文字
                let curWorObj = {1: '超级VIP月卡', 2: '超级VIP季卡', 3: '超级VIP年卡', 4: '终身VIP'};
                return curWorObj[type];
            }
        },
    }
</script>

<style lang="less" scoped>
    @import "../assets/less/variable";

    .vip-info {
        background-image: linear-gradient(0deg, #A397FD 0%, #F9517E 100%);
        padding: 0.2rem 0.12rem;
    }

    .user-info {
        width: 100%;
        height: 0.74rem;
        box-sizing: border-box;
        background-color: @white;
        border-radius: 0.04rem;
        padding: 0 0.2rem 0 0.12rem;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .portrait-name {
            display: flex;
            align-items: center;

            .portrait {
                width: 0.5rem;
                height: 0.5rem;
                border-radius: 100%;
            }

            .name {
                font-weight: bold;
                font-size: 0.16rem;
                color: @black1;
                margin-left: 0.1rem;
            }
        }

        .vip-status {
            display: flex;
            align-items: center;

            .vip-icon {
                width: 0.28rem;
                height: 0.36rem;
            }

            .status-info {
                font-size: 0.12rem;
                color: @white;
                padding: 0.03rem 0.06rem;
                background-image: linear-gradient(-270deg, #E1E1E1 0%, #D3D3D3 100%);
                border-radius: 0.1rem;
                margin-left: 0.06rem;
            }
        }
    }

    .vip-list {
        .title {
            padding: 0.2rem 0 0.08rem 0;
            text-align: center;
            font-size: 0.12rem;
            color: @white;
        }

        .vip-item {
            width: 100%;
            height: 0.6rem;
            background-color: @white;
            border-radius: 0.04rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-sizing: border-box;
            padding: 0 0.14rem 0 0.18rem;
            position: relative;
            margin-bottom: 0.05rem;

            &:last-child {
                margin-bottom: 0;
            }

            .icon-vipDesc {
                display: flex;
                align-items: center;

                .vip-icon {
                    width: 0.2rem;
                    height: 0.25rem;
                }

                .vip-desc {
                    font-size: 0.14rem;
                    color: #9E4B2A;
                    font-weight: bold;
                    margin-left: 0.11rem;
                }

                .selected-vip-desc {
                    color: @red4;
                }
            }

            .price {
                font-size: 0.14rem;
                font-weight: bold;
                color: @gray5;
                margin-right: 0.54rem;
                position: absolute;
                left: 1.93rem;
            }

            .selected-price {
                color: @black1;
            }

            .average-daily {
                display: flex;
                align-items: center;

                .average-daily {
                    font-size: 0.14rem;
                    font-weight: bold;
                    color: @black1;

                    .average-price {
                        color: @red4;
                    }
                }
            }

            .selected-cover {
                width: 100%;
                height: 100%;
                position: absolute;
                top: 0;
                left: 0;
            }
        }
    }

    .vip-rights {
        width: 100%;
        box-sizing: border-box;
        padding: 0.25rem 0.46rem 1rem;
        background-image: linear-gradient(-180deg, #FFFFFF 7%, #FFE5E9 100%);

        .title {
            font-size: 0.14rem;
            font-weight: bold;
            text-align: center;
            color: @black1;
            background: url("../assets/image/personal-center/img_frame_line.png") no-repeat center;
            background-size: 1.21rem 0.05rem;
        }

        .right-desc-list {
            width: 100%;
            display: flex;
            margin-top: 0.25rem;
            justify-content: space-between;
            .right-desc-wrap {
                width: 0.74rem;
                .right-icon {
                    display: block;
                    width: 0.29rem;
                    height: 0.29rem;
                }
                .right-title {
                    width: 100%;
                    font-size: 0.12rem;
                    font-weight: bold;
                    line-height: 0.14rem;
                    color: @black1;
                    margin-top: 0.09rem;
                }
                .right-desc {
                    font-size: 0.11rem;
                    color: @brown2;
                    line-height: 0.15rem;
                    margin-top: 0.08rem;
                }
            }
        }
    }

    .charge-btn {
        width: 100%;
        box-sizing: border-box;
        padding: 0 0.2rem;
        height: 0.8rem;
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
