const { run } = require('../src/index');

const MAX_CODE = 10000;
const WINDOW_MS = 60 * 1000;
const LIMIT = 60;
const hits = new Map(); // ip -> { count, reset }  (best-effort, instance-wise)

function limited(ip) {
  const now = Date.now();
  if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
  let h = hits.get(ip);
  if (!h || h.reset < now) { h = { count: 0, reset: now + WINDOW_MS }; hits.set(ip, h); }
  return ++h.count > LIMIT;
}

const fail = (res, status, message) =>
  res.status(status).json({ ok: false, output: [], error: { message, line: null } });

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return fail(res, 405, 'Shudhu POST cholbe');

  const ip = String((req.headers['x-forwarded-for'] || '').split(',')[0] || req.socket?.remoteAddress || 'unknown').trim();
  if (limited(ip)) return fail(res, 429, 'Onek beshi request, ektu pore abar chesta koro');

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
  const code = body && body.code;
  if (typeof code !== 'string') return fail(res, 400, "'code' string hishebe pathao");
  if (code.length > MAX_CODE) return fail(res, 413, 'Code 10,000 akkhor-er beshi hote parbe na');

  return res.status(200).json(run(code));
};
