const fs = require('fs');
let code = fs.readFileSync('src/components/ExportReportingModal.tsx', 'utf-8');

// 1. Hide the "GÜN SEÇİNİZ" header in the day selector to save vertical space
code = code.replace(/<div className="text-\[11px\] font-bold text-slate-500 mb-2 flex items-center justify-between">/g, '<div className="text-[11px] font-bold text-slate-500 mb-1.5 hidden sm:flex items-center justify-between">');

// 2. Reduce padding in the day selector container
code = code.replace(/<div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-2xs">/g, '<div className="bg-slate-50 p-1.5 sm:p-2.5 rounded-xl border border-slate-200 shadow-2xs">');

// 3. Reduce padding in the day buttons
code = code.replace(/className={\`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all cursor-pointer active:scale-95 touch-manipulation/g, 'className={`flex flex-col items-center justify-center py-1 sm:py-2 px-0.5 sm:px-1 rounded-lg sm:rounded-xl border text-center transition-all cursor-pointer active:scale-95 touch-manipulation');

// 4. Reduce table header banner padding
code = code.replace(/<div className="bg-slate-900 text-white px-3.5 py-2.5 flex items-center justify-between">/g, '<div className="bg-slate-900 text-white px-2 py-1.5 sm:px-3.5 sm:py-2.5 flex items-center justify-between">');

// 5. Reduce table header cell padding
code = code.replace(/<th className="p-2.5/g, '<th className="p-1.5 sm:p-2.5');

// 6. Reduce table body cell padding
code = code.replace(/<td className="p-2 /g, '<td className="p-1 sm:p-2 ');
code = code.replace(/<td className="p-2"/g, '<td className="p-1 sm:p-2"');

// 7. Make empty slots smaller in height by reducing text sizes/paddings if possible.
// Currently empty slots say "Boş Saat" in italic. Let's make sure they are compact.
code = code.replace(/<span className="text-slate-400 font-normal italic text-\[11px\]">/g, '<span className="text-slate-400 font-normal italic text-[10px] sm:text-[11px]">');

fs.writeFileSync('src/components/ExportReportingModal.tsx', code);
console.log("Optimizations applied!");
