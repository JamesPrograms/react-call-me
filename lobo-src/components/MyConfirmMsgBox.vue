<!-- 该组件不再需要 -->
<template>
    <div class="wrap" v-show="value">
        <div class="msg-box">
            <div class="box-content">
                <img src="../assets/image/icon/button/icon_Close2@3x.png" class="close-box" @click="closeMsgBox">
                <div class="box-body">
                    某些功能为APP客户端用户专享，快去下载APP体验更好的服务吧！
                </div>
                <div class="box-footer">
                    <div @click="downloadApp">
                        <span>立即下载</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="my-modal" @click="closeMsgBox"></div>
    </div>
</template>

<script>
    export default {
        name: 'myConfirmMsgBox',
        props: {
            value: {
                type: Boolean,
                default: false
            }
        },
        methods: {
            closeMsgBox() {
                this.$emit('input', false);
            },
            downloadApp() {
                this.util.downLoadApp('tip');
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
        background-color: @white;
        z-index: 9999;
        width: 2.9rem;
        border-radius: 0.04rem;
        font-size: 0.14rem;

        .box-content {
            width: 100%;
            position: relative;
            .close-box {
                width: 0.2rem;
                height: 0.2rem;
                display: block;
                position: absolute;
                top: 0.14rem;
                right: 0.14rem;
            }
            .box-body {
                width: 100%;
                padding: 0.62rem 0.21rem 0;
                box-sizing: border-box;
                font-size: 0.14rem;
                line-height: 0.22rem;
                color: @black1;
            }
            .box-footer {
                width: 100%;
                box-sizing: border-box;
                padding: 0.43rem 0.21rem 0.25rem;
                div {
                    width: 100%;
                    height: 0.38rem;
                    background-color: @red4;
                    border-radius: 1rem;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    color: @white;
                    font-size: 0.16rem;
                    font-weight: bold;
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
