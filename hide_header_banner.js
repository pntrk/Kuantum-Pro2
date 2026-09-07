import fs from 'fs';

let content = fs.readFileSync('src/components/ExportReportingModal.tsx', 'utf8');

// 1. Add hidden to Header Document Banner on mobile
content = content.replace(
  /<div className="flex flex-col items-center text-center border-b-2 border-slate-800 pb-3 mb-3 md:pb-4 md:mb-4">/,
  `<div className="hidden sm:flex flex-col items-center text-center border-b-2 border-slate-800 pb-3 mb-3 md:pb-4 md:mb-4">`
);

// 2. Reduce padding around printable schedule area on mobile for maximum space
content = content.replace(
  /className="bg-white p-3 sm:p-6 md:p-8 shadow-md md:shadow-lg rounded-xl md:rounded-2xl print:shadow-none print:p-0 print:m-0 w-full max-w-\[1050px\] mx-auto min-h-\[300px\] md:min-h-\[500px\]"/,
  `className="bg-white p-1.5 sm:p-6 md:p-8 shadow-md md:shadow-lg rounded-xl md:rounded-2xl print:shadow-none print:p-0 print:m-0 w-full max-w-[1050px] mx-auto min-h-[300px] md:min-h-[500px]"`
);

// 3. Reduce padding in main content area
content = content.replace(
  /className="flex-1 bg-slate-100 p-2 sm:p-4 md:p-6 overflow-y-auto print:p-0 print:bg-white print:overflow-visible custom-scrollbar"/,
  `className="flex-1 bg-slate-100 p-1 sm:p-4 md:p-6 overflow-y-auto print:p-0 print:bg-white print:overflow-visible custom-scrollbar"`
);

fs.writeFileSync('src/components/ExportReportingModal.tsx', content);
console.log('Header banner hidden on mobile and layout optimized.');
