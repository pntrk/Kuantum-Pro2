const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `className="absolute right-0 top-full mt-2 w-56 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-100/50 backdrop-blur-md z-[70] overflow-hidden"`;
const replacement = `className="fixed right-4 top-[100px] md:absolute md:right-0 md:top-full mt-2 w-56 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-100/50 backdrop-blur-md z-[70] overflow-hidden"`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Success patch motion div");
} else {
  console.log("target string not found.");
}
