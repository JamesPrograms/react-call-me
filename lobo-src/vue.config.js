// vue.config.js
module.exports = {
	publicPath: './',//路径
	productionSourceMap: false,//不打包map文件
    devServer: {
        host: '0.0.0.0',
        // host: '192.168.10.215',
        port: 8040,
        proxy: {
            '/api': {
                // https://chat.vchat.club/webapi/
                // http://mgr.vchat.club:19001
                target: 'http://mgr.vchat.club:19001',
                pathRewrite: {'^/api': '/'},
                changeOrigin: true
            }
        }
    },
    configureWebpack:config=>{//cdn三方库
    	config.externals = {
    		'vue': 'Vue',
    		'axios': 'axios',//请求
            'mint-ui': 'MINT', // mint-ui
    		'vue-router':'VueRouter',//路由
			'vuex':'Vuex', // 状态
    	}
    },
};
