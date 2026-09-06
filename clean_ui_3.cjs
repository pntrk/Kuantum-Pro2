const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regexSartlar = /\{\/\* Şartlar Bölümü \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*<div className="flex gap-2">/;
code = code.replace(regexSartlar, '<div className="flex gap-2">');

fs.writeFileSync('src/App.tsx', code);
console.log("Cleaned UI completely");
