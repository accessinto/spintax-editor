const toggleSyn = (tokId, synId) => ({
  type: 'TOGGLE_SYN',
  payload: {
    tokId, 
    synId,
  }
});

const addSyn = (tokId, syn) => ({
  type: 'ADD_SYN',
  payload: {
    tokId, 
    syn,
  }
});

const addSynBefore = (tokId, syn) => ({
  type: 'ADD_SYN_BEFORE',
  payload: {
    tokId, 
    syn,
  }
});

const addSynAfter = (tokId, syn) => ({
  type: 'ADD_SYN_AFTER',
  payload: {
    tokId, 
    syn,
  }
});

const rewriteSyns = (synsArray) => ({
  type: 'REWRITE',
  payload: synsArray,
});

module.exports = {
  toggleSyn,
  addSyn,
  addSynBefore,
  addSynAfter,
  rewriteSyns, 
}