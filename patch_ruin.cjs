const fs = require('fs');

let code = fs.readFileSync('src/workers/quantum.ts', 'utf8');

code = code.replace('iter - lastImprovement > 60000', 'iter - lastImprovement > 150000');
code = code.replace('iter - lastImprovement > 25000', 'iter - lastImprovement > 70000');
code = code.replace('const ruinCount = Math.floor(placedCards.length * 0.9);', 'const ruinCount = Math.floor(placedCards.length * 0.5);');
code = code.replace('const baseFraction = Math.min(0.55, 0.08 + 0.06 * ruinStreak);', 'const baseFraction = Math.min(0.35, 0.05 + 0.03 * ruinStreak);');
code = code.replace('iter - lastImprovement > 12000', 'iter - lastImprovement > 10000');

fs.writeFileSync('src/workers/quantum.ts', code);
console.log('patched ruin rates');
