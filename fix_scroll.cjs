const fs = require('fs');
let code = fs.readFileSync('src/components/ExportReportingModal.tsx', 'utf-8');

// Add min-h-0 to the flex-1 overflow-y-auto container
code = code.replace(
  /<div className="flex-1 bg-slate-100 p-0 sm:p-4 md:p-6 overflow-y-auto print:p-0 print:bg-white print:overflow-visible custom-scrollbar">/g,
  '<div className="flex-1 min-h-0 bg-slate-100 p-0 sm:p-4 md:p-6 overflow-y-auto print:p-0 print:bg-white print:overflow-visible custom-scrollbar">'
);

fs.writeFileSync('src/components/ExportReportingModal.tsx', code);
console.log("Added min-h-0 to scrollable container.");
