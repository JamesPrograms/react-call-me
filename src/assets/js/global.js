// 常量部分
let globalParams = {
    downloadAndroidAppUrl: 'https://apk.lobochat.cn/vally/guoliao_377.apk', // 无携带渠道号的安卓app下载地址
    downloadIosAppUrl: 'https://itunes.apple.com/cn/app/id1458755323?mt=8&at=1l3vntR&ct=qm', // 无携带渠道号的ios app下载地址
    wechatAppid: 'wx1aa472013ce6fb5c', // 微信app id
    wechatSecret: '36093d95f4f31b9eda321cc0d1c95810', // 微信secret
    webRtcInfo: {
        mode: 'live',
        codec: "h264",
        appId: 'f0593ac5c49142419e42f5aec112a34f',
    },
    isDevEnv: process.env.NODE_ENV === 'development',
    isTest: 1, // 1：线上测试版本，0：线上真实版本
    hasVideoChat: true,
    socketUrl() {
        // 如果是测试环境或者开发环境，用测试服的socket url
        if (this.isTest === 1 || this.isDevEnv) {
            return 'http://mgr.vchat.club:9094/';
        }
        // 如果是线上非测试环境，用线上服的socket url
        if (this.isTest === 0 && !this.isDevEnv) {
            return 'https://chat.vchat.club:9094/';
        }
    }
};

window.Global = globalParams;

export default globalParams;
