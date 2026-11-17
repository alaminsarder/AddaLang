#!/usr/bin/env node
// CLI: node bin/adda.js examples/hello.adda
const fs = require('fs');
const { run } = require('../src/index');

const file = process.argv[2];
if (!file) {
  console.error('Byabohar: adda <file.adda>');
  process.exit(1);
}
const result = run(fs.readFileSync(file, 'utf8'));
result.output.forEach((l) => console.log(l));
if (!result.ok) {
  const at = result.error.line ? ` (line ${result.error.line})` : '';
  console.error(`Bhul${at}: ${result.error.message}`);
  process.exit(1);
}
