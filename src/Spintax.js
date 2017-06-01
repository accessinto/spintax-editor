import React, { Component } from 'react';
import find from 'lodash/find';
import findLast from 'lodash/findLast';
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

const isNotSw = dataset => Number(dataset.type) !== 3;

const findNextSw = (toks, startAt = 0) => {
  return find(toks, ['type', 3], startAt + 1);
};

const findPrevSw = (toks, startsAt = toks.length - 1) => {
  return findLast(toks, ['type', 3], startsAt - 1);
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
    const r = /(['\w]+|{[^{}]*})/g;
    const r2 = /(\s+)|(<\/?.*?>)|([\w\-:']+|{[^{}]*})|([{|}])|([^\w\s])/g;
    const text = htmlToText.fromString(RANDOM_SPINTAX, {
      uppercaseHeadings: false,
    });
    let idGen = 0;

    while ((m = r2.exec(RANDOM_SPINTAX)) !== null) {
      // console.log(m.index);
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === r2.lastIndex) {
          r2.lastIndex++;
      }
      arr.push({
        id: idGen++, 
        start: m.index,
        length: m[0].length,
        end: m.index + m[0].length - 1,
        type: m.indexOf(m[0], 1),
        t: m[0],
      });
    }
    this.setState({ toks: arr });
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    this.container.onselectstart = this.onSelectStart.bind(this);
    this.container.addEventListener('mouseup', this.mouseUp.bind(this));
  }

  mouseUp(e) {
    const { toks } = this.state;
    const selObj = window.getSelection();
    if(!selObj.isCollapsed && selObj.getRangeAt(0).commonAncestorContainer.nodeName !== '#text' && selObj.getRangeAt(0).commonAncestorContainer.classList.contains('sp')) {
      const range = selObj.getRangeAt(0);
      const f = selObj.focusNode;
      const fo = selObj.focusOffset;
      const fd = f.parentElement.dataset;
      const ft = Number(fd.id);
      const a = selObj.anchorNode;
      const ao = selObj.anchorOffset;
      const ad = a.parentElement.dataset;
      const at = Number(ad.id);
      const backwards = selObj.anchorNode.compareDocumentPosition(selObj.focusNode) === 2;
      // debugger;
      if(isNotSw(ad) && isNotSw(fd)) {
        if (backwards) {
          //debugger
          const newstart = findNextSw(toks, ft);
          const newend = findPrevSw(toks, at);
          const newStartNode = document.getElementById(`sw${newstart.id}`);
          const newEndNode = document.getElementById(`sw${newend.id}`);
          range.setStart(newStartNode, 0);
          range.setEnd(newEndNode, 1);
        } else {
          const newstart = findNextSw(toks, at);
          const newend = findPrevSw(toks, ft);
          const newStartNode = document.getElementById(`sw${newstart.id}`);
          const newEndNode = document.getElementById(`sw${newend.id}`);
          range.setStart(newStartNode, 0);
          range.setEnd(newEndNode, 1);
        }
      } else if(isNotSw(ad)) {
        console.log('ad not sw');
        if (backwards) {
          const newend = findPrevSw(toks, at);
          const newEndNode = document.getElementById(`sw${newend.id}`);
          range.setStart(f, 0);
          range.setEnd(newEndNode, 1);
        } else {
          const newstart = findNextSw(toks, at);
          const newStartNode = document.getElementById(`sw${newstart.id}`);
          range.setStart(newStartNode, 0);
          range.setEnd(f, f.textContent.length);
        }
      } else if(isNotSw(fd)) {
        if (backwards) {
          const newstart = findNextSw(toks, fd);
          const newStartNode = document.getElementById(`sw${newstart.id}`);
          range.setStart(newStartNode, 0);
          range.setEnd(a, a.textContent.length);
        } else {
          const newend = findPrevSw(toks, at);
          const newEndNode = document.getElementById(`sw${newend.id}`);
          range.setStart(a, 0)
          range.setEnd(newEndNode, 1);
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
    const { toks, focusedId } = this.state;
    if (focusedId === 0) { return; }
    const prevFoc = findPrevSw(toks, focusedId);
    if (focusedId !== null && prevFoc) {
      this.setState({
        focusedId: prevFoc.id,
        selObj: null,
      });
    }
  }

  handleRight() {
    const { focusedId, toks } = this.state;
    if (focusedId === toks.length - 1) { return; }
    const nextFoc = findNextSw(toks, focusedId);
    if (focusedId !== null && nextFoc) {
      this.setState({
        focusedId: nextFoc.id,
        selObj: null,
      });
    }
  }

  handleSpinwordClick(tok) {
    if(tok.type === 3){
      this.setState({
        focusedId: tok.id,
        selObj: null,
      });
    }
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
        {toks.map((tok) => (
          <span key={tok.id} id={`sw${tok.id}`}>
            <Spinword 
              tooltipSelected={focusedId === tok.id}
              t={tok} 
              onClick={this.handleSpinwordClick.bind(this, tok)} 
            />
            <ToolTip 
              active={focusedId !== null}
              position="top"
              parent={`#sw${tok.id}`}
            >
              Tooltip: {focusedId}
              <br />
              Options: {syns.toString()}
              <br />
              Selection: {selObj ? selObj.toString() : 'N/A'}
            </ToolTip>
            
          </span>
        ))}
      </div>
      <h2>{selObj ? selObj.toString() : 'NONE'}</h2>
      </div>
    );
  }
}

export default onClickOutside(Spintax);