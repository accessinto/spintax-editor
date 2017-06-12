import React, { Component } from 'react';
import { connect } from 'react-redux';
import Widget from './Widget';
import { RANDOM_SPINTAX3, RANDOM_SPINTAX4 } from './mock';

class SpintaxContainer extends Component {

  componentWillMount () {
    this.props.dispatch({
      type: 'LOAD',
      payload: this.props.spintax,
    });
  }

  render() {
    return (
      <div id="spintax">
        <Widget />
      </div>
    );
  }
}

export default connect()(SpintaxContainer);
