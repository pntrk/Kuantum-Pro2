const fs = require('fs');
let code = fs.readFileSync('src/workers/quantum.ts', 'utf8');

code = code.replace(/const map = classSubjectCounts\[c_id\]\[d\];/g, `const map = classSubjectCounts[c_id]?.[d];
        if (!map) {
            throw new Error(\`Debug: c_id=\${c_id}, d=\${d}, C_count=\${C_count}, len=\${classSubjectCounts.length}, inner=\${classSubjectCounts[c_id] ? classSubjectCounts[c_id].length : 'null'}\`);
        }`);
            
fs.writeFileSync('src/workers/quantum.ts', code);
