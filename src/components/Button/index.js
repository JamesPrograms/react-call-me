import React, { Component } from 'react'
import propTypes from 'prop-types'
import './index.less'
class Button extends Component {
    constructor(props) {
        super(props);
        this.state = {
            imgSize: this.props.height.replace('rem','')*0.45 + 'rem',
            imgUrl: '../../assets/image/icon/' + this.props.imgName + '.png'
        };
    }
    render() {
        const { children,width,height,bRadius,bgColor,text,textColor} = this.props;
        return (
            <div className="center"
                style={{
                width: width,
                height:height,
                backgroundColor: bgColor,
                borderRadius: bRadius,
            }}
                 onClick={this.btnClick.bind(this)}
            >
                {children}
                <span style={{color: textColor,fontSize: height.replace('rem','')*0.34 + 'rem' ,fontWeight: '600',marginLeft: children ? '0.1rem': 0}}>{text}</span>
            </div>
        );
    }
    btnClick() {
        this.props.btnClick();
    }
}

Button.propTypes = {
    width: propTypes.string,
    height: propTypes.string,
    bRadius: propTypes.string,
    bgColor:propTypes.string,
    text: propTypes.string,
    textColor: propTypes.string
};
Button.defaultProps = {
    width: '3rem',
    height: '0.45rem',
    bRadius: '1rem',
    bgColor: '#F9517E',
    text: '确定',
    textColor: '#FFFFFF'
};

export default Button;
