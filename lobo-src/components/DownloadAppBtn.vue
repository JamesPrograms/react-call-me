<template>
    <div class="wrap" @click="downloadApp">
        <img src="../assets/image/icon/icon_download_app@3x.png" alt="下载APP">
    </div>
</template>

<script>
    export default {
        name: 'downloadAppBtn',
        data() {
            return {
                isDownloadTipShow: false
            }
        },
        methods: {
            downloadApp() {
                this.util.downLoadApp('guide');
            }
        }
    }
</script>

<style lang="less" scoped>
    .wrap {
        z-index: 3001;
        width: 0.93rem;
        height: 0.3rem;
        position: fixed;
        right: 0.15rem;
        bottom: 0.65rem;
        img {
            width: 100%;
            height: 100%;
        }

        .downloadTip {
            position: fixed;
            width: 100vw;
            height: 100vh;
        }
    }
</style>
