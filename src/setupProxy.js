const proxy = require('http-proxy-middleware')

module.exports = function(app) {
    app.use(
        proxy(
            '/api', {
                // https://chat.vchat.club/webapi/
                // http://mgr.vchat.club:19001
                target: 'https://chat.vchat.club/webapi/',
                pathRewrite: {'^/api': '/'},
                changeOrigin: true
            }
        )
    )
};
