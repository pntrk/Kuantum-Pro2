const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                 card.rooms?.forEach(r => {
                     if(constraints.rooms?.[r]?.includes(\`\${absDIdx}-\${pIdx}\`)) isClosed = true;
                     if(roomSchedules[r]?.[absDIdx]?.[pIdx]) isBusy = true;
                 });
                 if (!isClosed && !isBusy) {`;

const rep = `                 card.rooms?.forEach(r => {
                     if(constraints.rooms?.[r]?.includes(\`\${absDIdx}-\${pIdx}\`)) isClosed = true;
                     if(roomSchedules[r]?.[absDIdx]?.[pIdx]) isBusy = true;
                 });
                 if (constraints.subjects?.[card.subject]?.includes(\`\${absDIdx}-\${pIdx}\`)) isClosed = true;
                 
                 if (!isClosed && !isBusy) {`;

if (code.includes(target)) {
    code = code.replace(target, rep);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Patched getConflictReport");
} else {
    console.log("Target not found");
}
