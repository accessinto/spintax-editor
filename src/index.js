import React from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { RANDOM_SPINTAX3, RANDOM_SPINTAX4 } from './components/mock';

import { toggleSyn } from './actions/SynsActions';
import { 
  setFocusId, 
  resetFocusId, 
  setSelectionRange,
  toggleRichTextMode, 
} from './actions/EditorActions';

import SpintaxContainer from './components/SpintaxContainer';
import reducers from './reducers';

const store = createStore(reducers, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());


const App = ({ sp }) => (
  <Provider store={store}>
    <SpintaxContainer spintax={sp} />
  </Provider>
);

window.loadEditor = (sp) => render(<App sp={RANDOM_SPINTAX3} />, document.getElementById('root'));
window.toggleRichTextMode = () => store.dispatch(toggleRichTextMode());

//TODO REMOVE NEXT LINE BEFORE BUILDING
window.loadEditor();