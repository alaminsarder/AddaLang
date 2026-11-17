
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const order = ['errors', 'lexer', 'parser', 'interpreter', 'index'];

let out = '// AddaLang browser bundle: scripts/build.js diye toiri. Eta hate edit koro na.\n';
out += '(function (global) {\n"use strict";\nconst __defs = {}, __cache = {};\n';
out += 'function __require(name) {\n';
out += "  const key = name.replace(/^\\.\\//, '').replace(/\\.js$/, '');\n";
out += '  if (__cache[key]) return __cache[key].exports;\n';
out += '  const module = { exports: {} };\n  __cache[key] = module;\n';
out += '  __defs[key](module, module.exports, __require);\n  return module.exports;\n}\n';

for (const name of order) {
  const code = fs.readFileSync(path.join(root, 'src', name + '.js'), 'utf8');
  out += `__defs[${JSON.stringify(name)}] = function (module, exports, require) {\n${code}\n};\n`;
}
out += "global.AddaLang = { run: __require('index').run };\n";
out += '})(typeof window !== "undefined" ? window : globalThis);\n';

fs.writeFileSync(path.join(root, 'public', 'adda.js'), out);
console.log('public/adda.js toiri hoyeche (' + out.length + ' byte)');
