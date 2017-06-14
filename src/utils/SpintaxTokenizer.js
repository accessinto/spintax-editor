const SPINWORD_PATTERN = /{[^{}]*}/;
const PARSE_PATTERN = /(\s+)|(<[^/].*?>)|(<\/?.*?>)|([\w\-:']+|{[^{}]*})|({)|(})|(\|)|([^\w\s])/g;

const IMAGE_ALIGN_PATTERN = /align="(\{left\|right\})"/g;

const randomSpin = spun => {
  let match;
  while(match = spun.match(SPINWORD_PATTERN)){
    match = match[0];
    const candidates = match.substring(1, match.length - 1).split("|");
    const option = Math.floor(Math.random() * candidates.length);
    spun = spun.replace(match, candidates[option]);
  }
  return spun;
};

const filterImageAlignOption = spintax => spintax.replace(IMAGE_ALIGN_PATTERN, match => randomSpin(match));

export default spintax => {
  const imageFilteredSpintax = filterImageAlignOption(spintax);
  let m;
  const toks = [];
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
  let sid = 0;
  let bid = 0;
  while ((m = PARSE_PATTERN.exec(imageFilteredSpintax)) !== null) {
    // console.log(m.index);
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === PARSE_PATTERN.lastIndex) {
        PARSE_PATTERN.lastIndex++;
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
    };
    if(type === 2) {
      s.push(id);
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
    if(type === 5) {
      b.push(id);
      obj = Object.assign({}, {
        bmid: ++bid,
      }, obj);
    }
    if(type === 6) {
      const matchId = b.pop();
      toks[matchId] = Object.assign({
        matchId: id,
      }, toks[matchId]);
      obj = Object.assign({
        matchId,
        bmid: bid--,
      }, obj);
    }
    if(type === 7) {
      const matchId = b[b.length - 1];
      obj = Object.assign({
        matchId,
        bmid: bid,
      }, obj);
    }
    toks.push(obj);
  }
  return toks.map(tok => {
    return Object.assign({}, tok, {
      unspun: tok.syns && tok.syns.length === 1
    });
  });
}