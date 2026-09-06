const fs = require('fs');

let code = fs.readFileSync('src/workers/quantum.ts', 'utf8');

const targetStr = `
            if (isStrictlyImpossible || (!bestSlot && c.failCount > 100)) {
                // If it's strictly impossible OR it failed 100 times to find a non-locked slot
                console.log('Removing strictly impossible or stuck card:', c_id);
                removeFromUnplaced(c_id);
                continue;
            }
`;

const replaceStr = `
            if (isStrictlyImpossible || !bestSlot) {
                // If strictly impossible or no slot, just increment failCount heavily.
                c.failCount += 10;
                // DO NOT remove from unplaced, force engine to ruin and rethink
                continue;
            }
`;

code = code.replace(targetStr.trim(), replaceStr.trim());

// Also remove TIMEOUT
code = code.replace(/const TIMEOUT_MS = \d+;/, 'const TIMEOUT_MS = 86400000; // 24 hours for 100% search');

fs.writeFileSync('src/workers/quantum.ts', code);
console.log('patched strictly impossible 2');
