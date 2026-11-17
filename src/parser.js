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
