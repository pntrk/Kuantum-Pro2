const fs = require('fs');

let code = fs.readFileSync('src/workers/quantum.ts', 'utf8');

const targetStr = `
            if (isStrictlyImpossible) {
                removeFromUnplaced(c_id);
                continue;
            }
`;

const replaceStr = `
            if (isStrictlyImpossible || (!bestSlot && c.failCount > 100)) {
                // If it's strictly impossible OR it failed 100 times to find a non-locked slot
                console.log('Removing strictly impossible or stuck card:', c_id);
                removeFromUnplaced(c_id);
                continue;
            }
`;

if (code.includes(targetStr.trim())) {
    code = code.replace(targetStr.trim(), replaceStr.trim());
    fs.writeFileSync('src/workers/quantum.ts', code);
    console.log('patched strictly impossible');
} else {
    console.log('not found');
}
