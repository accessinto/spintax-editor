var redux = require('redux');
var spintax = require('./spintax');
var editor = require('./editor');
//import spintax from './spintax';


module.exports = redux.combineReducers({
  spintax,
  editor,
});