const { AddaError } = require('./errors');

class BreakSignal {}
class ContinueSignal {}
<<<<<<< HEAD
class ReturnSignal { constructor(value) { this.value = value; } }

const MAX_DEPTH = 150;
const MAX_RANGE = 100000;
=======
>>>>>>> origin/main

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

<<<<<<< HEAD
const isFn = (v) => v !== null && typeof v === 'object' && (v.kind === 'fn' || v.kind === 'native');

=======
>>>>>>> origin/main
function show(v) {
  if (v === true) return 'thik';
  if (v === false) return 'bhul';
  if (v === null || v === undefined) return 'khali';
<<<<<<< HEAD
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
=======
  return String(v);
}

const truthy = (v) => !(v === null || v === false || v === 0 || v === '');
>>>>>>> origin/main

function interpret(ast, { maxSteps = 200000, maxOutput = 1000, onPrint } = {}) {
  const output = [];
  let steps = 0;
<<<<<<< HEAD
  let depth = 0;
=======
>>>>>>> origin/main
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
<<<<<<< HEAD
        if (Array.isArray(a) && Array.isArray(b)) return [...a, ...b];
=======
>>>>>>> origin/main
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

<<<<<<< HEAD
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
=======
  function evaluate(n, env) {
    switch (n.type) {
      case 'Literal': return n.value;
>>>>>>> origin/main
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

<<<<<<< HEAD
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
=======
  function exec(n, env) {
    switch (n.type) {
      case 'Program': n.body.forEach((s) => exec(s, env)); return;
      case 'Block': {
        const inner = new Env(env);
        n.body.forEach((s) => exec(s, inner));
>>>>>>> origin/main
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
<<<<<<< HEAD
    exec(ast, new Env(makeBuiltins()));
  } catch (e) {
    if (e instanceof ReturnSignal) {
      const err = new AddaError("'ferot' sudhu kaj-er bhetore cholbe");
      err.partialOutput = output;
      throw err;
    }
=======
    exec(ast, new Env());
  } catch (e) {
>>>>>>> origin/main
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
