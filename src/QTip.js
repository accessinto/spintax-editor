import React, { Component } from 'react';
import { connect } from 'react-redux';
import ToolTip from 'react-portal-tooltip';

import { 
  addSyn, 
  toggleSyn,
  addSynBefore,
  addSynAfter, 
} from '../actions/SynsActions';

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

class QTip extends Component {

  constructor(props) {
    super(props);
    this.state = {
      newInput: '',
      appendStatus: 'spintax',
      currSyns: props.syns,
    }
  }

  componentDidMount () {
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      currSyns: nextProps.syns,
    })
  }
  
  handleKeyDown(e) {
    const { currSyns } = this.state;
    const key = Number(e.key) || 0;
    if(key > 0 && key <= currSyns.length) {
      this.handleSynClick(key - 1);
    }
  }

  handleBeforeClick() {
    this.setState((prevState, props) => ({
      appendStatus: 'before'
    }));
  }
  
  handleBackClick() {
    this.setState((prevState, props) => ({
      appendStatus: 'spintax'
    }));
  }

  handleAfterClick() {
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

  handleGo() {
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
    this.setState({ newInput: '', appendStatus: 'spintax' });
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
      <ul>
        {syns.map((syn, i) => (
          <li 
            key={i} 
            className={syn.selected ? 'selected' : 'unselected'}
            onClick={this.handleSynClick.bind(this, i)}
          >
            {syn.selected ? 'Sel: ' : 'UnSel: '}
            {syn.content}
          </li>
        ))}
      </ul>
    );
    return (
      <div style={{
        background: 'black',
        color: 'white',
      }}>
        <input 
          name='newSyn' 
          value={newInput}
          onChange={(e) => this.setState({ newInput: e.target.value })}
        />
        <button onClick={this.handleGo.bind(this)}>GO</button>
        {appendStatus === 'spintax' && synsRenderer}
        <div className="append-tab">
          {appendStatus !== 'before' && <button onClick={this.handleBeforeClick.bind(this)}>Text Before</button>}
          {appendStatus !== 'spintax' && <button onClick={this.handleBackClick.bind(this)}>Back</button>}
          {appendStatus !== 'after' && <button onClick={this.handleAfterClick.bind(this)}>Text After</button>}
        </div>
        <div className="navigate-tab">
          <button
            onClick={prevHandler}
            disabled={prevDisabled}
          >
            Previous
          </button>
          <button
            onClick={nextHandler}
            disabled={nextDisabled}
          >
            Next
          </button>
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
})(QTip);
