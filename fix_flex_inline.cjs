const fs = require('fs');
let code = fs.readFileSync('src/components/ExportReportingModal.tsx', 'utf-8');

code = code.replace(
  /isInline\n\s*\? "bg-white md:rounded-xl shadow-sm w-full flex flex-col h-full overflow-hidden border-0 md:border border-slate-200"\n\s*: "bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full md:max-w-6xl flex flex-col h-\[92vh\] overflow-hidden border border-slate-200 relative"/g,
  'isInline ? "bg-white md:rounded-xl shadow-sm w-full flex-1 flex flex-col h-full overflow-hidden border-0 md:border border-slate-200 min-h-0" : "bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full md:max-w-6xl flex flex-col h-[92vh] overflow-hidden border border-slate-200 relative min-h-0"'
);

fs.writeFileSync('src/components/ExportReportingModal.tsx', code);
console.log("Fixed flex-1 on inline modal.");
