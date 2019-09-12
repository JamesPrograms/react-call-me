import React, {Component, Fragment} from 'react'
import XjjItem from './XjjItem'
import Boss from './Boss'

class Xjj extends Component {
    constructor(props) {
        super(props);
        this.changeVal = this.changeVal.bind(this);
        this.add = this.add.bind(this);
        this.del = this.del.bind(this);
        this.state = {
            inputVal: '',
            list: ['test1', 'test2']
        }
    }

    componentWillMount() { // componentWillMount和componentDidMount这两个生命周期函数只在页面刷新时执行一次
        console.log('componentWillMount：组件将要挂载到页面时调用，只调用一次')
        console.log(this.inputCom) // undefined
    }

    render() {  // 只要有state和props变化，render函数就会执行
        console.log('render:组件挂载中...')
        console.log(this.inputCom) // undefined
        return (
            <Fragment>
                <div>
                    <label htmlFor='test'>加ddd入</label>
                    <input id='test' value={this.state.inputVal} onChange={this.changeVal} ref={(input) => this.inputCom = input}/>
                    <button onClick={this.add}>增加</button>
                </div>
                <ul>
                    {
                        this.state.list.map((item,index) => {
                            return <XjjItem content={item} key={index} index={index} del={this.del}/>
                        })
                    }
                </ul>

                <Boss/>
            </Fragment>
        );
    }

    componentDidMount() {
        console.log('componentDidMount：组件已经挂载到页面时调用，只调用一次')
        console.log(this.inputCom) // input DOM节点
    }

    // 是否同意组件更新
    shouldComponentUpdate() {
        console.log('shouldComponentUpdate: 组件发生改变前执行,要求返回布尔值，返回true同意组件更新，返回false阻止组件更新');
        return true;
    }

    // 组件将要更新
    componentWillUpdate() {
        console.log('componentWillUpdate :shouldComponentUpdate组件更新前执行，如果shouldComponentUpdate返回false则不执行')
    }

    // 组将更新后执行
    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log('componentDidUpdate:组件更新后执行。');
        // console.log('prevProps:',prevProps);
        // console.log('prevState:',prevState);
        // console.log('snapshot:',snapshot);
    }

    // 方法
    changeVal(e) {
        this.setState({
            // inputVal:e.target.value
            inputVal: this.inputCom.value
        })
    }
    add() {
        this.setState({
            list: [...this.state.list,this.state.inputVal],
            inputVal: ''
        },() => console.log(this.state.list))
        // console.log(this.state.list) // setstate是一个异步的过程，此处打印永远会少一个，解决在setstate的提供的第二个方法（即setstate执行成功后的回调）中打印
    }

    del(index) {
        let list = this.state.list;
        list.splice(index,1);
        this.setState({list})
    }
}

export default Xjj
