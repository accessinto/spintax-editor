import React from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import SpintaxContainer from './components/SpintaxContainer';
import reducers from './reducers';

const store = createStore(reducers, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());


const App = () => (
  <Provider store={store}>
    <SpintaxContainer />
  </Provider>
);

render(<App />, document.getElementById('root'));
