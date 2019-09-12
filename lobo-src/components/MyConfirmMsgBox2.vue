<template>
    <div v-show="value">
        <div class="msg-box">
            <div class="box-content">
                <div class="box-body">
                    <div v-if="type === 'rewardTip'" class="reward-part">
                        <div class="tip-icon"></div>
                        <p class="title1">恭喜！</p>
                        <p class="title2">获得首次登陆奖励，免费私信条数+10</p>
                    </div>

                    <div v-else-if="type === 'rewardVideoTip'" class="reward-part">
                        <div class="tip-icon"></div>
                        <p class="title1">恭喜！</p>
                        <p class="title2">获得首次登陆奖励，免费视频查看条数+10</p>
                    </div>

                    <div v-else-if="type === 'noMoreVideo'" class="no-video-tip-part">
                        <div class="tip-icon"></div>
                        <p class="title1">抱歉！</p>
                        <p class="title2">您今天的视频秀数量已经用完！</p>
                    </div>

                    <div v-else-if="type === 'noMoreMsg'" class="no-msg-tip-part">
                        <div class="tip-icon"></div>
                        <p class="title1">抱歉！</p>
                        <p class="title2">您的私信数量已经用完！</p>
                    </div>

                    <div class="common-word">
                        <!--<p class="title1">开通VIP可完全免费</p>
                        <p class="title2">还有更多特权等你体验哦！</p>-->

                        <!-- todo:非vip视频用完时暂时提醒用户下载start，以上注释为原来逻辑 -->
                        <p class="title2">下载APP可享有更多特权哦！</p>
                        <!-- todo:非vip视频用完时暂时提醒用户下载end -->
                    </div>
                </div>
                <div class="box-footer">
                    <div class="close-btn" @click="closeMsgBox">知道了</div>
                    <!--<div class="charge-btn" @click="goToCharge">充值变强</div>-->
                    <!-- todo:非vip视频用完时暂时提醒用户下载start，以上注释为原来逻辑  -->
                    <div class="charge-btn" @click="goToCharge">马上下载</div>
                    <!-- todo:非vip视频用完时暂时提醒用户下载end -->
                </div>
            </div>
        </div>
        <div class="my-modal" @click="closeMsgBox"></div>
    </div>
</template>

<script>
    export default {
        name: 'myConfirmMsgBox2',
        props: {
            value: {
                type: Boolean,
                default: false
            },
            type: {
                type: String,
                default: 'rewardTip'
            }

        },
        methods: {
            closeMsgBox() {
                this.$emit('input', false);
            },
            goToCharge() {
                /*let loginInfo = this.util.getStorage('loginInfo');
                this.util.goPage({
                    name: 'buyVip',
                    query: {
                        portrait: loginInfo.portrait,
                        isVip: this.util.getVipInfo().isVip,
                        nickName: loginInfo.nickName
                    }
                });*/

                /* todo:非vip视频用完时暂时提醒用户下载start，以上注释为原来逻辑 */
                this.util.downLoadApp('guide');
                /* todo:非vip视频用完时暂时提醒用户下载end */
            }
        }
    }
</script>

<style lang="less" scoped>
    @import "../assets/less/variable";

    .msg-box {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
        overflow: hidden;
        background-image: url("../assets/image/bg-img/img_msg_box.png");
        background-size: cover;
        z-index: 9999;
        width: 2.9rem;
        border-radius: 0.04rem;

        .box-content {
            width: 100%;
            position: relative;
            .box-body {
                width: 100%;
                padding-top: 0.45rem;
                .reward-part {
                    .tip-icon {
                        width: 1.17rem;
                        height: 1.13rem;
                        background-image: url('../assets/image/bg-img/img_reward.png');
                        background-size: cover;
                        margin: 0 auto;
                    }
                    .title1 {
                        font-size: 0.18rem;
                        font-weight: bold;
                        color: @black1;
                        width: 100%;
                        text-align: center;
                        margin-top: 0.4rem;
                    }
                    .title2 {
                        font-size: 0.14rem;
                        color: @black1;
                        width: 100%;
                        text-align: center;
                        margin-top: 0.13rem;
                    }
                }

                .no-video-tip-part {
                    .tip-icon {
                        width: 1.29rem;
                        height: 1.1rem;
                        background-image: url('../assets/image/bg-img/img_no_more_video.png');
                        background-size: cover;
                        margin: 0 auto;
                    }
                    .title1 {
                        font-size: 0.18rem;
                        font-weight: bold;
                        color: @black1;
                        width: 100%;
                        text-align: center;
                        margin-top: 0.4rem;
                    }
                    .title2 {
                        font-size: 0.14rem;
                        color: @black1;
                        width: 100%;
                        text-align: center;
                        margin-top: 0.13rem;
                    }
                }

                .no-msg-tip-part {
                    .tip-icon {
                        width: 1.06rem;
                        height: 1.18rem;
                        background-image: url('../assets/image/bg-img/img_no_more_msg.png');
                        background-size: cover;
                        margin: 0 auto;
                    }
                    .title1 {
                        font-size: 0.18rem;
                        font-weight: bold;
                        color: @black1;
                        width: 100%;
                        text-align: center;
                        margin-top: 0.4rem;
                    }
                    .title2 {
                        font-size: 0.14rem;
                        color: @black1;
                        width: 100%;
                        text-align: center;
                        margin-top: 0.13rem;
                    }
                }

                .common-word {
                    width: 100%;
                    margin-top: 0.3rem;
                    .title1,.title2 {
                        font-size: 0.14rem;
                        color: #BD9076;
                        text-align: center;
                    }
                    .title2 {
                        margin-top: 0.05rem;
                    }
                }
            }
            .box-footer {
                width: 100%;
                padding: 0.38rem 0.26rem 0;
                box-sizing: border-box;
                display: flex;
                justify-content: space-between;
                margin-bottom: 0.31rem;
                .close-btn,.charge-btn {
                    width: 1.12rem;
                    height: 0.38rem;
                    font-size: 0.16rem;
                    color: @white;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border-radius: 0.19rem;
                }
                .close-btn {
                    background-color: @gray3;
                }
                .charge-btn {
                    background-image: linear-gradient(90deg, #A397FD 0%, #F9517E 98%);
                }
            }

        }
    }

    .my-modal {
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        opacity: 0.5;
        z-index: 9998;
        background-color: black;
    }
</style>
