const test = require('node:test');
const assert = require('node:assert');
const handler = require('../api/run');

function call(method, body, ip = '1.1.1.1') {
  return new Promise((resolve) => {
    const res = {
      headers: {}, statusCode: 200,
      setHeader(k, v) { this.headers[k] = v; },
      status(c) { this.statusCode = c; return this; },
      json(o) { resolve({ status: this.statusCode, body: o }); return this; },
      end() { resolve({ status: this.statusCode, body: null }); return this; },
    };
    handler({ method, body, headers: { 'x-forwarded-for': ip }, socket: {} }, res);
  });
}

test('POST /api/run code chalay', async () => {
  const r = await call('POST', { code: 'adda shuru\nbolo 1 + 2;\nadda shesh' }, '2.2.2.2');
  assert.strictEqual(r.status, 200);
  assert.deepStrictEqual(r.body.output, ['3']);
});

test('GET 405, code na dile 400, boro code 413', async () => {
  assert.strictEqual((await call('GET', undefined, '3.3.3.3')).status, 405);
  assert.strictEqual((await call('POST', {}, '3.3.3.3')).status, 400);
  assert.strictEqual((await call('POST', { code: 'x'.repeat(10001) }, '3.3.3.3')).status, 413);
});

test('rate limit 429', async () => {
  let last;
  for (let i = 0; i < 62; i++) last = await call('POST', { code: 'adda shuru adda shesh' }, '4.4.4.4');
  assert.strictEqual(last.status, 429);
});
