import React, { Component } from 'react';
import ToolTip from 'react-portal-tooltip'
//import ReactTooltip from 'react-tooltip'
//import htmlToText from 'html-to-text';

//var textract = require('textract');
//import sanitizeHtml from 'sanitize-html';
var htmlToText = require('html-to-text');
import Spinword from './Spinword';

class Spintax extends Component {
  state = {
    focusedId: null,
    toks: [],
    selObj: '',
  };

  
  componentDidMount() {
    const { spintax } = this.props;
    //console.log(htmlToText);
    //const text = sanitizeHtml(spintax);
    const text = htmlToText.fromString(spintax, {
      uppercaseHeadings: false,
    });
    const regex = /(['\w]+|{[^{}]*})/g;
    this.setState({ toks: text.match(regex) });
    document.onselectstart = this.onSelectStart.bind(this);
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    document.addEventListener("selectionchange", this.onSelectionChange.bind(this));
  }

  onSelectionChange() {
    console.log('Selection changed.');
    const selObj = window.getSelection();
    this.setState({
      selObj,
    });
    console.log(selObj);
  }

  onSelectStart() {
    console.log('Selection Started');
    this.setState({
      focusedId: null,
    });
  }

  handleLeft() {
    const { focusedId } = this.state;
    if (focusedId === 0) { return; }
    if (focusedId !== null) {
      this.setState({
        focusedId: focusedId - 1
      });
    }
  }

  handleRight() {
    const { focusedId, toks } = this.state;
    if (focusedId === toks.length - 1) { return; }
    if (focusedId !== null) {
      this.setState({
        focusedId: focusedId + 1
      });
    }
  }

  handleKeyDown(e) {
    this.setState({
      selObj: null,
    });
    if(e.key === 'ArrowRight') {
      this.handleRight();
    } else if(e.key === 'ArrowLeft') {
      this.handleLeft();
    }
  }

  render() {
    // const { spintax } = this.props;
    const { focusedId, toks, selObj } = this.state;
    let syns = [];
    const option = toks[focusedId];
    if (option) {
      if (option.startsWith('{') && option.endsWith('}')) {
        const sliced = option.slice(1, -1);
        syns = sliced.split('|');
        syns = syns.map(syn => syn.trim());
      } else {
        syns = [option];
      }
    }
    return (
      <div style={{ width: '500px', height: '500px' }}>
        {toks.map((tok, i) => (
          <span key={i} id={`sw${i}`}>
            <Spinword 
              tooltipSelected={focusedId === i}
              t={tok} 
              onClick={() => this.setState({ focusedId: i })} 
            />
            <ToolTip 
              active={focusedId !== null}
              position="top"
              parent={`#sw${i}`}
            >
              Tooltip: {focusedId}
              <br />
              Options: {syns.toString()}
              <br />
              Selection: {selObj ? selObj.toString() : 'N/A'}
            </ToolTip>
            &nbsp;
          </span>
        ))}
      </div>
    );
  }
}

export default Spintax;
