import tokenizer from '../utils/SpintaxTokenizer';

const INITIAL_STATE = {
  initialToks: [],
  toks: [],
  focusedId: null,
  selection: {
    start: null,
    end: null,
  },
  richTextMode: false,
  showUnspun: false, 
  initEditorState: null,
  editorState: null,
  summernoteMode: false,
};

const replacementText = syns => {
  let replacement;
  const replacementArray = syns
    .filter((syn) => syn.selected)
    .map((syn) => syn.content);
  if(replacementArray.length <= 1) {
    replacement = replacementArray.join();
  } else {
    replacement = `{${replacementArray.join('|')}}`;
  }
  return replacement;
};

export default (state = INITIAL_STATE, action) => {
  console.log(action.type);
  switch(action.type) {
    case 'SET_SUMMERNOTE_MODE': return Object.assign({}, state, { 
      summernoteMode: true,
      initEditorState: state.toks.map(t => t.t).join(''),
      editorState: state.toks.map(t => t.t).join(''),
      focusedId: null,
      selection: {
        start: null,
        end: null,
      }
     });
    case 'UNSET_SUMMERNOTE_MODE': return Object.assign({}, state, {
      summernoteMode: false,
      initEditorState: null,
      editorState: null,
      focusedId: null,
      selection: {
        start: null,
        end: null,
      }
    });
    case 'TOGGLE_SHOW_UNSPUN': return Object.assign({}, state, { showUnspun: !state.showUnspun });
    case 'TOGGLE_RICH_MODE': return Object.assign({}, state, { richTextMode: !state.richTextMode });
    case 'SET_FOCUS': return Object.assign({}, state, { focusedId: action.payload.tokId });
    case 'RESET_FOCUS': return Object.assign({}, state, { focusedId: null });
    case 'SET_EDITOR_STATE': return Object.assign({}, state, { editorState: action.payload })
    case 'LOAD': {
      const toks = tokenizer(action.payload);
      return Object.assign({}, state, { 
        toks,
        initialToks: toks,
      });
    }
    case 'RELOAD_EDITOR': return Object.assign({}, INITIAL_STATE, { 
      richTextMode: state.richTextMode,
      toks: tokenizer(action.payload), 
      initialToks: state.initialToks, 
    });
    case 'RESET_EDITOR': return Object.assign({}, state, {
      toks: state.initialToks,
      focusedId: null,
      selection: {
        start: null, 
        end: null, 
      }
    })
    case 'SET_SELECTION_RANGE': {
      const { start, end } = action.payload;
      return Object.assign({}, state, {
        selection: {
          start,
          end,
        }
      });
    }
    case 'RESET_SELECTION': {
      return Object.assign({}, state, {
        selection: {
          start: null, 
          end: null, 
        }
      });
    }
    case 'REWRITE': {
      const { start, end } = state.selection;
      const syns = action.payload;
      const startTok = state.toks[start];
      const endTok = state.toks[end];
      const pre = state.toks.slice(0, start);
      const oldLength = endTok.end - startTok.start;
      const newT = `{${syns.join('|')}}`;
      const newToken = {
        id: start,
        type: 4,
        t: newT,
        start: startTok.start,
        end: startTok.start + newT.length,
        length: newT.length,
        syns: syns.map(syn => ({ content: syn, selected: true })),
      };
      const suf = state.toks.slice(end + 1);
      const modifiedSuf = suf.map(tok => {
        let newMatchId = tok.matchId;
        if(tok.matchId && tok.matchId > start + 1) {
          newMatchId = tok.matchId - (end - start);
        }
        return Object.assign({}, tok, {
          id: tok.id - (end - start),
          start: tok.start - oldLength + newT.length,
          end: tok.start - oldLength + newT.length + tok.length,
          matchId: newMatchId,
        });
      });
      return Object.assign({}, state, {
        focusedId: start,
        toks: [
          ...pre,
          newToken,
          ...modifiedSuf
        ],
        selection: {
          start: null,
          end: null,
        }
      })
    }
    case 'GO': {
      const { replacement, index } = action.payload;
      const pre = state.toks.slice(0, index);
      const suf = state.toks.slice(index + 1);
      return Object.assign({}, state, {
        toks: [
          ...pre,
          replacement,
          ...suf,
        ]
      });
    }
    case 'TOGGLE_SYN': {
      const { tokId, synId } = action.payload;
      const pre = state.toks.slice(0, tokId);
      const suf = state.toks.slice(tokId + 1);
      const item = state.toks[tokId];
      const syns = item.syns;
      const syn = syns[synId];
      const newSyns = [
        ...syns.slice(0, synId),
        Object.assign({}, syn, { selected: !syn.selected }),
        ...syns.slice(synId + 1)
      ];
      return Object.assign({}, state, {
        toks: [
          ...pre, 
          Object.assign({}, item, { syns: newSyns, t: replacementText(newSyns) }),
          ...suf
        ]
      });
    }
    case 'ADD_SYN': {
      const { tokId, syn } = action.payload;
      const pre = state.toks.slice(0, tokId);
      const suf = state.toks.slice(tokId + 1);
      const item = state.toks[tokId];
      const syns = item.syns;
      const newSyns = [
        ...syns,
        { content: syn, selected: true }
      ];
      return Object.assign({}, state, {
        toks: [
          ...pre, 
          Object.assign({}, item, { syns: newSyns, t: replacementText(newSyns) }),
          ...suf
        ]
      });
    }
    case 'ADD_SYN_BEFORE': {
      const { tokId, syn } = action.payload;
      const pivot = state.toks[tokId];
      const newToks = tokenizer(` ${syn} `).map((tok) => {
        let newMatchId = tok.matchId;
        if(tok.matchId) {
          newMatchId = tok.matchId + tokId;
        }
        return Object.assign({}, tok, {
          id: tok.id + tokId,
          start: tok.start + pivot.start,
          end: tok.start + pivot.start + tok.length,
          matchId: newMatchId,
        });
      });
      const pre = state.toks.slice(0, tokId);
      const suf = state.toks.slice(tokId).map((tok) => {
        let newMatchId = tok.matchId;
        if(tok.matchId && tok.matchId > tokId - 1) {
          newMatchId = tok.matchId + newToks.length;
        }
        return Object.assign({}, tok, {
          id: tok.id + newToks.length,
          start: tok.start + syn.length + 2,
          end: tok.start + syn.length + 2 + tok.length,
          matchId: newMatchId,
        })
      });
      console.log({ pre, newToks, suf });
      return Object.assign({}, state, {
        toks: [
          ...pre, 
          ...newToks,
          ...suf,
        ],
        focusedId: tokId + 1
      });
    }
    case 'ADD_SYN_AFTER': {
      const { tokId, syn } = action.payload;
      const pivot = state.toks[tokId];
      const newToks = tokenizer(` ${syn} `).map((tok) => {
        let newMatchId = tok.matchId;
        if(tok.matchId) {
          newMatchId = tok.matchId + tokId;
        }
        return Object.assign({}, tok, {
          id: tok.id + tokId + 1,
          start: tok.start + pivot.start,
          end: tok.start + pivot.start + tok.length,
          matchId: newMatchId,
        });
      });
      const pre = state.toks.slice(0, tokId + 1);
      const suf = state.toks.slice(tokId + 1)
        .map((tok) => {
          let newMatchId = tok.matchId;
          if(tok.matchId && tok.matchId > tokId - 1) {
            newMatchId = tok.matchId + newToks.length;
        };
        return Object.assign({}, tok, {
          id: tok.id + newToks.length,
          start: tok.start + syn.length + 2,
          end: tok.start + syn.length + 2 + tok.length,
          matchId: newMatchId,
        });
      });
      console.log({ pre, newToks, suf });
      return Object.assign({}, state, {
        toks: [
          ...pre, 
          ...newToks,
          ...suf,
        ],
        focusedId: tokId + 2
      });
    }
    default: return state;
  }
};
