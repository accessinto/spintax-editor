import React, { Component } from 'react';
import { connect } from 'react-redux';
import find from 'lodash/find';
import findLast from 'lodash/findLast';
import uniq from 'lodash/uniq';
import flatten from 'lodash/flatten';
import ToolTip from 'react-portal-tooltip';
import QTip from './QTip';
import onClickOutside from 'react-onclickoutside';
import Spinword from './Spinword';
import SpinwordHtml from './SpinwordHtml';

import { setFocusId, resetFocusId } from '../actions/EditorActions';

const tagMatch = html => {
  var doc = document.createElement('div');
  doc.innerHTML = html;
  if(doc.innerHTML !== html) {
    console.error(`Tag Mismatch, Original Html is ${html}`);
  }
  return ( doc.innerHTML === html );
};

window.expand2 = str => {
  const res = window.expandH2([str]);
  if(!res) return [str, ''];
  return res;
};

window.expandH2 = arr => {
  if(arr.length > 9) {
    return false;
  }
  const regex = /{[^{}]*}/g;
  let allDone = true;
  const perms = [];
  arr.forEach((s, i) => {
    let m;
    if ((m = regex.exec(s)) !== null) {
      regex.lastIndex = 0;
      allDone = false;
      const candidates = m[0].slice(1, -1).split('|');
      const start = m.index;
      const end = start + m[0].length;
      const pre = s.substring(0, start);
      const suf = s.substring(end);
      perms.push(candidates.map((can) => pre + can + suf));
    }
  });
  if(allDone) {
    return arr;
  } else {
    return window.expandH2(uniq(flatten(perms)));
  }
}

const bracketMatch = spintax => {
  var count = 0;
  for(var i = 0; i < spintax.length; i++) {
    if(spintax[i] === '{') { count++; }
    else if(spintax[i] === '}') { count--; }
    if(count < 0) break;
  }
  if(count > 0) {
    console.error(`Bracket Mismatch, You'll find stuff on ur RIGHT, count is ${count}`);
  } else if(count < 0) {
    console.error(`Bracket Mismatch, You'll find stuff on ur LEFT, count is ${count}`);
  }
  return (count === 0);
};

const findNextSw = (toks, startAt = 0) => {
  return find(toks, ['type', 4], startAt + 1);
};

const findPrevSw = (toks, startsAt = toks.length - 1) => {
  return findLast(toks, ['type', 4], startsAt - 1);
};

class Spintax extends Component {
  
  state = {
    focusedId: null,
    toks: [],
    selObj: '',
    highlightedId: null,
    richTextMode: false,
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    this.container.onselectstart = this.onSelectStart.bind(this);
    this.container.addEventListener('mouseup', this.mouseUp2.bind(this));
  }

  componentWillReceiveProps(nextProps) {
    // console.log('cwr');
  }
  

  mouseUp2(e) {
    const { toks } = this.props;
    const selObj = window.getSelection();
    if(!selObj.isCollapsed && selObj.getRangeAt(0).commonAncestorContainer.nodeName !== '#text' && selObj.getRangeAt(0).commonAncestorContainer.classList.contains('sp')) {
      //debugger;
      const backwards = selObj.anchorNode.compareDocumentPosition(selObj.focusNode) === 2;
      const range = selObj.getRangeAt(0);
      const f = selObj.focusNode;
      const a = selObj.anchorNode;
      if(backwards) {
        range.setStart(f, 0);
        range.setEnd(a, a.textContent.length)
      } else {
        range.setStart(a, 0);
        range.setEnd(f, f.textContent.length);
      }
      const newf = selObj.focusNode;
      const newa = selObj.anchorNode;
      let fd, ad;
      if(newf.dataset) {
        fd = newf.dataset;
      } else {
        fd = newf.parentElement.dataset;
      }
      if(newa.dataset) {
        ad = newa.dataset;
      } else {
        ad = newa.parentElement.dataset;
      }
      const ft = Number(fd.id);
      const at = Number(ad.id);
      const o = [];
      const c = [];
      const selectedToks = toks.slice(at, ft + 1);
      const oTags = selectedToks.filter(t => t.type === 2);
      const cTags = selectedToks.filter(t => t.type === 3);
      const tagExtendedAt = cTags.reduce((min, curr) => Math.min(curr.matchId || curr.id, min), at);
      const tagExtendedFt = oTags.reduce((max, curr) => Math.max(curr.matchId || curr.id, max), ft);
      const oBracks = selectedToks.filter(t => t.type === 5);
      const cBracks = selectedToks.filter(t => t.type === 6);
      const bracksExtendedAt = cBracks.reduce((min, curr) => Math.min(curr.matchId, min), tagExtendedAt);
      const bracksExtendedFt = oBracks.reduce((max, curr) => Math.max(curr.matchId, max), tagExtendedFt);
      const finalA = document.getElementById(`sw${bracksExtendedAt}`);
      const finalF = document.getElementById(`sw${bracksExtendedFt}`);
      range.setStart(finalA, 0);
      range.setEnd(finalF, 1);
      this.setState({
        selObj
      });
      console.log(window.expand2(selObj.toString()));
    }
  }

  onSelectStart() {
    this.setState({
      focusedId: null,
    });
  }

  handleKeyDown(e) {
    if(e.key === 'ArrowRight') {
      this.handleRight();
    } else if(e.key === 'ArrowLeft') {
      this.handleLeft();
    }
  }

  handleLeft() {
    const { focusedId, toks } = this.props;
    if (focusedId === 0) { return; }
    const prevFoc = findPrevSw(toks, focusedId);
    if (focusedId !== null && prevFoc) {
      this.props.setFocusId(prevFoc.id);
      return {
        selObj: null,
      };
    } else return;
  }

  handleRight() {
    const { focusedId, toks } = this.props;
    if (focusedId === toks.length - 1) { return; }
    const nextFoc = findNextSw(toks, focusedId);
    if (focusedId !== null && nextFoc) {
      this.props.setFocusId(nextFoc.id);
      return {
        selObj: null,
      };
    } else return;
  }

  handleSpinwordClick(tok) {
    if(tok.type === 4){
      this.props.setFocusId(tok.id);
      this.setState({
        selObj: null,
      });
    }
  }

  handleClickOutside(e) {
    this.props.resetFocusId();
    this.setState({
      selObj: null,
    })
  }

  onMouseEnter(tok) {
    if(tok.type === 5) {
      this.setState({
        highlightedId: tok.id
      })
    } else if (tok.type === 6 || tok.type === 7) {
      this.setState({
        highlightedId: tok.matchId
      })
    }
  }

  onMouseLeave(tok) {
    if(tok.type === 5 || tok.type === 6 || tok.type === 7) {
      this.setState({
        highlightedId: null
      })
    }
  }

  //syns, goHandler, textBeforeHandler, textAfterHandler, previousHandler, nextHandler
  goHandler(replacement) {
    const { toks } = this.props;
    const { focusedId } = this.state;
    const item = toks[focusedId];
    const replacementItem = Object.assign({}, item, { t: replacement });
    this.props.dispatch({
      type: 'GO',
      payload: {
        replacement: replacementItem,
        index: focusedId,
      }
    });
    console.log(replacement);
  }

  render() {
    const { toks, focusedId } = this.props;
    const { selObj, highlightedId, richTextMode } = this.state;
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
    const plainTextRenderer = (
      toks.map((tok) => (
        <span key={tok.id} id={`sw${tok.id}`}>
          <Spinword 
            tooltipSelected={focusedId === tok.id}
            higlighted={highlightedId === tok.id || highlightedId === tok.matchId}
            t={tok} 
            onMouseOver={this.onMouseEnter.bind(this, tok)}
            onMouseOut={this.onMouseLeave.bind(this, tok)}
            onClick={this.handleSpinwordClick.bind(this, tok)} 
          />
        </span>
      ))
    );

    const richTextRenderer = (
      toks.map((tok) => (
        <span key={tok.id} id={`sw${tok.id}`}>
          <SpinwordHtml 
            tooltipSelected={focusedId === tok.id}
            higlighted={highlightedId === tok.id || highlightedId === tok.matchId}
            t={tok} 
            onMouseOver={this.onMouseEnter.bind(this, tok)}
            onMouseOut={this.onMouseLeave.bind(this, tok)}
            onClick={this.handleSpinwordClick.bind(this, tok)} 
          />
        </span>
      ))
    );
    return (
      <div>
        <button onClick={() => this.setState({ richTextMode: !richTextMode })}>
          { richTextMode ? 'Plain' : 'Rich Text' }
        </button>
      <div 
        ref={(el) => this.container = el}
        id="sp"
        className="sp" 
        style={{ width: '1000px', minHeight: '350px' }}
      >
        { richTextMode ? richTextRenderer : plainTextRenderer }
      </div>
      {focusedId 
      && 
      <QTip 
        prevHandler={this.handleLeft.bind(this)}
        nextHandler={this.handleRight.bind(this)}
        prevDisabled={!findPrevSw(toks, focusedId)}
        nextDisabled={!findNextSw(toks, focusedId)}
      />}
      <ToolTip 
        active={selObj !== null}
        position="bottom"
        parent="#sp"
      >
        Selection: {selObj ? selObj.toString() : 'N/A'}
        <br />
      </ToolTip>
      </div>
    );
  }
}

const mapStateToProps = ({ spintax }) => ({
  toks: spintax.toks,
  focusedId: spintax.focusedId
});

export default connect(mapStateToProps, {
  setFocusId,
  resetFocusId,
})(onClickOutside(Spintax));