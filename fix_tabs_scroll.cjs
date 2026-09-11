const fs = require('fs');
let code = fs.readFileSync('src/components/ExportReportingModal.tsx', 'utf-8');

// Make the Type Switcher Bar scrollable instead of wrapping to save vertical space
code = code.replace(
  /<div className="flex flex-wrap sm:flex-nowrap bg-slate-100 p-0\.5 rounded-xl w-full sm:w-auto shrink-0 shadow-2xs">/g,
  '<div className="flex flex-nowrap overflow-x-auto hide-scrollbar bg-slate-100 p-0.5 rounded-xl w-full sm:w-auto shrink-0 shadow-2xs">'
);

// Reduce padding in the Primary Type Switcher Bar on mobile
code = code.replace(
  /<div className="px-2\.5 py-1\.5 md:px-6 md:py-2\.5 bg-white border-t border-slate-100 flex flex-wrap gap-2 items-center justify-between">/g,
  '<div className="px-2.5 py-1 md:px-6 md:py-2.5 bg-white border-t border-slate-100 flex flex-nowrap overflow-x-auto hide-scrollbar gap-2 items-center justify-between">'
);

// Ensure the buttons don't shrink too much
code = code.replace(
  /className=\{`flex-1 sm:flex-none flex items-center justify-center gap-1\.5 py-1\.5 px-3 md:px-4 rounded-lg font-bold text-xs transition-all \$\{/g,
  'className={`flex-none flex items-center justify-center gap-1.5 py-1.5 px-3 md:px-4 rounded-lg font-bold text-xs transition-all ${'
);

fs.writeFileSync('src/components/ExportReportingModal.tsx', code);
console.log("Optimized tab bar layout.");
