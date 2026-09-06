const fs = require('fs');

let code = fs.readFileSync('src/workers/quantum.ts', 'utf8');

code = code.replace('iter - lastImprovement > 200000', 'iter - lastImprovement > 80000');
code = code.replace('iter - lastImprovement > 40000', 'iter - lastImprovement > 25000');
code = code.replace('iter - lastImprovement > 12000', 'iter - lastImprovement > 6000');
code = code.replace('const INITIAL_TEMP = 200.0;', 'const INITIAL_TEMP = 300.0;');
code = code.replace('const COOLING_RATE = 0.9995;', 'const COOLING_RATE = 0.9999;');

fs.writeFileSync('src/workers/quantum.ts', code);
console.log('patched ruin fast');
