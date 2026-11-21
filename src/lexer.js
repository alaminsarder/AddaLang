const { AddaError } = require('./errors');

const KEYWORDS = new Set([
  'dhoro', 'bolo', 'jodi', 'nahole', 'jotokkhon',
  'thamo', 'porerta', 'thik', 'bhul', 'khali',
<<<<<<< HEAD
  'kaj', 'ferot', 'proti', 'moddhe',
]);
const TWO_CHAR = ['==', '!=', '<=', '>=', '&&', '||', '+=', '-=', '*=', '/='];
const ONE_CHAR = '+-*/%<>=!(){}[],;';
=======
]);
const TWO_CHAR = ['==', '!=', '<=', '>=', '&&', '||', '+=', '-=', '*=', '/='];
const ONE_CHAR = '+-*/%<>=!(){},;';
>>>>>>> origin/main
const isDigit = (c) => c !== undefined && c >= '0' && c <= '9';
const isAlpha = (c) => c !== undefined && /[A-Za-z_]/.test(c);
const isAlnum = (c) => isAlpha(c) || isDigit(c);

function tokenize(src, startLine = 1) {
  const tokens = [];
  let i = 0;
  let line = startLine;
  const fail = (msg) => { throw new AddaError(msg, line); };

  while (i < src.length) {
    const c = src[i];

    if (c === '\n') { line++; i++; continue; }
    if (/\s/.test(c)) { i++; continue; }

    if (c === '/' && src[i + 1] === '/') {
      while (i < src.length && src[i] !== '\n') i++;
      continue;
    }

    if (isDigit(c)) {
      let j = i;
      while (isDigit(src[j])) j++;
      if (src[j] === '.' && isDigit(src[j + 1])) {
        j++;
        while (isDigit(src[j])) j++;
      }
      tokens.push({ type: 'num', value: parseFloat(src.slice(i, j)), line });
      i = j;
      continue;
    }
    if (c === '"' || c === "'") {
      let j = i + 1;
      let s = '';
      while (j < src.length && src[j] !== c) {
        if (src[j] === '\\') {
          const n = src[j + 1];
          s += n === 'n' ? '\n' : n === 't' ? '\t' : n;
          j += 2;
        } else {
          if (src[j] === '\n') line++;
          s += src[j++];
        }
      }
      if (j >= src.length) fail('String shesh hoyni, closing quote nai');
      tokens.push({ type: 'str', value: s, line });
      i = j + 1;
      continue;
    }
    if (isAlpha(c)) {
      let j = i;
      while (isAlnum(src[j])) j++;
      const word = src.slice(i, j);
      tokens.push({ type: KEYWORDS.has(word) ? 'kw' : 'id', value: word, line });
      i = j;
      continue;
    }
    const two = src.slice(i, i + 2);
    if (TWO_CHAR.includes(two)) {
      tokens.push({ type: 'op', value: two, line });
      i += 2;
      continue;
    }
    if (ONE_CHAR.includes(c)) {
      tokens.push({ type: 'op', value: c, line });
      i++;
      continue;
    }

    fail(`Ochena chinho '${c}'`);
  }

  tokens.push({ type: 'eof', value: 'shesh', line });
  return tokens;
}

module.exports = { tokenize };
