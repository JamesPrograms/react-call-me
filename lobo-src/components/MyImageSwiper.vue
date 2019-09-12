<template>
    <div class="content">
        <div class="swiper-wrap">
            <mt-swipe :show-indicators="false" :auto="3000" @change="handleChange">
                <p class="swiper-info">
                    <span class="cur-index-part" v-if="albumList.length">
                        <span class="cur-index">{{curSmallSwiperIndex + 1}}</span>
                        <span class="total-index">/{{albumList.length}}</span>
                    </span>
                    <span class="cur-status" :class="'status-bgc-'+ curStatus">
                        {{curStatus | getCurStatusWord}}
                    </span>
                </p>
                <mt-swipe-item v-for="(albumSrc,index) in albumList" :key="index" v-if="albumList.length">
                    <div class="img-wrap" @click="showBigImg(index)">
                        <img :src="albumSrc" class="album-img">
                    </div>
                </mt-swipe-item>
                <mt-swipe-item v-if="!albumList.length">
                    <div class="img-wrap">
                        <img src="../assets/image/bg-img/img_no_pic.png" class="album-img">
                    </div>
                </mt-swipe-item>
            </mt-swipe>
        </div>

        <div class="big-swiper-wrap" v-if="isShowBigSwiper">
            <mt-swipe :show-indicators="true" :auto="0" :defaultIndex="curSmallSwiperIndex">
                <mt-swipe-item v-for="(albumSrc,index) in albumList" :key="index">
                    <div class="img-wrap" @click="closeBigSwiper">
                        <img :src="albumSrc" class="album-img">
                    </div>
                </mt-swipe-item>
            </mt-swipe>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'mySwiper',
        props: ['albumList','curStatus'],
        data() {
            return {
                curSmallSwiperIndex: 0,
                isShowBigSwiper: false,
            }
        },
        methods: {
            /* 点击展示大swiper */
            showBigImg(index) {
                // 将显示大swiper的标志至为true
                this.isShowBigSwiper = true;
                // 更新小图当前的index
                this.curSmallSwiperIndex = index;
            },
            /* 点击关闭大swiper */
            closeBigSwiper() {
                // 将显示大swiper的标志至为false
                this.isShowBigSwiper = false;
            },
            handleChange(index) {
                // 更新小图当前的index
                this.curSmallSwiperIndex = index;
            }
        },
        filters: {
            getCurStatusWord(curStatus) { // 根据当前状态过滤出当前状态的文字
                let curWorObj = {1:'勿扰',2:'空闲',3:'忙碌'};
                return curWorObj[curStatus];
            }
        },
    }
</script>

<style lang="less" scoped>
    @import "../assets/less/variable";

    .content {
        width: 100%;
        height: 100%;
    }

    .swiper-wrap {
        width: 100%;
        height: 100%;
        .img-wrap {
            width: 100%;
            height: 100%;
            background-color: @white;
            display: flex;
            justify-content: center;
            .album-img {
                object-fit: cover;
                height: 100%;
                width: 100%;
                display: inline-block;
            }
        }
    }

    .big-swiper-wrap {
        position: fixed;
        width: 100%;
        top: 0;
        left: 0;
        height: 100vh;
        z-index: 3000;
        .img-wrap {
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.95);
            display: flex;
            align-items: center;
            .album-img {
                width: 100%;
                height: auto;
            }
        }
    }

    .swiper-info {
        position: absolute;
        width: 100%;
        padding: 0 0.15rem;
        box-sizing: border-box;
        bottom: 0.14rem;
        z-index: 2009;
        display: flex;
        justify-content: flex-end;
        font-size: 0.12rem;
        color: @white;
        .cur-index-part {
            margin-right: 1.25rem;
            background-color: rgba(0,0,0,0.4);
            border-radius: 1rem;
            padding: 0 0.08rem;
            line-height: 0.17rem;
            .cur-index {
                opacity: 1;
            }
            .total-index {
                opacity: 0.5;
            }
        }
        .cur-status {
            border-radius: 1rem;
            padding: 0 0.08rem;
            line-height: 0.17rem;
        }
        // 忙碌
        .status-bgc-3 {
            background-color: #FF7D7D;
        }
        // 空闲
        .status-bgc-2 {
            background-color: #14E952;
        }
        // 勿扰
        .status-bgc-1 {
            background-color: #BDBDBD;
        }
    }
</style>
