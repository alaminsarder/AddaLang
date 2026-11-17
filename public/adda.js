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
__defs["lexer"] = function (module, exports, require) {
// Dhap 1: source code-ke token-e bhag kora
const { AddaError } = require('./errors');

const KEYWORDS = new Set([
  'dhoro', 'bolo', 'jodi', 'nahole', 'jotokkhon',
  'thamo', 'porerta', 'thik', 'bhul', 'khali',
]);
const TWO_CHAR = ['==', '!=', '<=', '>=', '&&', '||', '+=', '-=', '*=', '/='];
const ONE_CHAR = '+-*/%<>=!(){},;';
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

    // comment: // ...
    if (c === '/' && src[i + 1] === '/') {
      while (i < src.length && src[i] !== '\n') i++;
      continue;
    }

    // number
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

    // string
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

    // identifier / keyword
    if (isAlpha(c)) {
      let j = i;
      while (isAlnum(src[j])) j++;
      const word = src.slice(i, j);
      tokens.push({ type: KEYWORDS.has(word) ? 'kw' : 'id', value: word, line });
      i = j;
      continue;
    }

    // operators
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
// Dhap 2: token theke AST (syntax tree) banano (recursive descent)
const { AddaError } = require('./errors');

const ASSIGN_OPS = ['=', '+=', '-=', '*=', '/='];
const LITERAL_KW = ['thik', 'bhul', 'khali'];

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
    expectOp(';');
    return { type: 'ExprStmt', expr: e, line: t.line };
  }

  // ---- expressions (precedence: niche theke upore) ----
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
    return primary();
  }

  function primary() {
    const t = next();
    if (t.type === 'num' || t.type === 'str') return { type: 'Literal', value: t.value };
    if (t.type === 'kw' && LITERAL_KW.includes(t.value)) {
      return { type: 'Literal', value: t.value === 'thik' ? true : t.value === 'bhul' ? false : null };
    }
    if (t.type === 'id') return { type: 'Var', name: t.value, line: t.line };
    if (t.type === 'op' && t.value === '(') {
      const e = expr();
      expectOp(')');
      return e;
    }
    fail(`Expression ashha korechilam, kintu peyechi '${t.value}'`, t);
  }

  return program();
}

module.exports = { parse };

};
__defs["interpreter"] = function (module, exports, require) {
// Dhap 3: AST chalano (tree-walking interpreter)
const { AddaError } = require('./errors');

class BreakSignal {}
class ContinueSignal {}

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

function show(v) {
  if (v === true) return 'thik';
  if (v === false) return 'bhul';
  if (v === null || v === undefined) return 'khali';
  return String(v);
}

const truthy = (v) => !(v === null || v === false || v === 0 || v === '');

function interpret(ast, { maxSteps = 200000, maxOutput = 1000, onPrint } = {}) {
  const output = [];
  let steps = 0;
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

  function evaluate(n, env) {
    switch (n.type) {
      case 'Literal': return n.value;
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

  function exec(n, env) {
    switch (n.type) {
      case 'Program': n.body.forEach((s) => exec(s, env)); return;
      case 'Block': {
        const inner = new Env(env);
        n.body.forEach((s) => exec(s, inner));
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
    exec(ast, new Env());
  } catch (e) {
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
// Public API: run(source) -> { ok, output, error }
const { AddaError } = require('./errors');
const { tokenize } = require('./lexer');
const { parse } = require('./parser');
const { interpret } = require('./interpreter');

function extractProgram(source) {
  const m = /\badda\s+shuru\b([\s\S]*?)\badda\s+shesh\b/.exec(source);
  if (!m) throw new AddaError("Program 'adda shuru' diye shuru ar 'adda shesh' diye shesh korte hobe");
  const bodyStart = m.index + m[0].indexOf(m[1]);
  const startLine = source.slice(0, bodyStart).split('\n').length;
  return { code: m[1], startLine };
}

function run(source, options = {}) {
  try {
    const { code, startLine } = extractProgram(String(source));
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
