const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = '<div className="flex items-center gap-1.5 md:gap-3 mt-3 md:mt-0 w-full md:w-auto overflow-x-auto hide-scrollbar pb-1 md:pb-0 shrink-0 snap-x">';
const replacement = '<div className="flex items-center gap-1.5 md:gap-3 mt-3 md:mt-0 w-full md:w-auto overflow-x-auto md:overflow-visible hide-scrollbar pb-1 md:pb-0 shrink-0 snap-x">';

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Success patch file menu");
} else {
  console.log("target string not found.");
}
