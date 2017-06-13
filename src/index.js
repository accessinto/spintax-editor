import React from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import Perf from 'react-addons-perf';
import { RANDOM_SPINTAX3, RANDOM_SPINTAX4 } from './components/mock';

import { toggleSyn } from './actions/SynsActions';
import { 
  setFocusId, 
  resetFocusId, 
  setSelectionRange,
  toggleRichTextMode, 
  toggleShowUnspun,  
  setEditorState, 
  reloadEditor, 
} from './actions/EditorActions';

import SpintaxContainer from './components/SpintaxContainer';
import reducers from './reducers';

const store = createStore(reducers, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());


const App = ({ sp }) => (
  <Provider store={store}>
    <div>
      <SpintaxContainer spintax={sp} />
    </div>
  </Provider>
);


window.Perf = Perf;
//window.switchToEditor = () => store.dispatch()
window.toggleRichTextMode = () => store.dispatch(toggleRichTextMode());
window.toggleShowUnspun = () => store.dispatch(toggleShowUnspun());
window.reloadEditor = sp => store.dispatch(reloadEditor(sp));
window.loadEditor = (sp, elementId) => render(<App sp={sp} />, document.getElementById(elementId));
//TODO REMOVE NEXT LINE BEFORE BUILDING
//window.loadEditor(RANDOM_SPINTAX3);