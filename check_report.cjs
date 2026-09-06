const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const match = code.match(/const getConflictReport = \(\) => \{[\s\S]*?\};\n\n  const analyzeConflicts/);
if (match) {
    console.log(match[0]);
} else {
    console.log("Could not find getConflictReport");
}
