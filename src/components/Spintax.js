import React, { Component } from 'react';

class Spintax extends Component {

  componentDidMount() {
    const { handleMouseUp } = this.props;
    this.container.addEventListener('mouseup', handleMouseUp);
  }

  render() {
    const { richTextMode, plainTextRenderer, richTextRenderer } = this.props;
    return (
      <div 
          ref={(el) => this.container = el}
          id="sp"
          className="sp" 
          style={{ width: '1000px', minHeight: '350px' }}
        >
          { richTextMode ? richTextRenderer : plainTextRenderer }
        </div>
    );
  }
}

export default Spintax;