const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');
file = file.replace('const TIMEOUT_MS = 15000;', 'const TIMEOUT_MS = 30000;');
file = file.replace('} else if (iter - lastImprovement > 100000) {', '} else if (iter - lastImprovement > 40000) {');
fs.writeFileSync('src/App.tsx', file);
