const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const idx = code.indexOf("import React");
code = code.substring(idx);
fs.writeFileSync('src/App.tsx', code);
