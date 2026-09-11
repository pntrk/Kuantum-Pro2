const fs = require('fs');
let code = fs.readFileSync('src/components/ExportReportingModal.tsx', 'utf-8');

// 1. Remove horizontal scroll wrapping if present, or make it less likely to trigger by allowing tight squeezing
// Change <div className="overflow-x-auto"> to <div className="w-full overflow-hidden"> so it forces the table to squeeze in. Actually, overflow-x-auto is safer if it really overflows, but we want it to fit.
// Let's modify the table classes to force fit on mobile.

code = code.replace(/<table className="w-full text-left text-xs border-collapse">/, '<table className="w-full text-left text-[10px] sm:text-xs border-collapse break-words">');

// 2. Reduce the width of the first column header on mobile
code = code.replace(/<th className="p-1.5 sm:p-2.5 text-center w-24">/, '<th className="p-1 sm:p-2.5 text-center w-12 sm:w-24 leading-tight">');
code = code.replace(/<th className="p-1.5 sm:p-2.5">Ders Adı<\/th>/, '<th className="p-1 sm:p-2.5 leading-tight">Ders Adı</th>');
code = code.replace(/<th className="p-1.5 sm:p-2.5">(\s*)\{(exportType[\s\S]*?)\}(\s*)<\/th>/, '<th className="p-1 sm:p-2.5 leading-tight">$1{$2}$3</th>');
code = code.replace(/<th className="p-1.5 sm:p-2.5 text-center">(\s*)Derslik(\s*)<\/th>/, '<th className="p-1 sm:p-2.5 text-center leading-tight">$1Derslik$2</th>');
code = code.replace(/<tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-extrabold text-\[11px\]">/, '<tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-extrabold text-[9px] sm:text-[11px]">');

// 3. Make text tighter inside the cells
code = code.replace(/<span className="text-indigo-700 font-black text-xs">/g, '<span className="text-indigo-700 font-black text-[10px] sm:text-xs">');
code = code.replace(/<span className="text-\[9.5px\] text-slate-500 font-medium whitespace-nowrap">/g, '<span className="text-[8px] sm:text-[9.5px] text-slate-500 font-medium tracking-tighter">');
code = code.replace(/<span className="text-xs font-black text-indigo-950">/g, '<span className="text-[10px] sm:text-xs font-black text-indigo-950 leading-tight">');
code = code.replace(/<td className="p-1 sm:p-2 align-middle text-slate-800 font-bold text-xs">/g, '<td className="p-1 sm:p-2 align-middle text-slate-800 font-bold text-[10px] sm:text-xs leading-tight">');

// 4. Reduce padding in the #printable-schedule-area to give more space for the table on mobile
code = code.replace(/id="printable-schedule-area"\s*className="bg-white p-1.5 sm:p-6 md:p-8 shadow-md md:shadow-lg rounded-xl md:rounded-2xl print:shadow-none print:p-0 print:m-0 w-full max-w-7xl mx-auto min-h-\[300px\] md:min-h-\[500px\]"/, 'id="printable-schedule-area"\n              className="bg-white p-0 sm:p-6 md:p-8 shadow-none sm:shadow-md md:shadow-lg rounded-none sm:rounded-xl md:rounded-2xl print:shadow-none print:p-0 print:m-0 w-full max-w-7xl mx-auto min-h-[300px] md:min-h-[500px]"');

// 5. Also make the "Derslik" badge tighter on mobile
code = code.replace(/<span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold text-\[10px\]">/g, '<span className="inline-flex items-center gap-0.5 sm:gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-1 sm:px-2 py-0.5 rounded font-bold text-[8px] sm:text-[10px] leading-tight">');
// Need to adjust MapPin icon size slightly to match
code = code.replace(/<MapPin className="w-3 h-3" \/>/g, '<MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />');


fs.writeFileSync('src/components/ExportReportingModal.tsx', code);
console.log("Applied tight mobile table layout!");
