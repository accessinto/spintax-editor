export const resetEditor = () => ({
  type: 'RESET_EDITOR',
})

export const reloadEditor = str => ({
  type: 'RELOAD_EDITOR',
  payload: str, 
});

export const setEditorState = editorState => ({
  type: 'SET_EDITOR_STATE',
  payload: editorState,
});

export const setFocusId = tokId => ({
  type: 'SET_FOCUS',
  payload: {
    tokId
  }
});

export const resetFocusId = () => ({
  type: 'RESET_FOCUS',
});

export const setSelectionRange = (start, end) => ({
  type: 'SET_SELECTION_RANGE',
  payload: { start, end }
});

export const resetSelection = () => ({
  type: 'RESET_SELECTION',
});

export const toggleRichTextMode = () => ({
  type: 'TOGGLE_RICH_MODE',
});

export const toggleShowUnspun = () => ({
  type: 'TOGGLE_SHOW_UNSPUN',
});

export const setSummernoteMode = () => ({
  type: 'SET_SUMMERNOTE_MODE',
});

export const unsetSummernoteMode = () => ({
  type: 'UNSET_SUMMERNOTE_MODE',
});
