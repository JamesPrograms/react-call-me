<template>
    <div class="slider">
        <div class="swiper" :style="{height: xheight}">
            <slot></slot>
        </div>
    </div>
</template>

<script>
    const arrayFrom = (nodeList) => Array.prototype.slice.call(nodeList)

    export default {
        methods: {
            init() {
                // 当前组件根元素，即slider
                this.el = this.$el
                // swiper容器
                this.container = this.el.querySelector('.swiper')
                // swiper items
                this.items = this.container.querySelectorAll('.i-swiper-item')
                // swiper videos
                this.videos = this.container.querySelectorAll('.my-video')

                // 此处使用js动态给视频浏览器可视部分的高度，以解决在safari等浏览器中使用100vh的兼容问题
                if (this.util.curDevice() === 'ios') {
                    for (let item of this.videos) {
                        item.height = document.body.clientHeight;
                    }
                }
                // 在安卓端非微信浏览器中重置视频的高度
                if (this.util.curDevice() === 'android' && !this.util.isWechatEnv()) {
                    for (let item of this.videos) {
                        item.height = document.body.clientHeight - document.querySelector('.video-tab-bar').offsetHeight;
                    }
                }

                // siper列表长度
                this.length = this.items.length
                // swiper容器的高度
                this.height = this.el.offsetHeight
                // swiper内容的高度（所有swiper item之和）
                this.xheight = this.el.offsetHeight * this.length + 'px'
                // 初始化option数据，变为[0,1,2,...,item.length-1]
                this._initOption()
                // 激活样式暂时用不上
                this._activeClass()
                // 初始化每个item在垂直方向上的相对位置
                this._setOffset()
                // 初始化每个item的滑动距离
                this._setTransform()
            },
            destroyEventListener: function () {
                this.container.removeEventListener('touchstart', this.handlerTouchstart, false)
                this.container.removeEventListener('touchmove', this.handlerTouchmove, false)
                this.container.removeEventListener('touchend', this.handlerTouchend, false)
                this.items[1] && this.items[1].removeEventListener('webkitTransitionEnd', this.handlerTransition, false)
            },
            _activeClass() {
                const clazz = this.activeClass
                Array.prototype.forEach.call(this.items, (item, key) => {
                    item.classList.remove(clazz)
                    if(this.index === key) {
                        item.classList.add(clazz)
                    }
                })
            },
            _initOption() {
                for(var i=0; i<this.length; i++) {
                    this.option.push(i)
                }
            },
            _setOffset() {
                let _this = this
                let index = _this.option.indexOf(_this.index)
                _this.offset = []
                arrayFrom(_this.items).forEach((item, key) => {
                    _this.offset.push((key - index)*_this.height)
                })
            },
            _setTransition(duration) {  // 设置item切换的动画时间
                duration = duration || (this.duration || 'none')
                let transition = duration === 'none' ? 'none' : duration + 'ms'
                arrayFrom(this.items).forEach((item, key) => {
                    item.style.webkitTransition = transition
                    item.style.transition = transition
                })
            },
            _setTransform(offset) { // 滑动距离设置
                let _this = this
                offset = offset || 0
                arrayFrom(_this.items).forEach((item, key) => {
                    let distance = _this.offset[key] + offset
                        let transform = `translate3d(0, ${distance}px, 0)`
                    item.style.webkitTransform = transform
                    item.style.transform = transform
                })

            },
            getDistance(distance) {
                // 1. 如果是第一个item往下拉，将distance置为0
                if (distance > 0 && this.index ===0) {
                    return 0
                } else if (distance < 0 && this.index === this.length - 1) {
                    // 2. 如果是最后一个item往上拉，将distance置为0
                    return 0
                } else {
                    // 除开以上两种情况外，正常返回计算的distance
                    return distance
                }
            },
            handlerTouchstart: function (event) {
                if (this.stop) return
                // 记录touch事件起始点的值
                this.start = {
                    x: event.changedTouches[0].pageX,
                    y: event.changedTouches[0].pageY
                }
                // 无过度时间
                this._setTransition('none')

                // touchstart，touchmove，touchend中只有touchstart可以触发视频播放，
                // 所以在当前touchstart事件中让下一个视频处于播放过的状态（即先播放再暂停）
                // 当切换到下一个视频时便可直接播放
                let nextIndex = this.index + 1,
                    notFirstPlayList = this.notFirstPlayList,
                    videoNodeList = this.videos;

                // 如果是第一个视频
                if (this.index === 0 && !notFirstPlayList.includes(0)) {
                    notFirstPlayList.push(0);
                    this.videos[this.index].play();
                    this.videos[this.index].pause();
                }

                // 不是第一个视频
                if (nextIndex !== this.length && !notFirstPlayList.includes(nextIndex)) {
                    notFirstPlayList.push(nextIndex);
                    videoNodeList[nextIndex].play();
                    videoNodeList[nextIndex].pause();
                }
            },
            handlerTouchmove(event) {
                if (this.stop) return
                this.move = {
                    x: event.changedTouches[0].pageX,
                    y: event.changedTouches[0].pageY
                }
                let distanceX = this.move.x - this.start.x
                let distanceY = this.move.y - this.start.y
                let distance = distanceY
                let noScrollY = Math.abs(distanceX) < Math.abs(distanceY)   // x上的滑动值小于y上的滑动值，则是在y上滑动

                // 如果是第一个或者最后一个item,加大滑动比（即实际移动的位置距离为滑动距离的三分之一）
                if (this.index === this.length - 1 || this.index ===0) {
                    distance = distance / 3
                }

                // 如果是y轴上的滑动，则设置滑动距离
                if (noScrollY) {
                    this._setTransform(distance)
                }
                // y轴上的滑动需要阻止默认事件
                noScrollY && event.preventDefault()
            },
            handlerTouchend: function(event) {
                // 如果只有一个item或者有停止标志，则滑动结束后不做任何操作
                if (this.length === 1) return
                if (this.stop) return

                this.end = {
                    x: event.changedTouches[0].pageX,
                    y: event.changedTouches[0].pageY
                }
                // 滑动距离为toushstart和touchendy轴上的距离差值
                let distance = this.end.y - this.start.y
                // 第一个往下滑的item和最后一个往上滑的item距离都返回0
                distance = this.getDistance(distance)
                // 如果滑动距离为0或者滑动小于最小值，都不换页
                if (distance === 0 || Math.abs(distance) < this.minMovingDistance) {
                    this._move(0)
                    return
                }
                this.videos[this.index].pause();
                // 滑动距离大于0，说明在往下滑，则当前切换到上一页
                if (distance>0) {
                    this._move(-1)
                } else if (distance < 0) {

                    // 如果是第十个视频往上滑，如果不是vip,则弹窗提示今日视频已查看完并阻止以后代码执行
                    if (this.index === 9 && !this.util.getVipInfo().isVip) {
                        // 触发父组件事件以显示弹窗提示
                        if (this.util.curDevice() === 'ios') {
                            this.$emit('getNewVideoStatus', true);
                        }
                        // 回滚到当前页并不会切换到下一页
                        this._move(0);
                        return;
                    }

                    // 滑动距离小于0，说明在往上滑，则当前切换到下一页
                    this._move(1)
                }
                this.videos[this.index].play();
            },
            handlerTransition: function (event) {
                this._activeClass()
                event.preventDefault()

            },
            _bind: function () {
                this.container.addEventListener('touchstart', this.handlerTouchstart, false)
                this.container.addEventListener('touchmove', this.handlerTouchmove, false)
                this.container.addEventListener('touchend', this.handlerTouchend, false)
                this.items[1] && this.items[1].addEventListener('webkitTransitionEnd', this.handlerTransition, false)
            },
            _move: function(num) {
                // 切换前，当前播放的video实际上是切换后当前播放video的上一次video
                // this.lastItemPlayIndex = this.index;
                // 滑动切换到指定index的item
                this._go(this.index + num)
            },
            _go: function(index) {
                let _this = this
                index = index || 0
                if (0 < index < _this.length) {
                    // 将切换后item的索引赋值给this.index(即当前显示的index页)
                    _this.index = index
                }
                // 上一个播放的item的index不等于当前item的index时
                // if (this.lastItemPlayIndex !== this.index) {
                //     // 暂停上一个item video的播放
                //     this.videos[this.lastItemPlayIndex].pause();
                //     // 播放当前item的video
                //     this.videos[this.index].play();
                // }
                _this._setOffset()
                _this._setTransition()
                _this._setTransform(0)
            }
        },
        data() {
            return {
                index: 0,
                xheight: 0,
                activeClass: 'swiper-item-active',
                el: this.$el,
                container: null,
                items: null,
                videos: null, // swiper中加载的video元素
                // lastItemPlayIndex: 0, // 上一次视频播放item的index
                length: 0,
                notFirstPlayList: [], // 该数组存放的是不是第一次播放的视频索引
                height: 0,
                current: null,
                option: [],
                offset: [],
                start: {x: 0, y: 0},
                move: {x: 0, y: 0},
                end: {x: 0, y: 0},
                isMobile: false,
                videoLength: 0
            }
        },
        props: {
            minMovingDistance: {    // 换页的最短滑动距离
                type: Number,
                default: document.documentElement.clientHeight/7
            },
            duration: { // 动画时间，切换时间（单位ms）
                type: Number,
                default: 300
            },
            stop: {     // 是否停止滑动 true：是 false：否
                type: Boolean,
                default: false
            },
            value: {    // 当前滑动到第几个item
                type: Number,
                default: 0
            },
            isNoMoreVideo: {    // 是否还可查看更多视频的标志
                type: Boolean,
                default: false
            },
            isVideoLoad: {
                type: Array,
                default: []
            }
        },
        mounted() {
            this.$nextTick(() => {
                this.index = this.value;
                this.init() // 初始化事件和赋值操作
                this._bind()
            });
        },
        watch: {
            index(val) {
                this.$emit('input', val)
            },
            value(val) {
                if (val !== this.index && 0 < val < this.length) {
                    this.index = val
                    this.$nextTick(() => {
                        this._go(this.index)
                    })
                } else {
                    this.index = val
                }
            },
            stop(val) {
                let _this = this
                this.$nextTick(() => {
                    if (val) {
                        _this.destroyEventListener()
                    } else {
                        _this._bind()
                    }
                })
            },
            // 当前无更多视频标志从true变为false,说明提示弹窗被关闭
            isNoMoreVideo(val) {
                if (!val) {
                    // 提示弹窗出现时，video自动会变为暂停状态，弹窗被关闭后触发播放
                    this.videos[this.index].play();
                }
            },
            isVideoLoad() {
                this.$nextTick(() => {
                    this.index = this.value;
                    this.init() // 初始化事件和赋值操作
                    this._bind()
                    // 每次加载初始化后当前视频会处于暂停播放状态，此处重新开始播放
                    this.videos[this.index].play();
                });
            }
        },
        name: "swiper"
    }
</script>

<style>
    .slider{
        overflow: hidden;
        position: relative;
    }
    .swiper {
        position: relative;
        overflow: hidden;
    }
    .i-swiper-item {
        position: absolute;
        top: 0;
        left: 0;
    }
    .i-swiper-item.swiper-item-active {
        background: #eeeeee;
    }
</style>
