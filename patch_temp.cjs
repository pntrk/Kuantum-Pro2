const fs = require('fs');

let code = fs.readFileSync('src/workers/quantum.ts', 'utf8');

code = code.replace(/const INITIAL_TEMP = 100\.0;/, 'const INITIAL_TEMP = 200.0;');
code = code.replace(/const COOLING_RATE = 0\.999;/, 'const COOLING_RATE = 0.9995;');

fs.writeFileSync('src/workers/quantum.ts', code);
console.log('patched temp');
