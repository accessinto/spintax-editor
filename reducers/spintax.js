const INITIAL_STATE = '';

const ek = (state = INITIAL_STATE, action) => {
  switch(action.type) {
    case 'LOAD': {
      return action.payload;
    }
    case 'GO': {
      const { replacement, start, length } = action.payload;
      const pre = state.substring(0, start);
      const suf = state.substring(start + length);
      return pre + replacement + suf;
    }
    default: return state;
  }
};

module.exports = ek;
