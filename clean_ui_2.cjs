const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regexSartlar = /\{\/\* Şartlar Bölümü \*\/\}[\s\S]*?<\/div>\s*<\/motion.div>\s*\}\)\s*<\/AnimatePresence>\s*<\/div>/;
code = code.replace(regexSartlar, '');
fs.writeFileSync('src/App.tsx', code);
console.log("Cleaned Şartlar UI");
