const { AddaError } = require('./errors');
const { tokenize } = require('./lexer');
const { preprocess } = require('./preprocessor');
const { parse } = require('./parser');
const { interpret } = require('./interpreter');

function run(source, options = {}) {
  try {
    const { code, startLine } = preprocess(source);
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
