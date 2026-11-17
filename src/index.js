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
