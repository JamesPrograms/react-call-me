import React, {Component} from 'react'
import {Carousel} from 'antd-mobile'
import './index.less'

class MySwiper extends Component {
    constructor(props) {
        super(props);
        this.state = {
            curSmallSwiperIndex: 0,
            isShowBigSwiper: false,
        }
    }

    /* 点击展示大swiper */
    showBigImg(index) {
        this.setState({
            isShowBigSwiper: true, // 将显示大swiper的标志至为true
            curSmallSwiperIndex: index,  // 更新小图当前的index
        });
    }

    /* 点击关闭大swiper */
    closeBigSwiper() {
        this.setState({
            isShowBigSwiper: false, // 将显示大swiper的标志至为false
        });
    }

    handleChange(index) {
        this.setState({
            curSmallSwiperIndex: index, // 更新小图当前的index
        });
    }

    getCurStatusWord(curStatus) { // 根据当前状态过滤出当前状态的文字
        let curWorObj = {1: '勿扰', 2: '空闲', 3: '忙碌'};
        return curWorObj[curStatus];
    }

    render() {
        let {albumList, curStatus} = this.props,
            {curSmallSwiperIndex, isShowBigSwiper} = this.state;
        return (
            <div className="content">
                <div className="swiper-wrap">
                    <p className="swiper-info">
                        <span className="cur-index-part">
                            <span className="cur-index">{curSmallSwiperIndex + 1}</span>
                            <span className="total-index">/{albumList.length}</span>
                        </span>
                            <span className={`cur-status status-bgc-${curStatus}`}>
                            {this.getCurStatusWord(curStatus)}
                        </span>
                    </p>
                    <Carousel style={{height: '3.75rem'}}
                              dots={false}
                              autoplay={true}
                              infinite={true}
                              afterChange={this.handleChange.bind(this)}
                    >
                        {
                            albumList.map((albumSrc, index) => {
                                return (<div key={index}>
                                    <div className="img-wrap" onClick={this.showBigImg.bind(this, index)}>
                                        <img src={albumSrc} className="album-img"/>
                                    </div>
                                </div>)
                            })
                        }
                    </Carousel>
                </div>
            </div>
        );
    }
}

export default MySwiper;
