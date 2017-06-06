import React, { Component } from 'react';
import ToolTip from 'react-portal-tooltip';


class QTip extends Component {

  state = {
    newInput: '',
    appendStatus: 'spintax',
  }

  render () {
    const { syns, goHandler, textBeforeHandler, textAfterHandler, previousHandler, nextHandler } = this.props;
    const { appendStatus, newInput } = this.state;
    const synsRenderer = (
      <ul>
        {syns.map((syn, i) => (
          <li key={i} className={syn.selected ? 'selected' : ''}>
            {syn.content}
          </li>
        ))}
      </ul>
    );
    return (
      <div>
        <input 
          name='newSyn' 
          value={newInput}
          onChange={(e) => this.setState({ newInput: e.target.value })}
        />
        <button onClick={() => goHandler(newInput)}>GO</button>
        {appendStatus === 'spintax' && synsRenderer}
        <div className="append-tab">
          {appendStatus === 'before' ? '' : <a>Text Before</a>}
          {appendStatus === 'spintax' ? '' : <a>Back</a>}
          {appendStatus === 'after' ? '' : <a>Text After</a>}
        </div>
        <div className="navigate-tab">
          <a>Previous</a>
          <a>Next</a>
        </div>
      </div>
    )
  }
}

export default QTip;
