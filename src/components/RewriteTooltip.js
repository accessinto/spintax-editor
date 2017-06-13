import React, { Component } from 'react';
import { connect } from 'react-redux';
import onClickOutside from 'react-onclickoutside';
import { rewriteSyns } from '../actions/SynsActions';
import { resetSelection } from '../actions/EditorActions';

class RewriteTooltip extends Component {

  state = {
    hovered: false
  }

  handleClickOutside(e) {
    this.props.resetSelection();
  }

  handleRewrite() {
    const { selectionText } = this.props;
    this.props.rewriteSyns(window.expand2(selectionText));
    //console.log(window.expand2(selectionText));
  }

  handleMouseOver() {

  }

  handleMouseOut() {

  }

  render () {
    const { selectionText } = this.props;
    return (
      <div className="sentenceContainer" style={{background: 'black', color: 'yellow'}}>
        <button 
          onClick={this.handleRewrite.bind(this)}
          type="button" 
          className="rewrite btn btn-link"
        >
          Rewrite Sentence
        </button>
        <p className="rewriteSentence">
          {selectionText}
        </p> 
      </div>
    )
  }
}

const mapStateToProps = ({ spintax }) => {
  const { toks, selection } = spintax;
  const selectedToks = toks.filter((tok) => tok.id >= selection.start && tok.id <= selection.end);
  const selectionText = selectedToks.reduce((acc, tok) => { return acc + tok.t }, '');
  return {
    selectedToks,
    selectionText
  }
};

export default connect(mapStateToProps, { 
  resetSelection,
  rewriteSyns, 
 })(onClickOutside(RewriteTooltip));
