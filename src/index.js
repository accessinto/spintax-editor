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
  toggleShowUnspun,  
  setEditorState, 
  reloadEditor, 
} from './actions/EditorActions';

import SpintaxContainer from './components/SpintaxContainer';
import reducers from './reducers';

const store = createStore(reducers, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());


const App = ({ sp }) => (
  <Provider store={store}>
    <SpintaxContainer spintax={sp} />
  </Provider>
);

window.loadEditor = sp => render(<App sp={sp} />, document.getElementById('root'));
//window.switchToEditor = () => store.dispatch()
window.toggleRichTextMode = () => store.dispatch(toggleRichTextMode());
window.toggleShowUnspun = () => store.dispatch(toggleShowUnspun());
window.reloadEditor = sp => store.dispatch(reloadEditor(sp));
//TODO REMOVE NEXT LINE BEFORE BUILDING
window.loadEditor(`<p>
    <span style="font-size: 18px;">Quill Rich Text Editor</span>
</p>
<p>
    <br>
</p>
<p>Quill is a free,
    <a href="https://github.com/quilljs/quill/" target="_blank">open source</a>WYSIWYG editor built for the modern web. With its
    <a href="http://quilljs.com/docs/modules/" target="_blank">extensible architecture</a>and a
    <a href="http://quilljs.com/docs/api/" target="_blank">expressive API</a>you can completely customize it to fulfill your needs. Some built in features include:</p>
<p>jkl</p>
<p>Fast and lightweight</p>
<ul>
    <li>Semantic markup</li>
    <li>Standardized HTML between browsers</li>
    <li>Cross browser support including Chrome, Firefox, Safari, and IE 9+</li>
</ul>
<p>
    <br>
</p>
<p>
    <span style="font-size: 18px;">Downloads</span>
</p>
<p>
    <br>
</p>
<ul>
    <li>
        <a href="https://quilljs.com" target="_blank">Quill.js</a>, the free, open source WYSIWYG editor</li>
    <li>
        <a href="https://zenoamaro.github.io/react-quill" target="_blank">React-quill</a>, a React component that wraps Quill.js</li>
</ul>`);
//window.loadEditor('<p>This is a stupid Test. </p>This is a stupid test.');