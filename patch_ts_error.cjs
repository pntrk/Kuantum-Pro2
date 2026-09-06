const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/const span = parseInt\(cData\.span \|\| cData\.hours \|\| 1, 10\);/g, "const span = parseInt(cData.span || (cData as any).hours || 1, 10);");

fs.writeFileSync('src/App.tsx', content);
console.log("Success patching ts error");
