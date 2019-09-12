<template>
    <div id="agora_video" style="height: 100%">
        <div style="margin-top: 300px">
            <textarea class="reason" cols="30" rows="4" placeholder="dddddddd" style="text-indent: 50px;font-size: 20px"></textarea>
        </div>

    </div>
</template>

<script>
    import aes from '../assets/js/aes';
    export default {
        name: 'sample',
        data() {
            return {

            }
        },
       mounted() {
            let encrypt = aes.Encrypt('123456');
            console.log(encrypt);
            console.log(aes.Decrypt(encrypt))
       },
        methods: {

        }
    }
</script>

<style lang="less" scoped>
    .reason {
        -webkit-user-select: auto!important;
    }
</style>

