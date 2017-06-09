import React, { Component } from 'react';
import { connect } from 'react-redux';
import { findDOMNode } from 'react-dom';
import LibTooltip from 'react-portal-tooltip';
import { SkyLightStateless } from 'react-skylight';
import 'pui-css-tooltips';

class Tooltip extends Component {

  state = {
    opacity: true,
  }

  toggle() {
    const node = findDOMNode(this);
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
      left: (left || 0) + 300,
    };
    return (
      <div id="tc" style={{style}}>
          <SkyLightStateless isVisible>
            {children}
          </SkyLightStateless>
      </div>
    );
  }
}

export default Tooltip;
