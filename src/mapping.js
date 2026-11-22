const KEYWORD_MAP = {
  dhoro: 'let',
  bolo: 'print',
  jodi: 'if',
  nahole: 'else',
  jotokkhon: 'while',
  proti: 'for',
  moddhe: 'in',
  kaj: 'function',
  ferot: 'return',
  thamo: 'break',
  porerta: 'continue',
  thik: 'true',
  bhul: 'false',
  khali: 'null',
};

const KEYWORDS = new Set(Object.keys(KEYWORD_MAP));

// thik / bhul / khali: keyword, kintu expression-er value
const LITERAL_MAP = { thik: true, bhul: false, khali: null };
const LITERAL_KW = Object.keys(LITERAL_MAP);

const TWO_CHAR_OPS = ['==', '!=', '<=', '>=', '&&', '||', '+=', '-=', '*=', '/='];
const ONE_CHAR_OPS = '+-*/%<>=!(){}[],;';
const ASSIGN_OPS = ['=', '+=', '-=', '*=', '/='];

// Program-er shuru ar shesh
const PROGRAM_START = 'shuru';
const PROGRAM_END = 'shesh';
const PROGRAM_WORD = 'adda';

module.exports = {
  KEYWORD_MAP, KEYWORDS, LITERAL_MAP, LITERAL_KW,
  TWO_CHAR_OPS, ONE_CHAR_OPS, ASSIGN_OPS,
  PROGRAM_WORD, PROGRAM_START, PROGRAM_END,
};
