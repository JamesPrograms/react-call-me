import React, {Component} from 'react'
import PropTypes from 'prop-types'
// import axios from 'axios'

class XjjItem extends Component {
    constructor(props){
        super(props);
        this.delItem = this.delItem.bind(this)
    }

    // 性能优化
    shouldComponentUpdate(nextProps, nextState, nextContext) {
        if (nextProps.content !== this.props.content) {
            return true;
        } else {
            return false;
        }
    }

    // componentWillReceiveProps(nextProps, nextContext) {
    //     console.log('componentWillReceiveProps:子组件接收props前执行');
    //     console.log(nextProps, nextContext);
    // }

    render() {
        console.log('props已改变');
        return (
            <li onClick={this.delItem.bind(this.props.index)}>{this.props.content} - {this.props.avename}</li>
        )
    }

    componentDidMount() {
        // 一般在此生命周期请求网络数据进行页面初始化
    }

    componentWillUnmount() {
        console.log('componentWillUnmount:组将将要被删除前调用')
    }

    // 方法
    delItem(index) {
        this.props.del(index);
    }
}

XjjItem.defaultProps = {
    avename: 'avename'
};
XjjItem.propTypes = {
    content: PropTypes.string,
    delItem: PropTypes.func,
    index: PropTypes.number,
    avename: PropTypes.string.isRequired // 父组件必传字符串值
};

export default XjjItem
