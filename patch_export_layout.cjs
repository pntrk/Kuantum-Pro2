const fs = require('fs');
let code = fs.readFileSync('src/components/ExportReportingModal.tsx', 'utf8');

code = code.replace(
  '<div className="flex flex-1 overflow-hidden">',
  '<div className="flex flex-col md:flex-row flex-1 overflow-hidden">'
);

code = code.replace(
  '<div className="w-72 border-r border-slate-100 bg-slate-50/30 flex flex-col p-4 gap-6 overflow-y-auto print:hidden">',
  '<div className="w-full md:w-72 shrink-0 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/30 flex flex-col p-4 gap-4 md:gap-6 overflow-y-auto print:hidden max-h-[40vh] md:max-h-none">'
);

fs.writeFileSync('src/components/ExportReportingModal.tsx', code);
console.log("Success patch export layout");
