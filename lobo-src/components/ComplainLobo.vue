<template>
    <div class="complaint-content" @click.self="closeComplainBox">
        <div class="complaint-wrap">
            <div class="complaint-list">
                <div class="complain-item"
                     v-for="(item,index) in complainList"
                     @click="setActiveIndex(index)"
                     :class="{'complain-item-active': index === activeIndex && (activeIndex > 0 || activeIndex === 0)}"
                >
                    <span>{{item.reason}}</span>
                </div>
            </div>
            <div class="other-reason">
                <p class="title">其他</p>
                <textarea rows="4" class="reason"
                          placeholder="请尽可能详细描述您举报的内容，便于审核人员准确核查，内容需大于10个汉字"
                          v-model="otherReason"
                          @blur="util.resizeScroll"
                ></textarea>
            </div>
            <button class="complain"
                    :class="{'complain-active': (activeIndex > 0 || activeIndex === 0) || otherReason.length > 10}"
                    @click="complainLobo"
            >举报
            </button>
        </div>
    </div>

</template>

<script>
    import axios from 'axios';
    import svrCode from '../assets/js/serverCode';
    export default {
        name: 'ComplainLobo',
        data() {
            return {
                complainList: [],
                activeIndex: null,
                otherReason: ''
            }
        },
        props: ['value'],
        computed: {
            queryParams() {
                return this.$route.query;
            },
            complainReason() {
                let reason;
                if (this.otherReason) {
                    reason = this.otherReason;
                }
                if (this.activeIndex !== null) {
                    reason = this.complainList[this.activeIndex]['reason'];
                }
                return reason;
            }
        },
        mounted() {
            console.log(document.getElementById('remoteVideoStream'))
            // 请求投诉原因列表
            this.http.post('postsales/complaint/getComplaintConfig.do', {
                type: 1, // 1是视频内投诉，2是视频外投诉（包含Profile投诉）
                extraOption: {
                    noLoading: true
                }
            }).then(res => {
                this.complainList = res.dataCollection;
            });
        },
        watch: {
          otherReason(val) {
              if (val) {
                  this.activeIndex = null;
              }
          }
        },
        methods: {
            setActiveIndex(index) {
                if (this.otherReason) {
                    this.otherReason = '';
                }
                this.activeIndex = index;
            },
            getVideoShot() {
                // 将base64图片url转化成图片文件的方法
                function dataURLtoFile(dataurl, filename = 'file') {
                    let arr = dataurl.split(',')
                    let mime = arr[0].match(/:(.*?);/)[1]
                    let suffix = mime.split('/')[1]
                    let bstr = atob(arr[1])
                    let n = bstr.length
                    let u8arr = new Uint8Array(n)
                    while (n--) {
                        u8arr[n] = bstr.charCodeAt(n)
                    }
                    return new File([u8arr], `${filename}.${suffix}`, {
                        type: mime
                    })
                }

                // 获取当前视频帧base64地址
                let videoContainer = document.querySelector('#remoteVideoStream'),
                    video = videoContainer.querySelector('video'),
                    canvas = document.createElement("canvas"),
                    videoShotSrc;
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
                videoShotSrc = canvas.toDataURL("image/png");

                return dataURLtoFile(videoShotSrc);
            },
            complainLobo() {
                console.log(this.getVideoShot());
                let _this = this;

                // 验证是否有选中或者输入原因
                if (_this.activeIndex === null && (!_this.otherReason || _this.otherReason.length <= 10)) {
                    return;
                }

                // 使用formData进行提交
                // 1. 初始化formData
                let params = new FormData();
                // 2. 将需要上传的参数加入formData
                params.append('orderRedisId', parseInt(_this.queryParams.orderNum));
                params.append('complainUserId', parseInt(_this.util.getStorage('loginInfo').userId));
                params.append('complainedUserId', parseInt(_this.queryParams.userId));
                params.append('reason', _this.complainReason);
                params.append('file', _this.getVideoShot());
                params.append('key', 'ts');
                // 3. 使用axios发起请求
                let prefixUrl = process.env.NODE_ENV === 'development' ? '/api': '/webapi';
                axios.post(prefixUrl + '/postsales/complaintOrder/insertOrderComplaint.do',params,{
                    headers: {
                        session: _this.util.getStorage('loginInfo').session,
                        userId: _this.util.getStorage('loginInfo').userId
                    }
                }).then(res => {
                    // 如果有返回报错码，则显示报错信息
                    let resultCode = res.data.resultCode,
                        errCodeList = svrCode.errCode;
                    if (errCodeList.hasOwnProperty(resultCode)) {
                        _this.util.toast(errCodeList[resultCode]);
                    }

                    // 返回成功状态码
                    if (resultCode === 2202) {
                        // 请求成功后关掉举报弹窗
                        _this.$emit('input', false);
                        _this.util.toast('投诉成功！');
                    }
                });
            },
            closeComplainBox() {
                this.$emit('input',false);
            }
        }
    }
</script>

<style lang="less" scoped>
    @import "../assets/less/variable";

    .complaint-content {
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
    }

    .complaint-wrap {
        width: 100%;
        position: absolute;
        left: 0;
        bottom: 0;
        background: #353C46;
        box-sizing: border-box;
        padding: 0.15rem 0.15rem 0.12rem;
        z-index: 1;
    }

    .complaint-list {
        width: 100%;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        overflow: hidden;
    }

    .complain-item {
        width: 1.7rem;
        height: 0.4rem;
        box-sizing: border-box;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 0.08rem;
        display: flex;
        align-items: center;
        padding-left: 0.15rem;
        margin-top: 0.05rem;
        font-size: 0.14rem;
        color: @white;
    }

    .complain-item-active {
        border: 0.02rem solid #F9517E;
    }

    .other-reason {
        width: 100%;
        margin-top: 0.15rem;

        .title {
            font-size: 0.14rem;
            color: @white;
            margin-bottom: 0.1rem;
        }

        .reason {
            width: 100%;
            box-sizing: border-box;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 0.08rem;
            padding: 0.12rem 0.12rem 0.1rem;
            color: @white;
            // attention: 解决在ios中textarea无法聚焦的问题
            -webkit-user-select: auto!important;
        }
    }

    .complain {
        width: 100%;
        height: 0.35rem;
        box-sizing: border-box;
        margin-top: 0.2rem;
        border: 1px solid #8B8B8B;
        border-radius: 0.2rem;
        font-size: 0.14rem;
        color: #8B8B8B;
        background-color: transparent;
    }

    .complain-active {
        border: 0;
        background: #F9517E;
        color: @white;
    }
</style>
