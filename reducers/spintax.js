const INITIAL_STATE = {
  toks: [],
  focusedId: null,
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

const tokenize = spintax => {
  let m;
  const toks = [];
  //const r = /(['\w]+|{[^{}]*})/g;
  //const r2 = /(\s+)|(<\/?.*?>)|([\w\-:']+|{[^{}]*})|([{|}])|([^\w\s])/g;
  //const r3 = /(\s+)|(<[^\/].*?>)|(<\/?.*?>)|([\w\-:']+|{[^{}]*})|([{|}])|([^\w\s])/g;
  const r4 = /(\s+)|(<[^\/].*?>)|(<\/?.*?>)|([\w\-:']+|{[^{}]*})|({)|(})|(\|)|([^\w\s])/g;
  //1: whitespace
  //2: opening tag
  //3: closing tag
  //4: SW
  //5: Opening Brack
  //6: Closing Brack
  //7: Pipe
  //8: Punctuation
  let idGen = 0;
  const s = [];
  const b = [];
  while ((m = r4.exec(spintax)) !== null) {
    // console.log(m.index);
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === r4.lastIndex) {
        r4.lastIndex++;
    }
    const id = idGen++;
    const type = m.indexOf(m[0], 1);
    let obj = {
      id, 
      start: m.index,
      length: m[0].length,
      end: m.index + m[0].length,
      type: m.indexOf(m[0], 1),
      t: m[0],
    }
    if(type === 2) {
      s.push(id);
    }
    if(type === 5) {
      b.push(id);
    }
    if(type === 4) {
      const str = obj.t;
      let arr;
      if(str.startsWith('{') && str.endsWith('}')) {
        arr = str.slice(1, -1).split('|');
      } else {
        arr = [str];
      }
      obj = Object.assign({
        syns: arr.map((syn) => ({ content: syn, selected: true }))
      }, obj);
    }
    if(type === 7) {
      const matchId = b[b.length - 1];
      obj = Object.assign({
        matchId
      }, obj);
    }
    if(type === 3) {
      const matchId = s.pop();
      toks[matchId] = Object.assign({
        matchId: id,
      }, toks[matchId]);
      obj = Object.assign({
        matchId,
      }, obj)
    }
    if(type === 6) {
      const matchId = b.pop();
      toks[matchId] = Object.assign({
        matchId: id,
      }, toks[matchId]);
      obj = Object.assign({
        matchId
      }, obj);
    }
    toks.push(obj);
  }
  return toks;
}

module.exports = (state = INITIAL_STATE, action) => {
  switch(action.type) {
    case 'SET_FOCUS': return Object.assign({}, state, { focusedId: action.payload.tokId });
    case 'RESET_FOCUS': return Object.assign({}, state, { focusedId: null });
    case 'LOAD': return Object.assign({}, state, { toks: tokenize(action.payload) });
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
      const newToks = tokenize(` ${syn} `).map((tok) => {
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
      const newToks = tokenize(` ${syn} `).map((tok) => {
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
