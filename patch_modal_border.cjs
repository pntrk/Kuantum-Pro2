const fs = require('fs');
let code = fs.readFileSync('src/components/ExportReportingModal.tsx', 'utf8');

const targetStr = `className={isInline ? "bg-white rounded-xl shadow-sm w-full flex flex-col h-full overflow-hidden border border-slate-200" : "bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col h-[90vh] overflow-hidden border border-slate-200"}`;
const replacement = `className={isInline ? "bg-white md:rounded-xl shadow-sm w-full flex flex-col h-full overflow-hidden border-t md:border border-slate-200" : "bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col h-[90vh] overflow-hidden border border-slate-200"}`;

if(code.includes(targetStr)) {
  code = code.replace(targetStr, replacement);
  fs.writeFileSync('src/components/ExportReportingModal.tsx', code);
  console.log("Success patch border");
}

