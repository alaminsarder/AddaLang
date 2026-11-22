// AddaLang browser bundle: scripts/build.js diye toiri. Eta hate edit koro na.
(function (global) {
"use strict";
const __defs = {}, __cache = {};
function __require(name) {
  const key = name.replace(/^\.\//, '').replace(/\.js$/, '');
  if (__cache[key]) return __cache[key].exports;
  const module = { exports: {} };
  __cache[key] = module;
  __defs[key](module, module.exports, __require);
  return module.exports;
}
__defs["errors"] = function (module, exports, require) {
class AddaError extends Error {
  constructor(message, line) {
    super(message);
    this.name = 'AddaError';
    this.line = line || null;
  }
}
module.exports = { AddaError };

};
__defs["mapping"] = function (module, exports, require) {
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

};
__defs["preprocessor"] = function (module, exports, require) {
const { AddaError } = require('./errors');
const { PROGRAM_WORD, PROGRAM_START, PROGRAM_END } = require('./mapping');

// Preprocessor: lexer-er age source-ke porishkar kore.
// 1. BOM soriye dey, CRLF/CR ke LF kore (line sonkhya ager moto thake)
// 2. 'adda shuru' ... 'adda shesh'-er bhetorer code ber kore, baire ja ache ignore
// 3. Code ar tar shuru line number fera dey, jate error-e thik line dekhano jay
function normalize(source) {
  return String(source).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
}

function extractProgram(source) {
  const re = new RegExp(`\\b${PROGRAM_WORD}\\s+${PROGRAM_START}\\b([\\s\\S]*?)\\b${PROGRAM_WORD}\\s+${PROGRAM_END}\\b`);
  const m = re.exec(source);
  if (!m) {
    throw new AddaError(`Program '${PROGRAM_WORD} ${PROGRAM_START}' diye shuru ar '${PROGRAM_WORD} ${PROGRAM_END}' diye shesh korte hobe`);
  }
  const bodyStart = m.index + m[0].indexOf(m[1]);
  const startLine = source.slice(0, bodyStart).split('\n').length;
  return { code: m[1], startLine };
}

function preprocess(source) {
  return extractProgram(normalize(source));
}

module.exports = { preprocess, normalize, extractProgram };

};
__defs["lexer"] = function (module, exports, require) {
const { AddaError } = require('./errors');

const { KEYWORDS, TWO_CHAR_OPS: TWO_CHAR, ONE_CHAR_OPS: ONE_CHAR } = require('./mapping');
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

};
__defs["parser"] = function (module, exports, require) {
const { AddaError } = require('./errors');

const { ASSIGN_OPS, LITERAL_KW, LITERAL_MAP } = require('./mapping');

function parse(tokens) {
  let p = 0;
  const peek = () => tokens[p];
  const next = () => tokens[p++];
  const isOp = (v) => peek().type === 'op' && peek().value === v;
  const isKw = (v) => peek().type === 'kw' && peek().value === v;
  const fail = (msg, t = peek()) => { throw new AddaError(msg, t.line); };
  const expectOp = (v) => {
    if (!isOp(v)) fail(`'${v}' dorkar chhilo, kintu peyechi '${peek().value}'`);
    return next();
  };

  function program() {
    const body = [];
    while (peek().type !== 'eof') body.push(statement());
    return { type: 'Program', body };
  }

  function block() {
    expectOp('{');
    const body = [];
    while (!isOp('}')) {
      if (peek().type === 'eof') fail("Block '}' diye shesh korte hobe");
      body.push(statement());
    }
    next();
    return { type: 'Block', body };
  }

  function ifStatement() {
    const t = next(); // jodi
    expectOp('(');
    const test = expr();
    expectOp(')');
    const then = block();
    let otherwise = null;
    if (isKw('nahole')) {
      next();
      otherwise = isKw('jodi') ? ifStatement() : block();
    }
    return { type: 'If', test, then, otherwise, line: t.line };
  }

  function simpleNoSemi() {
    const t = peek();
    const after = tokens[p + 1];
    if (t.type === 'id' && after.type === 'op' && ASSIGN_OPS.includes(after.value)) {
      next();
      const op = next().value;
      return { type: 'Assign', name: t.value, op, value: expr(), line: t.line };
    }
    const e = expr();
    if (isOp('=') || ASSIGN_OPS.some((o) => isOp(o))) return indexAssign(e, t);
    return { type: 'ExprStmt', expr: e, line: t.line };
  }

  function indexAssign(target, t) {
    if (target.type !== 'Index') fail('Ekhane assign kora jay na, variable ba talika[position] dite hobe', t);
    const op = next().value;
    return { type: 'IndexAssign', target, op, value: expr(), line: t.line };
  }

  function forStatement() {
    const t = next();
    expectOp('(');
    if (peek().type === 'id' && tokens[p + 1].type === 'kw' && tokens[p + 1].value === 'moddhe') {
      const name = next().value;
      next();
      const iter = expr();
      expectOp(')');
      return { type: 'ForEach', name, iter, body: block(), line: t.line };
    }
    let init = null;
    if (isKw('dhoro')) {
      const d = next();
      const id = next();
      if (id.type !== 'id') fail('dhoro-r pore variable-er naam dite hobe', id);
      expectOp('=');
      init = { type: 'Let', name: id.value, init: expr(), line: d.line };
    } else if (!isOp(';')) {
      init = simpleNoSemi();
    }
    expectOp(';');
    const test = isOp(';') ? null : expr();
    expectOp(';');
    const update = isOp(')') ? null : simpleNoSemi();
    expectOp(')');
    return { type: 'For', init, test, update, body: block(), line: t.line };
  }

  function funcDecl() {
    const t = next();
    const id = next();
    if (id.type !== 'id') fail('kaj-er pore function-er naam dite hobe', id);
    expectOp('(');
    const params = [];
    if (!isOp(')')) {
      do {
        const a = next();
        if (a.type !== 'id') fail('Parameter-er naam dite hobe', a);
        if (params.includes(a.value)) fail(`Parameter '${a.value}' duibar dewa hoyeche`, a);
        params.push(a.value);
      } while (isOp(',') && next());
    }
    expectOp(')');
    return { type: 'Func', name: id.value, params, body: block(), line: t.line };
  }

  function statement() {
    const t = peek();
    if (isOp('{')) return block();

    if (t.type === 'kw' && !LITERAL_KW.includes(t.value)) {
      switch (t.value) {
        case 'dhoro': {
          next();
          const id = next();
          if (id.type !== 'id') fail('dhoro-r pore variable-er naam dite hobe', id);
          expectOp('=');
          const init = expr();
          expectOp(';');
          return { type: 'Let', name: id.value, init, line: t.line };
        }
        case 'bolo': {
          next();
          const args = [expr()];
          while (isOp(',')) { next(); args.push(expr()); }
          expectOp(';');
          return { type: 'Print', args, line: t.line };
        }
        case 'jodi':
          return ifStatement();
        case 'jotokkhon': {
          next();
          expectOp('(');
          const test = expr();
          expectOp(')');
          return { type: 'While', test, body: block(), line: t.line };
        }
        case 'proti':
          return forStatement();
        case 'kaj':
          return funcDecl();
        case 'ferot': {
          next();
          const value = isOp(';') ? null : expr();
          expectOp(';');
          return { type: 'Return', value, line: t.line };
        }
        case 'thamo':
          next(); expectOp(';');
          return { type: 'Break', line: t.line };
        case 'porerta':
          next(); expectOp(';');
          return { type: 'Continue', line: t.line };
        default:
          fail(`'${t.value}' ekhane boshte pare na`);
      }
    }

    // assignment: x = 1; x += 2;
    const after = tokens[p + 1];
    if (t.type === 'id' && after.type === 'op' && ASSIGN_OPS.includes(after.value)) {
      next();
      const op = next().value;
      const value = expr();
      expectOp(';');
      return { type: 'Assign', name: t.value, op, value, line: t.line };
    }

    const e = expr();
    if (isOp('=') || ASSIGN_OPS.some((o) => isOp(o))) {
      const node = indexAssign(e, t);
      expectOp(';');
      return node;
    }
    expectOp(';');
    return { type: 'ExprStmt', expr: e, line: t.line };
  }

  const binary = (sub, ops, type = 'Binary') => () => {
    let left = sub();
    while (peek().type === 'op' && ops.includes(peek().value)) {
      const op = next();
      left = { type, op: op.value, left, right: sub(), line: op.line };
    }
    return left;
  };

  function expr() { return or(); }
  const or = binary(() => and(), ['||'], 'Logical');
  const and = binary(() => equality(), ['&&'], 'Logical');
  const equality = binary(() => comparison(), ['==', '!=']);
  const comparison = binary(() => term(), ['<', '>', '<=', '>=']);
  const term = binary(() => factor(), ['+', '-']);
  const factor = binary(() => unary(), ['*', '/', '%']);

  function unary() {
    if (isOp('!') || isOp('-')) {
      const op = next();
      return { type: 'Unary', op: op.value, arg: unary(), line: op.line };
    }
    return postfix();
  }

  function postfix() {
    let e = primary();
    for (;;) {
      if (isOp('(')) {
        const open = next();
        const args = [];
        if (!isOp(')')) {
          do { args.push(expr()); } while (isOp(',') && next());
        }
        expectOp(')');
        e = { type: 'Call', callee: e, args, line: open.line };
      } else if (isOp('[')) {
        const open = next();
        const index = expr();
        expectOp(']');
        e = { type: 'Index', object: e, index, line: open.line };
      } else {
        return e;
      }
    }
  }

  function primary() {
    const t = next();
    if (t.type === 'num' || t.type === 'str') return { type: 'Literal', value: t.value };
    if (t.type === 'kw' && LITERAL_KW.includes(t.value)) {
      return { type: 'Literal', value: LITERAL_MAP[t.value] };
    }
    if (t.type === 'id') return { type: 'Var', name: t.value, line: t.line };
    if (t.type === 'op' && t.value === '(') {
      const e = expr();
      expectOp(')');
      return e;
    }
    if (t.type === 'op' && t.value === '[') {
      const items = [];
      if (!isOp(']')) {
        do { items.push(expr()); } while (isOp(',') && next());
      }
      expectOp(']');
      return { type: 'List', items, line: t.line };
    }
    fail(`Expression ashha korechilam, kintu peyechi '${t.value}'`, t);
  }

  return program();
}

module.exports = { parse };

};
__defs["interpreter"] = function (module, exports, require) {
const { AddaError } = require('./errors');

class BreakSignal {}
class ContinueSignal {}
class ReturnSignal { constructor(value) { this.value = value; } }

const MAX_DEPTH = 150;
const MAX_RANGE = 100000;

class Env {
  constructor(parent = null) { this.parent = parent; this.vars = new Map(); }
  define(name, value, line) {
    if (this.vars.has(name)) throw new AddaError(`'${name}' ei scope-e age-i dhora ache`, line);
    this.vars.set(name, value);
  }
  find(name) {
    for (let e = this; e; e = e.parent) if (e.vars.has(name)) return e;
    return null;
  }
  get(name, line) {
    const e = this.find(name);
    if (!e) throw new AddaError(`'${name}' chena jachche na, age 'dhoro' diye banao`, line);
    return e.vars.get(name);
  }
  set(name, value, line) {
    const e = this.find(name);
    if (!e) throw new AddaError(`'${name}' chena jachche na, age 'dhoro' diye banao`, line);
    e.vars.set(name, value);
  }
}

const isFn = (v) => v !== null && typeof v === 'object' && (v.kind === 'fn' || v.kind === 'native');

function show(v) {
  if (v === true) return 'thik';
  if (v === false) return 'bhul';
  if (v === null || v === undefined) return 'khali';
  if (Array.isArray(v)) return '[' + v.map((x) => (typeof x === 'string' ? JSON.stringify(x) : show(x))).join(', ') + ']';
  if (isFn(v)) return `<kaj ${v.name}>`;
  return String(v);
}

const truthy = (v) => !(v === null || v === false || v === 0 || v === '' || (Array.isArray(v) && v.length === 0));

function typeName(v) {
  if (v === null || v === undefined) return 'khali';
  if (typeof v === 'number') return 'sonkhya';
  if (typeof v === 'string') return 'lekha';
  if (typeof v === 'boolean') return 'thikbhul';
  if (Array.isArray(v)) return 'talika';
  return 'kaj';
}

function makeBuiltins() {
  const env = new Env();
  const def = (name, arity, fn) => env.vars.set(name, { kind: 'native', name, arity, fn });
  const fail = (msg, line) => { throw new AddaError(msg, line); };
  const needNum = (name, v, line) => {
    if (typeof v !== 'number') fail(`'${name}' sudhu number-er sathe chole`, line);
    return v;
  };
  const needList = (name, v, line) => {
    if (!Array.isArray(v)) fail(`'${name}' sudhu talika-r sathe chole`, line);
    return v;
  };
  const needStr = (name, v, line) => {
    if (typeof v !== 'string') fail(`'${name}' sudhu lekha-r sathe chole`, line);
    return v;
  };
  const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

  def('doirgho', 1, ([x], l) => {
    if (typeof x === 'string' || Array.isArray(x)) return x.length;
    return fail("'doirgho' sudhu lekha ba talika-r sathe chole", l);
  });
  def('jogkoro', 2, ([list, v], l) => { needList('jogkoro', list, l).push(v); return null; });
  def('berkoro', 1, ([list], l) => {
    if (needList('berkoro', list, l).length === 0) fail('Khali talika theke berkora jay na', l);
    return list.pop();
  });
  def('ache', 2, ([x, v], l) => {
    if (Array.isArray(x)) return x.includes(v);
    if (typeof x === 'string') return x.includes(show(v));
    return fail("'ache' sudhu lekha ba talika-r sathe chole", l);
  });
  def('ulto', 1, ([x], l) => {
    if (typeof x === 'string') return [...x].reverse().join('');
    return [...needList('ulto', x, l)].reverse();
  });
  def('sajao', 1, ([list], l) => {
    needList('sajao', list, l);
    const kinds = new Set(list.map((x) => typeof x));
    if (kinds.size > 1 || (kinds.size === 1 && !kinds.has('number') && !kinds.has('string'))) {
      fail("'sajao' sudhu shob number ba shob lekha-r talika-y chole", l);
    }
    return [...list].sort(cmp);
  });
  def('porisima', [1, 3], (args, l) => {
    args.forEach((a) => needNum('porisima', a, l));
    const [a, b, step] = args.length === 1 ? [0, args[0], 1] : [args[0], args[1], args[2] === undefined ? 1 : args[2]];
    if (step === 0) fail("'porisima'-r dhap shunno hote pare na", l);
    const out = [];
    for (let i = a; step > 0 ? i < b : i > b; i += step) {
      if (out.length >= MAX_RANGE) fail("'porisima' onek boro", l);
      out.push(i);
    }
    return out;
  });
  def('borgomul', 1, ([x], l) => {
    if (needNum('borgomul', x, l) < 0) fail('Rinatmok sonkhyar borgomul nai', l);
    return Math.sqrt(x);
  });
  def('niche', 1, ([x], l) => Math.floor(needNum('niche', x, l)));
  def('upore', 1, ([x], l) => Math.ceil(needNum('upore', x, l)));
  def('gol', 1, ([x], l) => Math.round(needNum('gol', x, l)));
  def('porom', 1, ([x], l) => Math.abs(needNum('porom', x, l)));
  def('random', 2, ([a, b], l) => {
    needNum('random', a, l); needNum('random', b, l);
    const lo = Math.ceil(Math.min(a, b)), hi = Math.floor(Math.max(a, b));
    return lo + Math.floor(Math.random() * (hi - lo + 1));
  });
  const pick = (name, best) => def(name, [1, 1000], (args, l) => {
    const xs = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
    if (xs.length === 0) fail(`'${name}'-e kompokkhe ekta value dao`, l);
    xs.forEach((x) => needNum(name, x, l));
    return best(...xs);
  });
  pick('sorboccho', Math.max);
  pick('sornimno', Math.min);
  def('boro_hater', 1, ([s], l) => needStr('boro_hater', s, l).toUpperCase());
  def('chhoto_hater', 1, ([s], l) => needStr('chhoto_hater', s, l).toLowerCase());
  def('bhango', 2, ([s, sep], l) => needStr('bhango', s, l).split(needStr('bhango', sep, l)));
  def('jora', 2, ([list, sep], l) => needList('jora', list, l).map(show).join(needStr('jora', sep, l)));
  def('sonkhya', 1, ([x], l) => {
    if (typeof x === 'number') return x;
    if (typeof x === 'string' && x.trim() !== '' && !Number.isNaN(Number(x))) return Number(x);
    if (typeof x === 'boolean') return x ? 1 : 0;
    return null;
  });
  def('lekha', 1, ([x]) => show(x));
  def('dhoron', 1, ([x]) => typeName(x));
  return env;
}

function interpret(ast, { maxSteps = 200000, maxOutput = 1000, onPrint } = {}) {
  const output = [];
  let steps = 0;
  let depth = 0;
  const tick = (line) => {
    if (++steps > maxSteps) throw new AddaError('Onek beshi dhap hoye gelo, loop shesh hocche na?', line);
  };

  function num(op, a, b, line) {
    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new AddaError(`'${op}' sudhu number-er sathe chole`, line);
    }
  }

  function binop(op, a, b, line) {
    switch (op) {
      case '+':
        if (Array.isArray(a) && Array.isArray(b)) return [...a, ...b];
        if (typeof a === 'string' || typeof b === 'string') return show(a) + show(b);
        num(op, a, b, line); return a + b;
      case '-': num(op, a, b, line); return a - b;
      case '*': num(op, a, b, line); return a * b;
      case '/':
        num(op, a, b, line);
        if (b === 0) throw new AddaError('Shunno diye bhag kora jay na', line);
        return a / b;
      case '%':
        num(op, a, b, line);
        if (b === 0) throw new AddaError('Shunno diye bhag kora jay na', line);
        return a % b;
      case '<': num(op, a, b, line); return a < b;
      case '>': num(op, a, b, line); return a > b;
      case '<=': num(op, a, b, line); return a <= b;
      case '>=': num(op, a, b, line); return a >= b;
      case '==': return a === b;
      case '!=': return a !== b;
    }
    throw new AddaError(`Unknown operator '${op}'`, line);
  }

  function checkIndex(obj, idx, line) {
    if (typeof obj !== 'string' && !Array.isArray(obj)) {
      throw new AddaError('Position diye dekha jay sudhu lekha ba talika-te', line);
    }
    if (typeof idx !== 'number' || !Number.isInteger(idx)) {
      throw new AddaError('Position purno sonkhya hote hobe', line);
    }
    if (idx < 0 || idx >= obj.length) {
      throw new AddaError(`Position ${idx} baire, doirgho ${obj.length} (position 0 theke shuru)`, line);
    }
  }

  function callFunction(fn, args, line) {
    if (!isFn(fn)) throw new AddaError('Eta kaj noy, call kora jay na', line);
    tick(line);
    const [min, max] = Array.isArray(fn.arity) ? fn.arity : [fn.arity, fn.arity];
    if (fn.kind === 'native') {
      if (args.length < min || args.length > max) {
        throw new AddaError(`'${fn.name}'-e ${min} ta value dorkar, kintu ${args.length} ta dewa hoyeche`, line);
      }
      return fn.fn(args, line);
    }
    if (args.length !== fn.params.length) {
      throw new AddaError(`'${fn.name}'-e ${fn.params.length} ta value dorkar, kintu ${args.length} ta dewa hoyeche`, line);
    }
    if (depth >= MAX_DEPTH) throw new AddaError('Kaj onek gobhire chole gelo, nijeke bar bar dakchho?', line);
    const local = new Env(fn.closure);
    fn.params.forEach((name, i) => local.define(name, args[i], line));
    depth++;
    try {
      execBody(fn.body.body, local);
    } catch (e) {
      if (e instanceof ReturnSignal) return e.value;
      if (e instanceof BreakSignal || e instanceof ContinueSignal) {
        throw new AddaError("'thamo' / 'porerta' sudhu loop-er bhetore cholbe", line);
      }
      throw e;
    } finally {
      depth--;
    }
    return null;
  }

  function evaluate(n, env) {
    switch (n.type) {
      case 'Literal': return n.value;
      case 'List': return n.items.map((x) => evaluate(x, env));
      case 'Index': {
        const obj = evaluate(n.object, env);
        const idx = evaluate(n.index, env);
        checkIndex(obj, idx, n.line);
        return obj[idx];
      }
      case 'Call': {
        const fn = evaluate(n.callee, env);
        const args = n.args.map((a) => evaluate(a, env));
        return callFunction(fn, args, n.line);
      }
      case 'Var': return env.get(n.name, n.line);
      case 'Unary': {
        const v = evaluate(n.arg, env);
        if (n.op === '!') return !truthy(v);
        if (typeof v !== 'number') throw new AddaError("'-' sudhu number-er sathe chole", n.line);
        return -v;
      }
      case 'Logical': {
        const l = evaluate(n.left, env);
        if (n.op === '||') return truthy(l) ? l : evaluate(n.right, env);
        return truthy(l) ? evaluate(n.right, env) : l;
      }
      case 'Binary':
        return binop(n.op, evaluate(n.left, env), evaluate(n.right, env), n.line);
    }
    throw new AddaError(`Unknown expression '${n.type}'`);
  }

  function execBody(body, env) {
    for (const s of body) {
      if (s.type === 'Func') env.define(s.name, { kind: 'fn', name: s.name, params: s.params, body: s.body, closure: env }, s.line);
    }
    for (const s of body) exec(s, env);
  }

  function runLoopBody(body, env) {
    try { exec(body, env); }
    catch (e) {
      if (e instanceof BreakSignal) return 'break';
      if (e instanceof ContinueSignal) return 'continue';
      throw e;
    }
    return null;
  }

  function exec(n, env) {
    switch (n.type) {
      case 'Program': execBody(n.body, env); return;
      case 'Func': return;
      case 'Return': throw new ReturnSignal(n.value ? evaluate(n.value, env) : null);
      case 'IndexAssign': {
        tick(n.line);
        const obj = evaluate(n.target.object, env);
        const idx = evaluate(n.target.index, env);
        const v = evaluate(n.value, env);
        checkIndex(obj, idx, n.line);
        if (typeof obj === 'string') throw new AddaError('Lekha bodlano jay na, notun lekha banao', n.line);
        obj[idx] = n.op === '=' ? v : binop(n.op[0], obj[idx], v, n.line);
        return;
      }
      case 'For': {
        const loopEnv = new Env(env);
        if (n.init) exec(n.init, loopEnv);
        while (!n.test || truthy(evaluate(n.test, loopEnv))) {
          tick(n.line);
          if (runLoopBody(n.body, loopEnv) === 'break') break;
          if (n.update) exec(n.update, loopEnv);
        }
        return;
      }
      case 'ForEach': {
        const it = evaluate(n.iter, env);
        if (typeof it !== 'string' && !Array.isArray(it)) {
          throw new AddaError("'moddhe'-r pore talika ba lekha dite hobe", n.line);
        }
        for (const item of [...it]) {
          tick(n.line);
          const loopEnv = new Env(env);
          loopEnv.define(n.name, item, n.line);
          if (runLoopBody(n.body, loopEnv) === 'break') break;
        }
        return;
      }
      case 'Block': {
        const inner = new Env(env);
        execBody(n.body, inner);
        return;
      }
      case 'Let': tick(n.line); env.define(n.name, evaluate(n.init, env), n.line); return;
      case 'Assign': {
        tick(n.line);
        const v = evaluate(n.value, env);
        if (n.op === '=') env.set(n.name, v, n.line);
        else env.set(n.name, binop(n.op[0], env.get(n.name, n.line), v, n.line), n.line);
        return;
      }
      case 'Print': {
        tick(n.line);
        const text = n.args.map((a) => show(evaluate(a, env))).join(' ');
        if (output.length >= maxOutput) throw new AddaError('Output onek beshi hoye gelo', n.line);
        output.push(text);
        if (onPrint) onPrint(text);
        return;
      }
      case 'ExprStmt': tick(n.line); evaluate(n.expr, env); return;
      case 'If':
        tick(n.line);
        if (truthy(evaluate(n.test, env))) exec(n.then, env);
        else if (n.otherwise) exec(n.otherwise, env);
        return;
      case 'While':
        while (truthy(evaluate(n.test, env))) {
          tick(n.line);
          try { exec(n.body, env); }
          catch (e) {
            if (e instanceof BreakSignal) break;
            if (e instanceof ContinueSignal) continue;
            throw e;
          }
        }
        return;
      case 'Break': throw new BreakSignal();
      case 'Continue': throw new ContinueSignal();
    }
    throw new AddaError(`Unknown statement '${n.type}'`);
  }

  try {
    exec(ast, new Env(makeBuiltins()));
  } catch (e) {
    if (e instanceof ReturnSignal) {
      const err = new AddaError("'ferot' sudhu kaj-er bhetore cholbe");
      err.partialOutput = output;
      throw err;
    }
    if (e instanceof BreakSignal || e instanceof ContinueSignal) {
      const err = new AddaError("'thamo' / 'porerta' sudhu loop-er bhetore cholbe");
      err.partialOutput = output;
      throw err;
    }
    e.partialOutput = output;
    throw e;
  }
  return output;
}

module.exports = { interpret };

};
__defs["index"] = function (module, exports, require) {
const { AddaError } = require('./errors');
const { tokenize } = require('./lexer');
const { preprocess } = require('./preprocessor');
const { parse } = require('./parser');
const { interpret } = require('./interpreter');

function run(source, options = {}) {
  try {
    const { code, startLine } = preprocess(source);
    const ast = parse(tokenize(code, startLine));
    const output = interpret(ast, options);
    return { ok: true, output, error: null };
  } catch (e) {
    if (e instanceof AddaError) {
      return { ok: false, output: e.partialOutput || [], error: { message: e.message, line: e.line } };
    }
    if (e instanceof RangeError) {
      return { ok: false, output: [], error: { message: 'Expression onek beshi gobhir', line: null } };
    }
    throw e;
  }
}

module.exports = { run };

};
global.AddaLang = { run: __require('index').run };
})(typeof window !== "undefined" ? window : globalThis);
