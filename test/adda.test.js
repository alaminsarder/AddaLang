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

test('kaj ar ferot, recursion', () => {
  const r = run(wrap('kaj fib(n) { jodi (n < 2) { ferot n; } ferot fib(n - 1) + fib(n - 2); } bolo fib(10);'));
  assert.deepStrictEqual(r.output, ['55']);
});

test('kaj niche likhleo uporey dakha jay', () => {
  assert.deepStrictEqual(run(wrap('bolo dim(4); kaj dim(x) { ferot x * 2; }')).output, ['8']);
});

test('closure: kaj nijer scope-er variable dhore rakhe', () => {
  const r = run(wrap('kaj toiri() { dhoro n = 0; kaj ber() { n += 1; ferot n; } ferot ber; } dhoro k = toiri(); k(); bolo k();'));
  assert.deepStrictEqual(r.output, ['2']);
});

test('ferot chhara kaj khali dey', () => {
  assert.deepStrictEqual(run(wrap('kaj f() { } bolo f();')).output, ['khali']);
});

test('onek gobhir recursion thame', () => {
  const r = run(wrap('kaj f(n) { ferot f(n + 1); } f(0);'));
  assert.strictEqual(r.ok, false);
});

test('argument songkha na mille bhul', () => {
  const r = run(wrap('kaj f(a, b) { ferot a; } bolo f(1);'));
  assert.strictEqual(r.ok, false);
});

test('talika: toiri, position, bodlano, jogkoro', () => {
  const r = run(wrap('dhoro a = [10, 20]; jogkoro(a, 30); a[0] += 1; bolo a, a[2], doirgho(a);'));
  assert.deepStrictEqual(r.output, ['[11, 20, 30] 30 3']);
});

test('talika-r baire position bhul dey', () => {
  const r = run(wrap('bolo [1, 2][2];'));
  assert.strictEqual(r.ok, false);
});

test('talika jora, string index', () => {
  assert.deepStrictEqual(run(wrap('bolo [1, 2] + [3], "adda"[0];')).output, ['[1, 2, 3] a']);
});

test('proti: C-style ar moddhe', () => {
  const r = run(wrap('dhoro s = 0; proti (dhoro i = 1; i <= 4; i += 1) { jodi (i == 3) { porerta; } s += i; } bolo s; proti (x moddhe porisima(3)) { bolo x; }'));
  assert.deepStrictEqual(r.output, ['7', '0', '1', '2']);
});

test('proti-te thamo', () => {
  const r = run(wrap('proti (x moddhe [1, 2, 3, 4]) { jodi (x == 3) { thamo; } bolo x; }'));
  assert.deepStrictEqual(r.output, ['1', '2']);
});

test('built-in function', () => {
  const r = run(wrap('bolo borgomul(16), niche(2.7), upore(2.1), sorboccho(3, 9, 4), boro_hater("ab"), jora(bhango("a,b", ","), "+"), sonkhya("5") + 1, dhoron([]), ache([1, 2], 2), jora(sajao([3, 1, 2]), ""), ulto("abc");'));
  assert.deepStrictEqual(r.output, ['4 2 3 9 AB a+b 6 talika thik 123 cba']);
});

test('ferot kaj-er baire bhul', () => {
  assert.strictEqual(run(wrap('ferot 1;')).ok, false);
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

// --- preprocessor ar mapping ---
const { preprocess } = require('../src/preprocessor');
const mapping = require('../src/mapping');

test('preprocessor: CRLF ar BOM, line number thik thake', () => {
  const src = '\uFEFFadda shuru\r\nbolo 1;\r\nbolo x;\r\nadda shesh';
  const r = run(src);
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.error.line, 3);
});

test('preprocessor: adda shuru/shesh-er baire ignore, startLine thik', () => {
  const { code, startLine } = preprocess('ja khushi\nadda shuru\nbolo 1;\nadda shesh\nabar jaa khushi');
  assert.strictEqual(code.trim(), 'bolo 1;');
  assert.strictEqual(startLine, 2);
});

test('preprocessor: adda shuru na thakle error', () => {
  assert.throws(() => preprocess('bolo 1;'), /adda shuru/);
});

test('mapping: keyword ar literal', () => {
  assert.ok(mapping.KEYWORDS.has('dhoro'));
  assert.strictEqual(mapping.KEYWORD_MAP.jodi, 'if');
  assert.deepStrictEqual(mapping.LITERAL_MAP, { thik: true, bhul: false, khali: null });
});
