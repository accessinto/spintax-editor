const SPINWORD_PATTERN = /{[^{}]*}/;

const bestSpin = spintax => {
  let match;
  //debugger;
  while(match = spintax.match(SPINWORD_PATTERN)){
    match = match[0];
    const candidates = match.substring(1, match.length - 1).split("|");
    const option = 1;
    spintax = spintax.replace(match, candidates[option]);
  }
  return spintax;
}

const randomSpin = spintax => {
  let match;
  while(match = spintax.match(SPINWORD_PATTERN)){
    match = match[0];
    const candidates = match.substring(1, match.length - 1).split("|");
    const option = Math.floor(Math.random() * candidates.length);
    spintax = spintax.replace(match, candidates[option]);
  }
  return spintax;
}

const betterSpin = spintax => {
  let match;
  while(match = spintax.match(SPINWORD_PATTERN)){
    match = match[0];
    const candidates = match.substring(1, match.length - 1).split("|");
    const option = Math.floor(Math.random() * (candidates.length - 1)) + 1;
    spintax = spintax.replace(match, candidates[option]);
  }
  return spintax;
};

const escapeHtml = html => {
  return html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export default (toks, type, richText) => {
  const spintax = toks.map(tok=> tok.t).join('');
  let spin;
  if(type === 'BEST') { spin = bestSpin(spintax); }
  else if(type === 'REGULAR') { spin = randomSpin(spintax); }
  else if(type === 'BETTER') { spin = betterSpin(spintax); }
  if(!richText) {
    spin = escapeHtml(spin);
  }
  return spin;
};
