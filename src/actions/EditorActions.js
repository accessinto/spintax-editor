const setFocusId = (tokId) => ({
  type: 'SET_FOCUS',
  payload: {
    tokId
  }
});

const resetFocusId = () => ({
  type: 'RESET_FOCUS',
});

const setSelectionRange = (start, end) => ({
  type: 'SET_SELECTION_RANGE',
  payload: { start, end }
});

const resetSelection = () => ({
  type: 'RESET_SELECTION',
});

const toggleRichTextMode = () => ({
  type: 'TOGGLE_RICH_MODE',
})

module.exports = {
  setFocusId,
  resetFocusId,
  setSelectionRange,
  resetSelection, 
  toggleRichTextMode, 
}
