const fs = require('fs');
let code = fs.readFileSync('src/components/ExportReportingModal.tsx', 'utf-8');

// Add pb-16 (4rem / 64px) on mobile specifically for bottom breathing room
code = code.replace(
  /<div className="flex-1 min-h-0 bg-slate-100 p-0 sm:p-4 md:p-6 overflow-y-auto print:p-0 print:bg-white print:overflow-visible custom-scrollbar">/g,
  '<div className="flex-1 min-h-0 bg-slate-100 p-0 pb-16 sm:p-4 md:p-6 overflow-y-auto print:p-0 print:bg-white print:overflow-visible custom-scrollbar">'
);

fs.writeFileSync('src/components/ExportReportingModal.tsx', code);
console.log("Added bottom padding to scrollable container.");
