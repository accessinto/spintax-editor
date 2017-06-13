import React, { Component } from 'react';
import onClickOutside from 'react-onclickoutside';

class Spintax extends Component {

  componentDidMount() {
    const { handleMouseUp } = this.props;
    this.container.addEventListener('mouseup', handleMouseUp);
  }
  
  handleClickOutside(e) {
    this.props.handleMouseUpOutside();
  }

  render() {
    const { richTextMode, plainTextRenderer, richTextRenderer } = this.props;
    return (
      <div 
          ref={(el) => this.container = el}
          id="spintax_container"
          className="row wai-widget" 
        >
          { richTextMode ? richTextRenderer : plainTextRenderer }
        </div>
    );
  }
}

export default onClickOutside(Spintax);