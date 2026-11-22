const { AddaError } = require('./errors');
const { PROGRAM_WORD, PROGRAM_START, PROGRAM_END } = require('./mapping');

// Preprocessor: lexer-er age source-ke porishkar kore.
// 1. BOM soriye dey, CRLF/CR ke LF kore (line sonkhya ager moto thake)
// 2. 'adda shuru' ... 'adda shesh'-er bhetorer code ber kore, baire ja ache ignore
// 3. Code ar tar shuru line number fera dey, jate error-e thik line dekhano jay
function normalize(source) {
  return String(source).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
}

function extractProgram(source) {
  const re = new RegExp(`\\b${PROGRAM_WORD}\\s+${PROGRAM_START}\\b([\\s\\S]*?)\\b${PROGRAM_WORD}\\s+${PROGRAM_END}\\b`);
  const m = re.exec(source);
  if (!m) {
    throw new AddaError(`Program '${PROGRAM_WORD} ${PROGRAM_START}' diye shuru ar '${PROGRAM_WORD} ${PROGRAM_END}' diye shesh korte hobe`);
  }
  const bodyStart = m.index + m[0].indexOf(m[1]);
  const startLine = source.slice(0, bodyStart).split('\n').length;
  return { code: m[1], startLine };
}

function preprocess(source) {
  return extractProgram(normalize(source));
}

module.exports = { preprocess, normalize, extractProgram };
