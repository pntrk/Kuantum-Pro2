const fs = require('fs');

// Fix quantum.ts
let workerCode = fs.readFileSync('src/workers/quantum.ts', 'utf8');
workerCode = workerCode.replace(
    '        constraints\n    } = e.data;',
    '        constraints,\n        distributionRules\n    } = e.data;'
);
// Fix hasSubj
workerCode = workerCode.replace('if (hasSubj) continue;', 'if (hasSubj) continue;'); // let's see what is on line 519
fs.writeFileSync('src/workers/quantum.ts', workerCode);
console.log("Worker vars fixed partially");
