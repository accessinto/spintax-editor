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
  resetEditor, 
  setSelectionRange,
  toggleRichTextMode, 
  toggleShowUnspun,  
  setEditorState, 
  setSummernoteMode, 
  reloadEditor, 
} from './actions/EditorActions';

import generateSpin from './utils/SpinGenerator';

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
window.store = store;
window.lastButton = null;
//window.switchToEditor = () => store.dispatch()
window.randSpintax = RANDOM_SPINTAX3;

window.richTextMode = store.getState().spintax.richTextMode;
window.setSummernoteMode = () => {
  window.lastButton = null;
  store.dispatch(setSummernoteMode());
}
window.toggleRichTextMode = () => store.dispatch(toggleRichTextMode());
window.toggleShowUnspun = () => store.dispatch(toggleShowUnspun());
window.reloadEditor = sp => store.dispatch(reloadEditor(sp));
window.resetEditor = () => store.dispatch(resetEditor());
window.loadEditor = (sp, elementId) => render(<App sp={sp} />, document.getElementById(elementId));
window.getSpin = type => generateSpin(store.getState().spintax.toks, type, store.getState().spintax.richTextMode);
window.rawSpintax = store.getState().spintax.toks.map(tok => tok.t).join('');
//TODO REMOVE NEXT LINE BEFORE BUILDING
// window.loadEditor(RANDOM_SPINTAX4, 'root');