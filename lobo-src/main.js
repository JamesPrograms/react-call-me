import App from './App.vue';
import router from './router';
import store from './store'

// 配置util公共方法供全局组件调用
import util from './assets/js/util.js';
// 配置http公共方法供全局组件调用
import http from './assets/js/http.js';
// 配置常量供全局组件调用
import global from './assets/js/global.js';
// 配置功能方法供全局组件调用
import func from './assets/js/func.js';

// 开发模式或者测试环境中启动vconsole调试
if (global.isTest === 1 || global.isDevEnv) {
    new VConsole();
}

// 引入全局样式
import './assets/less/index.less';

// 给微信动态设置title
import wechatTitle from 'vue-wechat-title';

Vue.use(wechatTitle);

Vue.config.productionTip = process.env.NODE_ENV === 'development' ? true : false;

// 在vue原型上绑定供全局实例调用的方法
Vue.prototype.util = util;
Vue.prototype.http = http;
Vue.prototype.global = global;
Vue.prototype.func = func;

new Vue({
    router,
    store: store,
    render: h => h(App)
}).$mount('#app');
