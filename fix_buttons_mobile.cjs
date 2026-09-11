const fs = require('fs');
let code = fs.readFileSync('src/components/ExportReportingModal.tsx', 'utf-8');

// 1. Fix the Segmented Type Controls to wrap or scroll
// Replace the container to allow flex-wrap on mobile, or just use grid?
code = code.replace(
  /<div className="flex bg-slate-100 p-0\.5 rounded-xl w-full sm:w-auto shrink-0 shadow-2xs">/g,
  '<div className="flex flex-wrap sm:flex-nowrap bg-slate-100 p-0.5 rounded-xl w-full sm:w-auto shrink-0 shadow-2xs">'
);

// 2. Unhide "Çarşaf Liste" button
code = code.replace(
  /className=\{`hidden sm:flex items-center justify-center gap-1\.5 py-1\.5 px-3 md:px-4 rounded-lg font-bold text-xs transition-all \$\{/g,
  'className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-1.5 px-3 md:px-4 rounded-lg font-bold text-xs transition-all ${'
);

// 3. Unhide the Quick Action Export Buttons
code = code.replace(
  /<div className="hidden sm:flex items-center gap-1\.5 overflow-x-auto hide-scrollbar w-full sm:w-auto pt-1 sm:pt-0">/g,
  '<div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar w-full sm:w-auto pt-1 sm:pt-0 pb-1 sm:pb-0">'
);

fs.writeFileSync('src/components/ExportReportingModal.tsx', code);
console.log("Mobile buttons unhidden!");
