import React, { Component } from 'react';
import './style.css';
import {CSSTransition,TransitionGroup} from 'react-transition-group'

class Boss extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isShow:true
        }
        this.toToggole = this.toToggole.bind(this)
    }
    render() {
        return (
            <div>
                <CSSTransition
                    in={this.state.isShow}
                    timeout={2000}
                    classNames="boss-text"
                     // 该属性目的：动画退场时将DOM移除
                    unmountOnExit
                >
                    <div>BOSS级人物-孙悟空</div>
                </CSSTransition >

                <div><button onClick={this.toToggole}>召唤Boss</button></div>
            </div>
        );
    }

    toToggole(){
        this.setState({
            isShow:this.state.isShow ? false : true
        })
    }
}

export default Boss;
