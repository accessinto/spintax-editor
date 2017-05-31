import React from 'react';
import { render } from 'react-dom';
import Hello from './Hello';
import SpintaxContainer from './SpintaxContainer';

const styles = {
  fontFamily: 'sans-serif',
  textAlign: 'center',
};


const App = () => (
  <SpintaxContainer />
);

render(<App />, document.getElementById('root'));
