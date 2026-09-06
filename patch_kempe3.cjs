const fs = require('fs');
let code = fs.readFileSync('src/workers/quantum.ts', 'utf8');

code = code.replace('const TIMEOUT_MS = 10000;', 'const TIMEOUT_MS = 60000;');
code = code.replace('const TIMEOUT_MS = 3600000;', 'const TIMEOUT_MS = 60000;'); // just in case

const kempePattern = `if (useKempeChains && bestConflicts.length === 1 && Math.random() > 0.3) {`;
const newKempePattern = `if (useKempeChains && bestConflicts.length === 1) {`;

code = code.replace(kempePattern, newKempePattern);

fs.writeFileSync('src/workers/quantum.ts', code);
console.log('patched');
