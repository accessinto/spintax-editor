import { combineReducers } from 'redux';
import spintax from './spintax';
import editor from './editor';


export default combineReducers({
  spintax,
  editor,
});