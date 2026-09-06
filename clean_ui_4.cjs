const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regexSartlar = /<div className="space-y-2">[\s\S]*?<\/div>/;
code = code.replace(regexSartlar, '');

fs.writeFileSync('src/App.tsx', code);
console.log("Cleaned UI completely 4");
