const fs = require('fs');
let code = fs.readFileSync('src/components/ExportReportingModal.tsx', 'utf-8');

// The School Chart Table
code = code.replace(/<table className="w-full text-xs border-collapse table-fixed print-matrix-table">/g, '<table className="w-full text-[9px] md:text-[10px] lg:text-[11px] border-collapse table-fixed print-matrix-table break-words leading-tight">');
code = code.replace(/<th\s+key=\{idx\}\s+className="p-1 sm:p-2 border border-slate-300 bg-slate-100 font-bold text-center w-24"/g, '<th\n                                key={idx}\n                                className="p-0.5 sm:p-1 border border-slate-300 bg-slate-100 font-bold text-center w-12 sm:w-16 md:w-20"');
code = code.replace(/<td\s+key=\{p\}\s+className="p-1 sm:p-2 border border-slate-300 text-center align-middle relative"/g, '<td\n                                      key={p}\n                                      className="p-0.5 sm:p-1 border border-slate-300 text-center align-middle relative"');

// The Teacher/Class Matrix Table
code = code.replace(/<td className="p-1 sm:p-2 border border-slate-300 bg-slate-50 font-bold text-center align-middle w-24">/g, '<td className="p-0.5 sm:p-1 border border-slate-300 bg-slate-50 font-bold text-center align-middle w-12 sm:w-16 md:w-20">');
code = code.replace(/<div className="text-\[11px\] font-black text-indigo-950">/g, '<div className="text-[9px] md:text-[10px] lg:text-[11px] font-black text-indigo-950 leading-tight">');
code = code.replace(/<div className="text-\[10px\] font-bold text-slate-700 mt-0\.5">/g, '<div className="text-[8px] md:text-[9px] font-bold text-slate-700 mt-0.5 leading-tight">');

fs.writeFileSync('src/components/ExportReportingModal.tsx', code);
console.log("Desktop table styling optimized!");
