import Router from 'vue-router'
import util from './assets/js/util.js';
import store from './store.js';
import aes from './assets/js/aes';

const router = new Router({
    mode: 'hash',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/',
            name: 'index',
            component: require('./pages/Index.vue').default,
            redirect: '/beautyList',
            children: [
                {
                    path: '/beautyList',
                    name: 'beautyList',
                    component: require('./pages/BeautyList.vue').default,
                    meta: {
                        keepAlive: true,
                        title: '新生代的视频社交平台—CallMe',
                    }
                },
                {
                    path: '/beautyRanking',
                    name: 'beautyRanking',
                    component: require('./pages/BeautyRanking.vue').default,
                    meta: {
                        keepAlive: true,
                        title: '排行榜',
                    }
                },
                {
                    path: '/beautyVideoPlaying',
                    name: 'beautyVideoPlaying',
                    component: (resolve) => {
                        let curDevice = util.curDevice(),
                            isWechatEnv = util.isWechatEnv(),
                            isQqBrowser = util.isQqBrowser();
                        if (curDevice === 'ios') {
                            // 设备是ios
                            require(['./pages/BeautyVideoPlaying.vue'], resolve);
                        } else {
                            // 设备是安卓
                            if (isWechatEnv || isQqBrowser) {
                                // 安卓微信浏览器或者qq浏览器
                                require(['./pages/VideoPlayInAndriodWechat.vue'], resolve);
                            } else {
                                // 安卓其他浏览器
                                require(['./pages/VideoPlayInAndriodBrowser.vue'], resolve);
                            }
                        }
                    },
                    meta: {
                        keepAlive: true,
                        title: '视频秀',
                    }
                },
                {
                    path: '/beautyChatList',
                    name: 'beautyChatList',
                    component: require('./pages/BeautyChatList.vue').default,
                    meta: {
                        keepAlive: false,
                        title: '消息',
                    }
                },
                {
                    path: '/beautyCustomInfo',
                    name: 'beautyCustomInfo',
                    component: require('./pages/BeautyCustomInfo.vue').default,
                    meta: {
                        keepAlive: false,
                        title: '我的',
                    }
                },
            ]
        },
        {
            path: '/login',
            name: 'login',
            component: require('./pages/Login.vue').default,
            meta: {
                keepAlive: false,
                title: '登陆',
            },
        },
        {
            path: '/loginWithSms',
            name: 'loginWithSms',
            component: require('./pages/LoginWithSms.vue').default,
            meta: {
                keepAlive: false,
                title: '验证码登陆',
            },
        },
        {
            path: '/beautyChatContent',
            name: 'beautyChatContent',
            component: require('./pages/BeautyChatContent.vue').default,
            meta: {
                keepAlive: false,
                title: '消息',
            },
        },
        {
            path: '/beautyListItem',
            name: 'beautyListItem',
            component: require('./pages/BeautyListItem.vue').default,
            meta: {
                keepAlive: false,
                title: '主播详情',
            }
        },
        {
            path: '/buyDiamond',
            name: 'buyDiamond',
            component: require('./pages/BuyDiamond.vue').default,
            meta: {
                keepAlive: false,
                title: '购买钻石',
            },
        },
        {
            path: '/buyVip',
            name: 'buyVip',
            component: require('./pages/BuyVip.vue').default,
            meta: {
                keepAlive: false,
                title: '购买VIP',
            },
        },
        {
            path: '/downloadPage',
            name: 'downloadPage',
            component: require('./pages/DownloadPage.vue').default,
            meta: {
                keepAlive: false,
                title: '下载APP',
            },
        },
        {
            path: '/videoChatPage',
            name: 'videoChatPage',
            component: require('./pages/VideoChatPage.vue').default,
            meta: {
                keepAlive: false,
                title: '视频通话',
            },
        },

        {
            path: '/sample',
            name: 'sample',
            component: require('./pages/Sample.vue').default,
            meta: {
                keepAlive: true
            },
        },

        // lazy load例子
        // {
        //   path: '/about',
        //   name: 'about',
        //   // route level code-splitting
        //   // this generates a separate chunk (about.[hash].js) for this route
        //   // which is lazy-loaded when the route is visited.
        //   component: () => import(/* webpackChunkName: "about" */ './pages/About.vue')
        // }
    ]
});

// 全局导航守卫
router.beforeEach((to, from, next) => {
    let loginInfo = util.getStorage('loginInfo');

    // 覆盖浏览器中存在的cpsChain
    let userChannelParamChain = util.getParamByName('user_channel_chain');
    if (userChannelParamChain) {
        let userChannelParams = userChannelParamChain.split('_');
        util.setStorage('cpsChain', userChannelParams);
    }

    /* this code is repeat with wechat login url */
    // if (!loginInfo) {
    //     // 判断url中是否有code字段（用户加密信息）
    //     let encryptAesCode = util.getParamByName('code');
    //     // 如果url中有加密信息
    //     if (encryptAesCode) {
    //         // 1. 则解密该信息并赋值给loginInfo
    //         loginInfo = JSON.parse(aes.Decrypt(encryptAesCode));
    //         // 2. 将loginInfo加入本地
    //         util.setStorage('loginInfo', loginInfo);
    //     }
    // }
    /* this code is repeat with wechat login url */

    // 登陆信息不存在
    if (!loginInfo) {
        // 不需要权限的页面
        let noSessionPages = ['login', 'loginWithSms', 'beautyList', 'beautyListItem', 'beautyRanking', 'downloadPage'];
        if (noSessionPages.indexOf(to.name) !== -1) {
            // 跳到路由所在页
            next();
        } else {
            // 无登陆状态下，跳转到登陆页面之前，记录登陆成功后要跳转的页面
            store.commit('recordWillEnterPage', to.name);
            // 跳到登录页
            next('login');
        }
    } else {
        // 有过登陆历史记录，且即将进入登陆页时，中断当前导航，回到from页
        if (to.name === 'login' || to.name === 'loginWithSms') {
            next('beautyList');
        } else {
            // 有过登陆历史记录,且还未绑定手机号并且是重新进入项目页面，提示绑定手机号
            if (loginInfo.isBind !== 1 && !util.getStorage('hasEntered', sessionStorage)) {
                util.setStorage('hasEntered', 'true', sessionStorage);
                store.commit('setBindBoxTag', {
                    type: 'bindPhoneBox',
                    isBindPhoneBoxShow: true,
                });
            }
            // 有过登陆历史记录，跳到路由所在页
            next();


            // 过登陆历史记录，给需要加上loginInfo的页面加上loginInfo(如果有code,说明已经加过了则不加，直接next())
            // let pageWithLoginInfoList = ['beautyListItem', 'beautyChatContent', 'beautyVideoPlaying'];
            // if (pageWithLoginInfoList.indexOf(to.name) !== -1 && !to.query.code) {
            //     // 先加密再赋值
            //     let newQuery = JSON.parse(JSON.stringify(to.query));
            //     newQuery.code = aes.Encrypt(JSON.stringify(loginInfo));
            //     next({
            //         path: to.path,
            //         query: newQuery
            //     });
            //     return;
            // }
            // next();
        }
    }
});

export default router;
