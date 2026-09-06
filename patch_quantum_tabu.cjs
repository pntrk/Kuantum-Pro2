const fs = require('fs');

let code = fs.readFileSync('src/workers/quantum.ts', 'utf8');
code = code.replace(/if \(c\.failCount > 30\) isTabu = false;/g, 'if (c.failCount > 15) isTabu = false;');
code = code.replace(/const conflicts = getConflictsAdvanced\(c, dIdx, p, useSoftConstraints && c\.failCount > 10\);/g, 'const conflicts = getConflictsAdvanced(c, dIdx, p, useSoftConstraints && c.failCount > 5);');

fs.writeFileSync('src/workers/quantum.ts', code);
console.log('patched tabu limits');
