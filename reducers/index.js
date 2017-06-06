var redux = require('redux');
var spintax = require('./spintax');
//import spintax from './spintax';


module.exports = redux.combineReducers({
  spintax,
});