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
  }
  
  setFocus(id) {
    this.props.setFocusId(id);
  }

  mouseUp2(e) {
    console.log('mouse up')
    const { toks } = this.props;
    const selObj = window.getSelection();
    let infd = selObj.focusNode.dataset;
    let inad = selObj.anchorNode.dataset;
    if(infd && inad && infd.id === inad.id) {
      //TRICKY CASE FOR IFRAMES
      this.setFocus(Number(infd.id));
      return;
    }
    infd = selObj.focusNode.parentElement.dataset;
    inad = selObj.anchorNode.parentElement.dataset;
    console.log('NON IFRAME', {f: selObj.focusNode.parentElement.dataset, a: selObj.anchorNode.parentElement.dataset});
    if(infd && inad && infd.id === inad.id) {
      this.setFocus(Number(infd.id));
      return;
    }
    if(!selObj.isCollapsed && selObj.getRangeAt(0).commonAncestorContainer.nodeName !== '#text' && selObj.getRangeAt(0).commonAncestorContainer.classList.contains('sp')) {
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
        const ft = Number(fd.id);
        const at = Number(ad.id);
        const selectedToks = toks.slice(at, ft + 1);
        const oTags = selectedToks.filter(t => t.type === 2);
        const cTags = selectedToks.filter(t => t.type === 3);
        const tagExtendedAt = cTags.reduce((min, curr) => Math.min(curr.matchId || curr.id, min), at);
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
  }

  mouseUpOutside() {
    console.log('MOUSEUP OUTSIDE');
    window.getSelection().removeAllRanges();
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
    const { toks } = this.props;
    const { interactive } = this.state;
    this.setState({
      interactive: !interactive
    });
    if(interactive) {
      this.props.setEditorState(toks.map(t => t.t).join(''));
    }
  }

  render() {
    const { 
      toks, 
      focusedId, 
      selection, 
      richTextMode, 
      showUnspun,
      editorState, 
    } = this.props;
    const { highlightedId, interactive } = this.state;
    const plainTextRenderer = (
      toks.map((tok) => (
        <span key={tok.id} id={`sw${tok.id}`}>
          <Spinword 
            unspun={ showUnspun && tok.unspun }
            focused={focusedId === tok.id}
            bracketHighlighted={highlightedId && (tok.id === highlightedId || tok.id === toks[highlightedId].matchId)}
            selected={selection.start && selection.end && inRange(tok.id, selection.start, selection.end + 1)}
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
            bracketHighlighted={highlightedId && (tok.id === highlightedId || tok.id === toks[highlightedId].matchId)}
            selected={selection.start && selection.end && inRange(tok.id, selection.start, selection.end + 1)}
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
        <button onClick={this.props.toggleRichTextMode}>
          { richTextMode ? 'Plain' : 'Rich Text' }
        </button>
        <button onClick={this.props.toggleShowUnspun}>
          { showUnspun ? 'Hide Unspun' : 'Show Unspun' }
        </button>
        <button onClick={this.handleEditModeChange.bind(this)}>
          {editorState ? 'Interactive' : 'Summernote'}
        </button>
        { !interactive && <Summernote /> }
        { 
          interactive 
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
})(Widget);