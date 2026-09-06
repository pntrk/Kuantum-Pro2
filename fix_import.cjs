const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace("ZoomIn, ZoomOut, Cpu }", "ZoomIn, ZoomOut, Cpu, Brain }");
fs.writeFileSync('src/App.tsx', code);
console.log('Fixed import');
