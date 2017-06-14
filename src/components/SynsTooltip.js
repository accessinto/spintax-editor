import React, { Component } from 'react';
import { connect } from 'react-redux';
import onClickOutside from 'react-onclickoutside';
import ToolTip from 'react-portal-tooltip';

import { 
  addSyn, 
  toggleSyn,
  addSynBefore,
  addSynAfter, 
} from '../actions/SynsActions';

import { resetFocusId } from '../actions/EditorActions';

const replacementTextWithNewInput = (syns, input) => {
  let replacement;
  const replacementArray = syns
    .filter((syn) => syn.selected)
    .map((syn) => syn.content)
    .concat(input);
  if(replacementArray.length <= 1) {
    replacement = `{${replacementArray.join()}}`;
  } else {
    replacement = `{${replacementArray.join('|')}}`;
  }
  return replacement;
};

const replacementText = syns => {
  let replacement;
  const replacementArray = syns
    .filter((syn) => syn.selected)
    .map((syn) => syn.content);
  if(replacementArray.length <= 1) {
    replacement = `${replacementArray.join()}`;
  } else {
    replacement = `{${replacementArray.join('|')}}`;
  }
  return replacement;
}

class SynsTooltip extends Component {

  constructor(props) {
    super(props);
    this.state = {
      newInput: '',
      appendStatus: 'spintax',
      currSyns: props.syns,
    }
  }

  componentDidMount () {
    this.synInput.focus();
    //document.keydown = this.handleKeyDown.bind(this)
    //window.addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      currSyns: nextProps.syns,
    });
  }

  componentWillUnmount() {
     //document.keydown = null
    //window.removeEventListener("keydown", this.handleKeyDown.bind(this));
  }

  handleClickOutside(e) {
    console.log('syns outside');
    this.props.resetFocusId();
  }
  
  
  handleKeyDown(e) {
    const key = e.key;
    if(key === 'Enter') {
      this.handleGo();
    }
  }

  handleBeforeClick(e) {
    e.preventDefault();
    this.setState((prevState, props) => ({
      appendStatus: 'before'
    }));
  }
  
  handleBackClick(e) {
    e.preventDefault();
    this.setState((prevState, props) => ({
      appendStatus: 'spintax'
    }));
  }

  handleAfterClick(e) {
    e.preventDefault();
    this.setState((prevState, props) => ({
      appendStatus: 'after'
    }));
  }

  handleSynClick(i) {
    const { focusedId } = this.props;
    this.props.toggleSyn(focusedId, i)
    this.setState({
      newInput: ''
    });
  }

  handleGo(clear = true) {
    const { focusedId } = this.props;
    const { newInput, appendStatus } = this.state;
    console.log('HANDLEGO with appendStatus', appendStatus);
    if(newInput.trim().length > 0) {
      if(appendStatus === 'spintax') {
        this.props.addSyn(focusedId, newInput);
      } else if(appendStatus === 'before') {
        this.props.addSynBefore(focusedId, newInput);
      } else if(appendStatus === 'after') {
        this.props.addSynAfter(focusedId, newInput);
      }
    }
    if(clear) {
      this.setState({ newInput: '', appendStatus: 'spintax' });
    }
  }

  render () {
    const { 
      syns, 
      goHandler, 
      textBeforeHandler, 
      textAfterHandler, 
      prevHandler, 
      nextHandler, 
      prevDisabled,
      nextDisabled,
    } = this.props;
    const { appendStatus, newInput } = this.state;
    const synsRenderer = (
      <ul className="syns-list">
        {syns.map((syn, i) => (
          <li 
            key={i} 
            className={syn.selected ? 'selected' : 'unselected'}
            onClick={this.handleSynClick.bind(this, i)}
          >
            {syn.content}
          </li>
        ))}
      </ul>
    );
    return (
      <div className="tooltipWrapper">
        <div className="input-tab">
          <div className="input-group sp-form">
            <input 
              className="form-control new-syn edit-sp"
              type="text"
              name="newSyn" 
              ref={ el => this.synInput = el }
              value={newInput}
              onKeyDown={this.handleKeyDown.bind(this)}
              onChange={(e) => this.setState({ newInput: e.target.value })}
            />
            <span className="input-group-btn">
              <button 
                className="btn btn-default new-syn-submit"
                onClick={this.handleGo.bind(this)}
              >GO</button>
            </span>
          </div>
        </div>
        <div className="list-tab">
          {appendStatus === 'spintax' && synsRenderer}
        </div>
        <div className="append-tab">
          {
            appendStatus !== 'before' 
            && 
            <a 
              href="#"
              style={{ display: 'inline' }}
              className="append text-before"
              onClick={this.handleBeforeClick.bind(this)}
            >
              Text Before
            </a>
          }
          {
            appendStatus !== 'spintax' 
            && 
            <a 
              href="#"
              style={{ color: 'deepskyblue' }}
              className="back-to-spintax"
              onClick={this.handleBackClick.bind(this)}
            >
              Back
            </a>
          }
          {
            appendStatus !== 'after' 
            && 
            <a 
              href='#'
              style={{ display: 'inline' }}
              className="append text-after"
              onClick={this.handleAfterClick.bind(this)}
            >
              Text After
            </a>}
        </div>
        <br />
        <div className="navigate-tab">
          <span
            className="prev-tooltip"
            onClick={prevHandler}
            disabled={prevDisabled}
          >
            Previous
          </span>
          <span
            className="next-tooltip"
            onClick={nextHandler}
            disabled={nextDisabled}
          >
            Next
          </span>
        </div>
      </div>
    )
  }
}

const mapStateToProps = ({ spintax }) => ({
  syns: spintax.toks[spintax.focusedId].syns,
  focusedId: spintax.focusedId
});

export default connect(mapStateToProps, {
  addSyn,
  toggleSyn,
  addSynBefore,
  addSynAfter,
  resetFocusId, 
})(onClickOutside(SynsTooltip));
