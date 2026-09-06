const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const lines = code.split('\n');

// Delete lines from 2415 to 2465 (inclusive)
// Since lines are 1-indexed, array index is line-1. So index 2414 to 2464.
lines.splice(2414, 2465 - 2415 + 1);

code = lines.join('\n');
fs.writeFileSync('src/App.tsx', code);
console.log("Deleted broken lines");
