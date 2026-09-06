const fs = require('fs');
let code = fs.readFileSync('src/workers/quantum.ts', 'utf8');

code = code.replace(
`        const subMasks = subjectConstraintsMask.get(c.mappedSubject);
        if (!allowSoft && subMasks && (subMasks[d] & mask) !== 0) return null;`,
`        const subMasks = subjectConstraintsMask.get(c.mappedSubject);
        if (subMasks && (subMasks[d] & mask) !== 0) return null;`
);

fs.writeFileSync('src/workers/quantum.ts', code);
