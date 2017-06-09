import React, { Component } from 'react';
import { connect } from 'react-redux';
import onClickOutside from 'react-onclickoutside';

import { rewriteSyns } from '../actions/SynsActions';
import { resetSelection } from '../actions/EditorActions';

class RewriteTooltip extends Component {

  handleClickOutside(e) {
    this.props.resetSelection();
  }

  handleRewrite() {
    const { selectionText } = this.props;
    console.log('GO ON');
    this.props.rewriteSyns(window.expand2(selectionText));
    //console.log(window.expand2(selectionText));
  }

  render () {
    const { selectionText } = this.props;
    return (
      <div className="tooltip-content" style={{ background: 'black', color: 'green' }}>
        {selectionText}
        <button 
          onClick={this.handleRewrite.bind(this)}
        >
          Rewrite
        </button>
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
