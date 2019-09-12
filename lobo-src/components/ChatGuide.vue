<!-- 该组件不再需要 -->
<template>
    <div class="chat-guid-content" @click="closeChatGuid">
        <img src="../assets/image/video-chat/img_chat_guide.png">
    </div>
</template>

<script>
    export default {
        name: 'chatGuid',
        methods: {
            closeChatGuid() {
                this.$store.commit('setChatGuidTag',false);
            }
        }
    }
</script>

<style lang="less" scoped>
    @import "../assets/less/variable";
    .chat-guid-content {
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: 9998;
        background-color: rgba(0,0,0,.5);
        img {
            position: fixed;
            top: 0;
            left: 50%;
            width: 90%;
            z-index: 9999;
            transform: translateX(-50%);
        }
    }
</style>
