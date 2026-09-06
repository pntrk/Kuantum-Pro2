const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `<div className="flex-1 overflow-hidden p-2 md:p-4 pb-4">`;
const replacement = `<div className="flex-1 overflow-hidden p-0 md:p-4 md:pb-4">`;

if(code.includes(targetStr)) {
  code = code.replace(targetStr, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Success patch padding");
}

