const setFocusId = (tokId) => ({
  type: 'SET_FOCUS',
  payload: {
    tokId
  }
});

const resetFocusId = () => ({
  type: 'RESET_FOCUS',
});

module.exports = {
  setFocusId,
  resetFocusId,
}
