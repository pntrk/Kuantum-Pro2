const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const parseCellData =')) {
        console.log(lines.slice(i, i+15).join('\n'));
        break;
    }
}
