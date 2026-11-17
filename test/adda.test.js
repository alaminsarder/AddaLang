const test = require('node:test');
const assert = require('node:assert');
const { run } = require('../src/index');

const wrap = (body) => `adda shuru\n${body}\nadda shesh`;

test('print ar arithmetic', () => {
  assert.deepStrictEqual(run(wrap('bolo "Jog:", 5 + 7 * 2;')).output, ['Jog: 19']);
});

test('boolean ar null', () => {
  assert.deepStrictEqual(run(wrap('bolo thik, bhul, khali, 3 > 2;')).output, ['thik bhul khali thik']);
});

test('jodi / nahole jodi / nahole', () => {
  const r = run(wrap('dhoro a = 30; jodi (a < 20) { bolo "A"; } nahole jodi (a < 40) { bolo "B"; } nahole { bolo "C"; }'));
  assert.deepStrictEqual(r.output, ['B']);
});

test('loop, thamo, porerta', () => {
  const r = run(wrap('dhoro i = 0; jotokkhon (i < 10) { i += 1; jodi (i == 2) { porerta; } jodi (i == 4) { thamo; } bolo i; }'));
  assert.deepStrictEqual(r.output, ['1', '3']);
});

test('infinite loop thame', () => {
  assert.strictEqual(run(wrap('jotokkhon (thik) { }')).ok, false);
});

test('error-e line number thake', () => {
  const r = run(wrap('bolo 1;\nbolo x;'));
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.error.line, 3);
});

test('adda shuru chhara error', () => {
  assert.strictEqual(run('bolo 1;').ok, false);
});

test('browser bundle (public/adda.js) eki fol dey', () => {
  const vm = require('node:vm');
  const fs = require('node:fs');
  const path = require('node:path');
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'public', 'adda.js'), 'utf8'), ctx);
  const r = ctx.AddaLang.run(wrap('bolo "Jog:", 5 + 7 * 2;'));
  assert.deepStrictEqual(Array.from(r.output), ['Jog: 19']);
});
