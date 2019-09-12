<template>
    <div class="wrapper">
        <keep-alive>
            <router-view/>
        </keep-alive>

        <TabBar/>
    </div>

</template>

<script>
    export default {
        name: 'index',
        components: {
            TabBar: require('../components/TabBar.vue').default,
        }
    }
</script>
