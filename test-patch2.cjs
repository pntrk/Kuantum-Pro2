const fs = require('fs');
let code = fs.readFileSync('src/workers/quantum.ts', 'utf8');

code = code.replace(
`    const isSoftConflict = (c, d, p) => {
        // e.g., if there's already this subject on the day, it's a soft conflict
        const subMasks = subjectConstraintsMask.get(c.mappedSubject);
        const mask = ((1 << c.hours) - 1) << p;
        if (subMasks && (subMasks[d] & mask) !== 0) return true;`,
`    const isSoftConflict = (c, d, p) => {
        // e.g., if there's already this subject on the day, it's a soft conflict`
);

fs.writeFileSync('src/workers/quantum.ts', code);
