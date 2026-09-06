const fs = require('fs');
let code = fs.readFileSync('src/components/ExportReportingModal.tsx', 'utf8');

let target6 = `<h1 className="text-2xl font-black text-slate-900 uppercase tracking-wider">{schoolInfo.name || 'OKUL ADI'}</h1>
                       <h2 className="text-sm font-bold text-slate-600 mt-1">{schoolInfo.year} EĞİTİM ÖĞRETİM YILI</h2>
                       <div className="mt-4 text-lg font-extrabold text-indigo-900 border border-indigo-200 bg-indigo-50 px-4 py-1.5 rounded-full inline-block">`;
let replacement6 = `<h1 className="text-lg md:text-2xl font-black text-slate-900 uppercase tracking-wider">{schoolInfo.name || 'OKUL ADI'}</h1>
                       <h2 className="text-xs md:text-sm font-bold text-slate-600 mt-1">{schoolInfo.year} EĞİTİM ÖĞRETİM YILI</h2>
                       <div className="mt-3 md:mt-4 text-sm md:text-lg font-extrabold text-indigo-900 border border-indigo-200 bg-indigo-50 px-3 md:px-4 py-1.5 rounded-full inline-block text-center">`;

code = code.replace(target6, replacement6);

let target7 = `<th className="border border-slate-300 bg-slate-100 p-2 font-bold text-slate-700 w-16">Gün</th>`;
let replacement7 = `<th className="border border-slate-300 bg-slate-100 p-1 md:p-2 font-bold text-slate-700 w-12 md:w-16">Gün</th>`;
code = code.replace(target7, replacement7);

fs.writeFileSync('src/components/ExportReportingModal.tsx', code);
console.log("Success patch doc header");
