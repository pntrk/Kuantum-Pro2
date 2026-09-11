const fs = require('fs');
let code = fs.readFileSync('src/components/ExportReportingModal.tsx', 'utf-8');

// Hide Export Buttons on Mobile
code = code.replace(
  /<div className="flex items-center gap-1\.5 overflow-x-auto hide-scrollbar w-full sm:w-auto pt-1 sm:pt-0 pb-1 sm:pb-0">/g,
  '<div className="hidden sm:flex items-center gap-1.5 overflow-x-auto hide-scrollbar w-full sm:w-auto pt-1 sm:pt-0 pb-1 sm:pb-0">'
);

fs.writeFileSync('src/components/ExportReportingModal.tsx', code);
console.log("Hidden export buttons on mobile.");
