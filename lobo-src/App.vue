<template>
    <div id="app">
        <keep-alive>
            <!-- 此处会缓存视图组件 -->
            <router-view
                    v-if="$route.meta.keepAlive"
                    v-wechat-title="$route.meta.title"
            ></router-view>
        </keep-alive>
        <!-- 此处不会缓存视图组件（用v-else会报错） -->
        <router-view
                v-if="!$route.meta.keepAlive"
                v-wechat-title="$route.meta.title"
        ></router-view>

        <BindPhoneBox v-if="isBindPhoneBoxShow"></BindPhoneBox>

        <ChatGuide v-if="isChatGuideShow"></ChatGuide>
    </div>
</template>

<script>
    import { initNim } from './assets/js/im/initIm.js';
    export default {
        name: 'App',
        computed: {
            isBindPhoneBoxShow() {
                return this.$store.state.isBindPhoneBoxShow;
            },
            isChatGuideShow() {
                return this.$store.state.isChatGuideShow;
            }
        },

        mounted () {
            // 初始化im sdk并建立连接
            if (this.util.getStorage('loginInfo')) {
                initNim();
            }
        },
        components: {
            BindPhoneBox: require('./components/BindPhoneBox.vue').default,
            ChatGuide: require('./components/ChatGuide.vue').default
        }
    }
</script>

<style lang="less">

</style>
