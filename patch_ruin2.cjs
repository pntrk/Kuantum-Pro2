const fs = require('fs');
let code = fs.readFileSync('src/workers/quantum.ts', 'utf8');

code = code.replace('iter - lastImprovement > 150000', 'iter - lastImprovement > 200000');
code = code.replace('iter - lastImprovement > 70000', 'iter - lastImprovement > 40000');
code = code.replace('const ruinCount = Math.floor(placedCards.length * 0.5);', 'const ruinCount = Math.floor(placedCards.length * 0.65);');
code = code.replace('const baseFraction = Math.min(0.35, 0.05 + 0.03 * ruinStreak);', 'const baseFraction = Math.min(0.65, 0.10 + 0.05 * ruinStreak);');
code = code.replace('iter - lastImprovement > 10000', 'iter - lastImprovement > 12000');

fs.writeFileSync('src/workers/quantum.ts', code);
console.log('patched ruin rates 2');
