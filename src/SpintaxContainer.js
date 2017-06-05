import React, { Component } from 'react';
import Spintax from './Spintax';
import XRegExp from 'xregexp';

class SpintaxContainer extends Component {

  componentWillMount() {
    const r = '(\{([^{}]|(?R))*\})';
    //const str = `{a |{b|c}{c|d}asasddjl | f {g|h|i} {asdasd|yahoo}}
    //{<h2>{Choosing Drunk Driving Lawyer | The Good, the Bad and Drunk Driving Lawyer | The Drunk Driving Lawyer Chronicles}</h2>|} <p>You are {going to want to jlkjlksure|asdjkaksld{asdjalksdj|239847273984|dasmnxz,mv}} you've got an attorney that is experienced enough to assist you in your divorce. Don't be scared to compare divorce lawyers should youn't feel the initial one which you see can help you. In such an instance, you will want a very good divorce attorney. </p>
    //`;
    const str = `a |{b|c}{c|d}asasddjl | f {g|h|i} {asdasd|yahoo}`;
    this.arr = XRegExp.matchRecursive(str, '\\{', '\\}', 'g');
  }

  render() {
    return (
      <div>
        <h3>To the best of my knowledge</h3>
        <Spintax />
        <h2>{this.arr.toString()}</h2>
      </div>
    );
  }
}

export default SpintaxContainer;
