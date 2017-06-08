import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import 'pui-css-tooltips';

class Tooltip extends Component {

  state = {
    opacity: true,
  }

  toggle() {
    const node = findDOMNode(this);
    console.log(node);
    this.setState((prevState, props) => ({
      opacity: !prevState.opacity,
      top: node.offsetTop,
      left: node.offsetLeft,
    }));
  }

  render() {
    const { children } = this.props;
    const { opacity, top, left } = this.state;
    const style = {
      zIndex: opacity ? 1000 : -1000,
      opacity: +opacity,
      top: (top || 0) + 20,
      left: (left || 0) + 30,
    };
    return (
      <div style={{style}}>
        {children}
      </div>
    );
  }
}

export default Tooltip;