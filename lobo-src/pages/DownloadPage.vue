<template>
    <div class="wrap">
        <div v-show="downLoadTipInfo.isShow" class="download-tip-wrap" @click="closeDownloadTip">
            <img v-show="downLoadTipInfo.type === 'tip'" src="../assets/image/bg-img/img_download_tip.png" class="download-tip">
            <img v-show="downLoadTipInfo.type === 'guide'" src="../assets/image/bg-img/img_download_guide.png" class="download-tip">
            <div class="my-modal"></div>
        </div>

        <img src="../assets/image/bg-img/bg_download_btn.png" class="download-btn" @click="downloadApp">
    </div>
</template>

<script>
    export default {
        name: 'downloadAppPage',
        data() {
            return {
                type: null,
            }
        },
        mounted() {
            if (this.util.isWechatEnv()) {
                // 获取上一个路由传过来的type
                this.type = this.$route.query.type;
                // 显示引导下载的浮窗
                this.$store.commit('setDownloadAppFlag', {
                    type: this.type,
                    isShow: true
                });
            }
        },
        computed: {
            downLoadTipInfo() {
                return this.$store.state.downLoadTipInfo;
            }
        },
        methods: {
            downloadApp() {
                if (this.util.isWechatEnv()) {
                    this.$store.commit('setDownloadAppFlag', {
                        type: this.type,
                        isShow: true
                    });
                    return;
                }

                let cpsChain = this.util.getParamByName('cpsChain');
                if (cpsChain) {
                    this.util.downLoadApp(this.type,cpsChain.split('_'));
                } else {
                    this.util.downLoadApp(this.type);
                }
            },
            closeDownloadTip() {
                this.$store.commit('setDownloadAppFlag', 'close');
            }
        }
    }
</script>

<style lang="less" scoped>
    .wrap {
        width: 100%;
        height: 100vh;
        background-image: url("../assets/image/bg-img/bg_download_page.png");
        background-size: cover;
        position: relative;
    }

    .download-tip-wrap {
        width: 100%;
        height: 100vh;

        .download-tip {
            position: fixed;
            top: 0;
            left: 50%;
            width: 90%;
            z-index: 9999;
            transform: translateX(-50%);
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
    }

    .download-btn {
        width: 2.4rem;
        height: 0.4rem;
        display: inline-block;
        margin: 0 auto;
        position: absolute;
        left: 50%;
        top: 5.3rem;
        transform: translateX(-50%);
    }
</style>
