import React, { Component } from 'react';

var cumulativeOffset = function(element) {
  var top = 0, left = 0;
  do {
    top += element.offsetTop  || 0;
    left += element.offsetLeft || 0;
    element = element.offsetParent;
  } while(element);

  return {
    left: left,
    top: top
  };
};

	var absoluteTopRightPosition = function (elem) {
		let topLeftPos = cumulativeOffset(elem);
		let rectObj = elem.getBoundingClientRect();
		return [rectObj.right, topLeftPos.top];
	};

class Tooltip extends Component {

  state = {
    opacity: true,
  }

  componentDidMount () {
    const node = document.getElementById(`sw${this.props.fid}`);
    const [left, top] = absoluteTopRightPosition(node);
    node.scrollIntoView({block: 'end', behavior: 'smooth'});
    this.setState({
      left,
      top, 
    })
  }

  render() {
    const { children } = this.props;
    const { opacity, top, left } = this.state;
    const style = {
      background: 'lavender',
      color: 'black',
      position: 'absolute',
      zIndex: opacity ? 1000 : -1000,
      opacity: +opacity,
      top: (top || 0),
      left: (left || 0),
    };
    return (
      <div 
        id="tc" 
        style={style}
      >
        <div 
          ref={el => { this.tt = el }}
          style={{ position: 'static' }}
          className="qtip qtip-default syns-tooltip qtip-bootstrap qtip-shadow qtip-rounded qtip-pos-tl qtip-focus"
        >
          <div className="qtip-content">
            {children}
          </div>
        </div>
      </div>
    );
  }
}

export default Tooltip;
