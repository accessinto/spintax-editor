import React, { Component } from 'react';
import { connect } from 'react-redux';
import Spintax from './Spintax';
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
      <div>
        <Spintax />
      </div>
    );
  }
}

export default connect()(SpintaxContainer);
