// 引入axios插件
import axios from 'axios';
// 引入基础方法
import util from './util.js';
// 引入项目返回的错误信息码表
import svrCode from './serverCode.js';
// 引入qs模块，用来序列化post类型的数据
import qs from 'qs';
import {Toast} from 'antd-mobile'


// 创建axios实例， 参数对象为默认配置对象
const Axios = axios.create({
    baseURL: process.env.NODE_ENV === 'development' ? '/api' : '/webapi/',  // 上线域名https://chat.vchat.club:8240/ 需要确认
    timeout: 60000,
    // responseType: "json", // 此处不能定死，因为在支付宝支付时，接口返回的时form表单格式
    // withCredentials: true, // 是否允许带cookie这些
    headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
    }
});

// 添加请求拦截器( 即在发送请求之前做某件事)
Axios.interceptors.request.use(
    config => {
        let paramOption = config.data ? config.data : config.params, // get的请求的参数为config.params,post为config.data
            extraOptionObj = paramOption.extraOption || {};

        // 没有没有额外配置或没加loading标志，都给请求加上loading
        if (!extraOptionObj || !extraOptionObj.noLoading) {
            Toast.loading('加载中...',10);
        }

        // 如果存在参数以外的额外配置，在参数配置项中做相应操作
        if (extraOptionObj) {
            // 1. 删除额外的配置项
            delete paramOption.extraOption;

            // 2. 根据配置项内容做相应操作
            // 2.1 如果额外参数中传递了baseUrl,则更新baseUrl
            if (extraOptionObj.baseUrl) {
                config.baseURL = extraOptionObj.baseUrl;
            }
            // 2.2 如果额外参数中传递了content-type,则更新content-type
            if (extraOptionObj.contentType) {
                config.headers['Content-Type'] = extraOptionObj.contentType;
            }
        }

        // 序列化post请求的参数
        if (config.method === 'post') {
            // json格式参数不需要序列化
            config.data = extraOptionObj.contentType === 'application/json;charset=UTF-8' ? paramOption : qs.stringify(paramOption);
        }

        // 设置请求头
        util.setRequestInfo(config);

        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

//返回状态判断(添加响应拦截器)
Axios.interceptors.response.use(
    res => {
        /**
         * res返回常用参数如下：
         * config -> axios配置对象
         * data -> 接口返回数据
         * status -> 响应状态码
         **/

        // 关闭indicator
        Toast.hide();

        // 用toast弹出接口返回的错误码
        let errCode = svrCode.errCode;
        if (res.data) {
            let resultCode = res.data.resultCode;

            // 如果错误码表中包含返回的resultCode
            if (errCode.hasOwnProperty(resultCode)) {
                let errMsg = errCode[resultCode];
                util.toast(errMsg);

                if (resultCode === 10016) {
                    util.rmStorage('loginInfo');
                    setTimeout(function(){
                        util.goPage('login');
                    },1500)

                }

                return Promise.reject(errMsg);
            }
        }

        return res;
    },
    error => {
        // 关闭indicator
        Toast.hide();

        // 请求失败做出相应提醒
        let errMsg;
        switch (error.response.status) {
            case(403):
                errMsg = '服务器拒绝了您的请求';
                break;
            case(404):
                errMsg = '您请求的资源不存在';
                break;
            case(408):
                errMsg = '请求超时，请稍后再试';
                break;
            case(500):
                errMsg = '服务器出错了';
                break;
            default:
                errMsg = '请求出错了，请稍后再试';
                break;
        }

        // 弹出信息提示
        setTimeout(() => {
            util.toast(errMsg);
        },500);

        return Promise.reject(error);
    }
);

/**
 * get方法，对应get请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 */
function get(url, params){
    return new Promise((resolve, reject) =>{
        Axios.get(url, { params })
            .then(res => {
                resolve(res.data);
            })
            .catch(err => {
                reject(err.data)
            })
    });
}
/**
 * post方法，对应post请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 */
function post(url, params) {
    return new Promise((resolve, reject) => {
        Axios.post(url, params)
            .then(res => {
                resolve(res.data);
            })
            .catch(err => {
                reject(err.data)
            })
    });
}

export default{
    get,
    post
}
