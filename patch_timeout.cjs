const fs = require('fs');
let code = fs.readFileSync('src/workers/quantum.ts', 'utf8');

code = code.replace(/const TIMEOUT_MS = \d+;/, 'const TIMEOUT_MS = 300000;');

fs.writeFileSync('src/workers/quantum.ts', code);
console.log('patched timeout to 5 mins');
