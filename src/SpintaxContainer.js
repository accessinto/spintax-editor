import React, { Component } from 'react';
import { connect } from 'react-redux';
import Spintax from './Spintax';
import { RANDOM_SPINTAX3 } from './mock';

class SpintaxContainer extends Component {

  componentWillMount () {
    console.log(this.props);
    this.props.dispatch({
      type: 'LOAD',
      payload: RANDOM_SPINTAX3,
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
