const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `<div className="bg-slate-950 text-white p-3 md:p-4 shadow-xl border-b border-white/5 shrink-0 flex flex-col md:flex-row justify-between items-center relative z-[60]">`;
const replacement = `      {/* @locked: User requested to permanently keep this header layout structure intact. Do not remove or alter the sub-menu, duty, matrix, file ops, or export tabs. */}
      <div className="bg-slate-950 text-white p-3 md:p-4 shadow-xl border-b border-white/5 shrink-0 flex flex-col md:flex-row justify-between items-center relative z-[60]">`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Success patch comment");
} else {
  console.log("target string not found.");
}
