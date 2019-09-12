<template>
    <div class="wrap"
         @click="value.cb"
         :style="{
                background: value.bgcolor ? value.bgcolor : '#F2F3F6',
                color: value.color ? value.color : '#2E2E2E'
            }">
        <span class="icon-title">
            <img :src="value.iconUrl" class="icon">
            <span class="title" v-if="value.title">{{value.title}}</span>
        </span>
        <span class="content-more">
             <span class="content" :style="{color: value.contentColor}" v-if="value.content">{{value.content}}</span>
            <img src="../assets/image/personal-center/icon_more.png" class="more-icon">
        </span>
    </div>
</template>

<script>
    export default {
        name: 'myCell',
        props: ['value'],
        methods: {}
    }
</script>

<style lang="less" scoped>
    @import "../assets/less/variable";

    .wrap {
        width: 100%;
        box-sizing: border-box;
        padding: 0.15rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-radius: 0.12rem;
        margin-bottom: 0.1rem;

        .icon-title {
            display: flex;
            align-items: center;

            .icon {
                width: 0.2rem;
                height: 0.2rem;
            }
            .title {
                font-size: 0.14rem;
                font-weight: bold;
                margin-left: 0.12rem;
            }
        }

        .content-more {
            display: flex;
            align-items: center;

            .more-icon {
                width: 0.05rem;
                height: 0.08rem;
            }
            .content {
                font-size: 0.12rem;
                margin-right: 0.16rem;
            }
        }

    }
</style>
