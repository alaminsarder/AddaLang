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
      return { type: 'Literal', value: t.value === 'thik' ? true : t.value === 'bhul' ? false : null };
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
