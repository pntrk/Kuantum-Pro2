const fs = require('fs');
let code = fs.readFileSync('src/workers/quantum.ts', 'utf8');

code = code.replace(/const addSubject = \(c_id, d, sId\) => \{[\s\S]*?const removeSubject = \(c_id, d, sId\) => \{[\s\S]*?else if\(map\) map\.set\(sId, count - 1\);\n    \};/g, `const addSubject = (c_id, d, sId) => {
        if (sId === -1) return;
        const map = classSubjectCounts[c_id]?.[d];
        if (map) map.set(sId, (map.get(sId) || 0) + 1);
    };

    const removeSubject = (c_id, d, sId) => {
        if (sId === -1) return;
        const map = classSubjectCounts[c_id]?.[d];
        const count = map ? (map.get(sId) || 0) : 0;
        if (count <= 1) {
            if (map) map.delete(sId);
        } else {
            if (map) map.set(sId, count - 1);
        }
    };`);

fs.writeFileSync('src/workers/quantum.ts', code);
