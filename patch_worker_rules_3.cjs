const fs = require('fs');
let code = fs.readFileSync('src/workers/quantum.ts', 'utf8');

// Just replace checkRules entirely to return true
const regex = /const checkRules = \(c, d, p\) => \{[\s\S]*?return true;\s*\};\n/m;
code = code.replace(regex, 'const checkRules = (c, d, p) => {\n        return true;\n    };\n');

fs.writeFileSync('src/workers/quantum.ts', code);
console.log("Restored checkRules");
