import React, { Component } from 'react';
import { connect, dispatch } from 'react-redux';
import find from 'lodash/find';
import findLast from 'lodash/findLast';
import uniq from 'lodash/uniq';
import flatten from 'lodash/flatten';
import inRange from 'lodash/inRange';

// import ToolTip from 'react-portal-tooltip';
import SynsTooltip from './SynsTooltip';
import RewriteTooltip from './RewriteTooltip';
import Spintax from './Spintax';
import Spinword from './Spinword';
import SpinwordHtml from './SpinwordHtml';
import ToolTip from './Tooltip';
import Summernote from './Summernote';

import { toggleSyn } from '../actions/SynsActions';
import { 
  setFocusId, 
  resetFocusId, 
  setSelectionRange,
  toggleRichTextMode, 
  toggleShowUnspun, 
  setEditorState,
  reloadEditor,  
  setSummernoteMode, 
  unsetSummernoteMode, 
} from '../actions/EditorActions';

const tagMatch = html => {
  var doc = document.createElement('div');
  doc.innerHTML = html;
  if(doc.innerHTML !== html) {
    console.error(`Tag Mismatch, Original Html is ${html}`);
  }
  return ( doc.innerHTML === html );
};

window.sp = dispatch;
//window.dp = () => dispatch(toggleRichTextMode());

window.expand2 = str => {
  const res = window.expandH2([str]);
  if(!res) return [str];
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

class Widget extends Component {
  
  state = {
    selObj: '',
    highlightedId: null,
    richTextMode: false,
    interactive: true,
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    //document.addEventListener("mouseup", this.mouseUp2.bind(this));
  }
  
  setFocus(id) {
    this.props.setFocusId(id);
  }

  mouseUp2(e) {
    console.log('mouse up')
    const { toks, focusedId } = this.props;
    const selObj = window.getSelection();
    console.log(selObj.focusNode);
    let infd = selObj.focusNode.dataset;
    let inad = selObj.anchorNode.dataset;
    console.log(selObj.getRangeAt(0).commonAncestorContainer.classList);
    if(infd && inad && infd.id && infd.id === inad.id) {
      //TRICKY CASE FOR IFRAMES
      const selectedTok = toks[Number(infd.id)];
      if(selectedTok.type === 4) {
        this.setFocus(selectedTok.id);
      }
      return;
    }
    infd = selObj.focusNode.parentElement.dataset;
    inad = selObj.anchorNode.parentElement.dataset;
    console.log('NON IFRAME', {f: selObj.focusNode.parentElement.dataset, a: selObj.anchorNode.parentElement.dataset});
    if(infd && inad && infd.id && infd.id === inad.id) {
      const selectedTok = toks[Number(infd.id)];
      if(selectedTok.type === 4) {
        this.setFocus(selectedTok.id);
      }
      return;
    }
    if(!selObj.isCollapsed && selObj.getRangeAt(0).commonAncestorContainer.nodeName !== '#text' && selObj.getRangeAt(0).commonAncestorContainer.classList.contains('wai-widget')) {
      console.log('INSIDE MY MAIN BLOCK');
      try {
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
        const ft = Number(fd.id) || toks.length - 1;
        const at = Number(ad.id) || 0;
        const selectedToks = toks.slice(at, ft + 1);
        const oTags = selectedToks.filter(t => t.type === 2);
        const cTags = selectedToks.filter(t => t.type === 3);
        const tagExtendedAt = cTags.reduce((min, curr) => (Math.min((curr.matchId + 1) || curr.id, min + 1) - 1), at);
        const tagExtendedFt = oTags.reduce((max, curr) => Math.max(curr.matchId || curr.id, max), ft);
        const oBracks = selectedToks.filter(t => t.type === 5);
        const cBracks = selectedToks.filter(t => t.type === 6);
        const pipes = selectedToks.filter(t => t.type === 7);
        const pAt = pipes.reduce((min, curr) => Math.min(curr.matchId, min), tagExtendedAt);
        const pFt = pipes.reduce((max, curr) => Math.max(toks[curr.matchId].matchId, max), tagExtendedFt);
        const startTokId = cBracks.reduce((min, curr) => Math.min(curr.matchId, min), pAt);
        const endTokId = oBracks.reduce((max, curr) => Math.max(curr.matchId, max), pFt);
        const finalA = document.getElementById(`sw${startTokId}`);
        const finalF = document.getElementById(`sw${endTokId}`);
        range.setStart(finalA, 0);
        range.setEnd(finalF, 1);
        this.props.setSelectionRange(startTokId, endTokId);
        // selObj.removeAllRanges();
      } catch(e) {
        console.log('Error caught in mouseUp2: ', e);
      }
    }
  }

  mouseUpOutside() {
    const { toks } = this.props;
    console.log('MOUSEUP OUTSIDE');
    const selObj = window.getSelection();
    console.log(selObj.toString());
    console.log('Anchor', selObj.anchorNode);
    console.log('Focus', selObj.focusNode);
    if(selObj.isCollapsed) {
      console.log('Collapsed');
      return;
    }
    let infd = selObj.focusNode.dataset;
    let inad = selObj.anchorNode.dataset;
    console.log(selObj.getRangeAt(0).commonAncestorContainer.classList);
    if(infd && inad && infd.id && infd.id === inad.id) {
      //TRICKY CASE FOR IFRAMES
      const selectedTok = toks[Number(infd.id)];
      if(selectedTok.type === 4) {
        this.setFocus(selectedTok.id);
      }
      return;
    }
    infd = selObj.focusNode.parentElement.dataset;
    inad = selObj.anchorNode.parentElement.dataset;
    console.log('NON IFRAME', {f: selObj.focusNode.parentElement.dataset, a: selObj.anchorNode.parentElement.dataset});
    if(infd && inad && infd.id && infd.id === inad.id) {
      const selectedTok = toks[Number(infd.id)];
      if(selectedTok.type === 4) {
        this.setFocus(selectedTok.id);
      }
      return;
    }

    try {
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
      const ft = Number(fd.id) || toks.length - 1;
      const at = Number(ad.id) || 0;
      const selectedToks = toks.slice(at, ft + 1);
      const oTags = selectedToks.filter(t => t.type === 2);
      const cTags = selectedToks.filter(t => t.type === 3);
      const tagExtendedAt = cTags.reduce((min, curr) => (Math.min((curr.matchId + 1) || curr.id, min + 1) - 1), at);
      const tagExtendedFt = oTags.reduce((max, curr) => Math.max(curr.matchId || curr.id, max), ft);
      const oBracks = selectedToks.filter(t => t.type === 5);
      const cBracks = selectedToks.filter(t => t.type === 6);
      const pipes = selectedToks.filter(t => t.type === 7);
      const pAt = pipes.reduce((min, curr) => Math.min(curr.matchId, min), tagExtendedAt);
      const pFt = pipes.reduce((max, curr) => Math.max(toks[curr.matchId].matchId, max), tagExtendedFt);
      const startTokId = cBracks.reduce((min, curr) => Math.min(curr.matchId, min), pAt);
      const endTokId = oBracks.reduce((max, curr) => Math.max(curr.matchId, max), pFt);
      //const finalA = document.getElementById(`sw${startTokId}`);
      //const finalF = document.getElementById(`sw${endTokId}`);
      //range.setStart(finalA, 0);
      //range.setEnd(finalF, 1);
      this.props.setSelectionRange(startTokId, endTokId);
      selObj.removeAllRanges();
    } catch(e) {
      console.log('Error caught in mouseUp2: ', e);
    }
    
  }

  handleKeyDown(e) {
    const { toks, focusedId } = this.props;
    if(e.altKey) {
      if(e.key === 'ArrowRight') {
        e.preventDefault();
        e.stopPropagation();
        this.handleRight(e);
      } else if(e.key === 'ArrowLeft') {
        e.preventDefault();
        e.stopPropagation();
        this.handleLeft(e);
      } else if(Number(e.key)) {
        const num = Number(e.key);
        e.preventDefault();
        e.stopPropagation();
        if(num >= 1 && num <= toks[focusedId].syns.length) {
          this.props.toggleSyn(focusedId, num - 1);
        }
      }
    }
  }

  handleLeft(e) {
    e.preventDefault();
    const { focusedId, toks } = this.props;
    if (focusedId === 0) { return; }
    const prevFoc = findPrevSw(toks, focusedId);
    if (focusedId !== null && prevFoc) {
      this.props.setFocusId(prevFoc.id);
    } else return;
  }

  handleRight(e) {
    e.preventDefault();
    const { focusedId, toks } = this.props;
    if (focusedId === toks.length - 1) { return; }
    const nextFoc = findNextSw(toks, focusedId);
    if (focusedId !== null && nextFoc) {
      this.props.setFocusId(nextFoc.id);
    } else return;
  }

  handleSpinwordClick(tok) {
    if(tok.type === 4){
      console.log('Deferred to selection code');
      //this.props.setFocusId(tok.id);
    }
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
  }

  handleEditModeChange() {
    //const { toks, summernoteMode } = this.props;
    window.lastButton = null;
    this.props.setSummernoteMode();
  }

  updateSummernoteClick() {
    if(!this.props.richTextMode) {
      window.lastButton = 'Update'
      this.props.unsetSummernoteMode();
    } else {
      this.props.reloadEditor(this.props.editorState);
    }
  }

  resetSummernoteClick() {
    //window.lastButton = 'Reset'
    this.props.unsetSummernoteMode();
    this.props.setEditorState(this.props.initEditorState);
    setTimeout(this.props.setSummernoteMode, 0);
    //this.props.setSummernoteMode();
  }

  cancelSummernoteClick() {
    window.lastButton = 'Cancel';
    this.props.unsetSummernoteMode();
  }

  render() {
    const { 
      toks, 
      focusedId, 
      selection, 
      richTextMode, 
      showUnspun,
      editorState, 
      summernoteMode, 
    } = this.props;
    const { highlightedId, interactive } = this.state;
    const plainTextRenderer = (
      toks.map((tok) => (
        <span key={tok.id} id={`sw${tok.id}`}>
          <Spinword 
            unspun={ showUnspun && tok.unspun }
            focused={focusedId === tok.id}
            bracketHighlighted={highlightedId && (tok.id === highlightedId || tok.matchId === highlightedId || tok.matchId === toks[highlightedId].matchId)}
            selected={(selection.start || selection.start === 0) && selection.end && inRange(tok.id, selection.start, selection.end + 1)}
            t={tok} 
            onMouseOver={this.onMouseEnter.bind(this, tok)}
            onMouseOut={this.onMouseLeave.bind(this, tok)}
            onClick={this.handleSpinwordClick.bind(this, tok)} 
          />
          {focusedId === tok.id
            && 
            <ToolTip
              fid={tok.id}
            >
              <SynsTooltip 
                prevHandler={this.handleLeft.bind(this)}
                nextHandler={this.handleRight.bind(this)}
                prevDisabled={!findPrevSw(toks, focusedId)}
                nextDisabled={!findNextSw(toks, focusedId)}
              />
            </ToolTip>}
          {
            !focusedId && selection.end === tok.id
            &&
            <ToolTip fid={tok.id}>
              <RewriteTooltip />
            </ToolTip>
          }
        </span>
      ))
    );

    const richTextRenderer = (
      toks.map((tok) => (
        <span key={tok.id} id={`sw${tok.id}`}>
          <SpinwordHtml 
            unspun={ showUnspun && tok.unspun }
            focused={focusedId === tok.id}
            bracketHighlighted={highlightedId && (tok.id === highlightedId || tok.matchId === highlightedId || tok.matchId === toks[highlightedId].matchId)}
            selected={(selection.start || selection.start === 0) && selection.end && inRange(tok.id, selection.start, selection.end + 1)}
            t={tok} 
            onMouseOver={this.onMouseEnter.bind(this, tok)}
            onMouseOut={this.onMouseLeave.bind(this, tok)}
            onClick={this.handleSpinwordClick.bind(this, tok)} 
          />
          {focusedId === tok.id
          && 
          <ToolTip fid={tok.id}>
            <SynsTooltip 
              prevHandler={this.handleLeft.bind(this)}
              nextHandler={this.handleRight.bind(this)}
              prevDisabled={!findPrevSw(toks, focusedId)}
              nextDisabled={!findNextSw(toks, focusedId)}
            />
          </ToolTip>}
          {
            !focusedId && selection.end === tok.id
            &&
            <ToolTip fid={tok.id}>
              <RewriteTooltip />
            </ToolTip>
          }
        </span>
      ))
    );
    return (
      <div>
        <div className="container-fluid">
          { summernoteMode && <Summernote /> }
          { 
            !summernoteMode 
            && 
            <Spintax 
              eventTypes="mouseup" 
              handleMouseUp={this.mouseUp2.bind(this)}
              handleMouseUpOutside={this.mouseUpOutside.bind(this)} 
              richTextMode={richTextMode} 
              richTextRenderer={richTextRenderer} 
              plainTextRenderer={plainTextRenderer} 
            />
          }
        </div>
        {
          summernoteMode 
          &&
          <div>
            <button className="btn btn-info" onClick={this.updateSummernoteClick.bind(this)}>Update</button>
            <button className="btn btn-warning" onClick={this.cancelSummernoteClick.bind(this)}>Cancel</button>
            <button className="btn btn-danger" onClick={this.resetSummernoteClick.bind(this)}>Reset</button>
          </div>
        }
      </div>
    );
  }
}

const mapStateToProps = ({ spintax }) => ({
  toks: spintax.toks,
  focusedId: spintax.focusedId,
  selection: spintax.selection,
  richTextMode: spintax.richTextMode,
  showUnspun: spintax.showUnspun, 
  editorState: spintax.editorState, 
  initEditorState: spintax.initEditorState,
  summernoteMode: spintax.summernoteMode,
});

export default connect(mapStateToProps, {
  toggleSyn, 
  setFocusId, 
  resetFocusId, 
  setSelectionRange, 
  toggleRichTextMode,
  toggleShowUnspun, 
  setEditorState, 
  reloadEditor, 
  setSummernoteMode, 
  unsetSummernoteMode, 
})(Widget);