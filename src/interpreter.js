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
