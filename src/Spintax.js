import React, { Component } from 'react';
var htmlToText = require('html-to-text');
import ToolTip from 'react-portal-tooltip';
import onClickOutside from 'react-onclickoutside';
import { Grid, Row, Col } from 'react-flexbox-grid';
import Spinword from './Spinword';
import { RANDOM_SPINTAX } from './mock';

function isSelectionBackwards() {
    var backwards = false;
    if (window.getSelection) {
        var sel = window.getSelection();
        if (!sel.isCollapsed) {
            var range = document.createRange();
            range.setStart(sel.anchorNode, sel.anchorOffset);
            range.setEnd(sel.focusNode, sel.focusOffset);
            backwards = range.collapsed;
            range.detach();
        }
    }
    return backwards;
}

class Spintax extends Component {
  
  state = {
    focusedId: null,
    toks: [],
    selObj: '',
  }

  componentDidMount() {
    //console.log(htmlToText);
    //const text = sanitizeHtml(spintax);
    let m;
    let arr = [];
    const regex = /(['\w]+|{[^{}]*})/g;
    const text = htmlToText.fromString(RANDOM_SPINTAX, {
      uppercaseHeadings: false,
    });

    while ((m = regex.exec(text)) !== null) {
      // console.log(m.index);
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
          regex.lastIndex++;
      }
      arr.push({
        i: m.index,
        t: m[1],
      });
    }
    this.setState({ toks: arr });
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    this.container.onselectstart = this.onSelectStart.bind(this);
    document.addEventListener("selectionchange", this.onSelectionChange.bind(this));
  }

  onSelectStart() {
    const selObj = window.getSelection();
    this.setState({
      focusedId: null,
    });
  }

  onSelectionChange() {
    const selObj = window.getSelection();
    if(!selObj.isCollapsed && selObj.getRangeAt(0).commonAncestorContainer.nodeName !== '#text' && selObj.getRangeAt(0).commonAncestorContainer.classList.contains('sp')) {
      //if()
      const range = selObj.getRangeAt(0);
      const backwards = selObj.anchorNode.compareDocumentPosition(selObj.focusNode) === 2;
      if(selObj.anchorNode.textContent === ' ') {
        console.log('anchor')
        if(backwards) {
          range.setEndBefore(selObj.anchorNode);
        } else {
          range.setStartAfter(selObj.anchorNode);
        }
      }
      if(selObj.focusNode.textContent === ' ') {
        console.log('focus', backwards)
        if(backwards) {
          range.setStartAfter(selObj.focusNode);
        } else {
          range.setEndBefore(selObj.focusNode);
        }
        //range.setEndBefore(selObj.focusNode);
      }
      //range.setStart(selObj.anchorNode, 0);
      //range.setEnd(selObj.focusNode, selObj.focusNode.textContent.length);
      this.setState({
        selObj,
      });
      //console.log(selObj.anchorNode);
      //console.log('Anchor Offset', selObj.anchorOffset);
      //console.log(selObj.focusNode);
      //console.log('FocusOffset', selObj.focusOffset);
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

  handleClickOutside(e) {
    console.log(e);
  }
  
  render() {
    const { focusedId, toks, selObj } = this.state;
    let syns = [];
    const selectedToken = toks[focusedId];
    if (selectedToken) {
      const option = selectedToken.t;
      if (option.startsWith('{') && option.endsWith('}')) {
        const sliced = option.slice(1, -1);
        syns = sliced.split('|');
      } else {
        syns = [option];
      }
    }
    return (
      <div 
        ref={(el) => this.container = el}
        className="sp" 
        style={{ width: '500px', minHeight: '350px' }}
      >
        {toks.map((tok, i) => (
          <span key={i} id={`sw${i}`}>
            <Spinword 
              tooltipSelected={focusedId === i}
              t={tok} 
              onClick={(e) => {
                // console.log(e.nativeEvent.offsetX)
                this.setState({ focusedId: i })
              }} 
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
            {' '}
          </span>
        ))}
      </div>
    );
  }
}

export default onClickOutside(Spintax);