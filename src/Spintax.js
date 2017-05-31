import React, { Component } from 'react';
var htmlToText = require('html-to-text');
import ToolTip from 'react-portal-tooltip';
import onClickOutside from 'react-onclickoutside';
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
    this.container.addEventListener('mouseup', this.mouseUp.bind(this));
  }

  mouseUp(e) {
    const selObj = window.getSelection();
    if(!selObj.isCollapsed && selObj.getRangeAt(0).commonAncestorContainer.nodeName !== '#text' && selObj.getRangeAt(0).commonAncestorContainer.classList.contains('sp')) {
      const range = selObj.getRangeAt(0);
      const f = selObj.focusNode;
      const fo = selObj.focusOffset;
      const a = selObj.anchorNode;
      const ao = selObj.anchorOffset;
      const backwards = selObj.anchorNode.compareDocumentPosition(selObj.focusNode) === 2;
      if(a.textContent === ' ' && f.textContent === ' ') {
        if (backwards) {
          range.setStartAfter(f);
          range.setEndBefore(a);
        } else {
          range.setStartAfter(a);
          range.setEndBefore(f);
        }
      } else if(a.textContent === ' ') {
        if (backwards) {
          range.setStart(f, 0);
          range.setEndBefore(a);
        } else {
          range.setStartAfter(a);
          range.setEnd(f, f.textContent.length);
        }
      } else if(f.textContent === ' ') {
        if (backwards) {
          range.setStartAfter(f);
          range.setEnd(a, a.textContent.length);
        } else {
          range.setStart(a, 0)
          range.setEndBefore(f);
        }
      } else {
        if(backwards) {
          range.setStart(f, 0);
          range.setEnd(a, a.textContent.length);
        } else {
          range.setStart(a, 0);
          range.setEnd(f, f.textContent.length);
        }
      }
      this.setState({
        selObj,
      });
    }
  }

  onSelectStart() {
    this.setState({
      focusedId: null,
    });
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
        focusedId: focusedId - 1,
        selObj: null,
      });
    }
  }

  handleRight() {
    const { focusedId, toks } = this.state;
    if (focusedId === toks.length - 1) { return; }
    if (focusedId !== null) {
      this.setState({
        focusedId: focusedId + 1,
        selObj: null,
      });
    }
  }

  handleSpinwordClick(i) {
    this.setState({
      focusedId: i,
      selObj: null,
    })
  }

  handleClickOutside(e) {
    this.setState({
      focusedId: null,
      selObj: null,
    })
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
      <div>
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
              onClick={this.handleSpinwordClick.bind(this, i)} 
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
            <span>{' '}</span>
          </span>
        ))}
      </div>
      <h2>{selObj ? selObj.toString() : 'NONE'}</h2>
      </div>
    );
  }
}

export default onClickOutside(Spintax);