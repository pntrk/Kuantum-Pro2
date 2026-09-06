const fs = require('fs');
let code = fs.readFileSync('src/components/ExportReportingModal.tsx', 'utf8');

code = code.replace(
  `onClick={() => { setExportType('teacher'); setSelectedEntity(teachers[0] || ''); }}
                        className={\`flex items-center gap-2 p-2.5 rounded-lg border text-sm font-semibold transition-all \${exportType === 'teacher' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-slate-300 text-slate-700'}\`}`,
  `onPointerDown={(e) => { e.preventDefault(); setExportType('teacher'); setSelectedEntity(teachers[0] || ''); }}
                        className={\`flex items-center gap-2 p-2 md:p-2.5 rounded-lg border text-xs md:text-sm font-semibold transition-all \${exportType === 'teacher' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-slate-300 text-slate-700 active:bg-slate-100'}\`}`
);

code = code.replace(
  `onClick={() => { setExportType('class'); setSelectedEntity(classes[0] || ''); }}
                        className={\`flex items-center gap-2 p-2.5 rounded-lg border text-sm font-semibold transition-all \${exportType === 'class' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-slate-300 text-slate-700'}\`}`,
  `onPointerDown={(e) => { e.preventDefault(); setExportType('class'); setSelectedEntity(classes[0] || ''); }}
                        className={\`flex items-center gap-2 p-2 md:p-2.5 rounded-lg border text-xs md:text-sm font-semibold transition-all \${exportType === 'class' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-slate-300 text-slate-700 active:bg-slate-100'}\`}`
);

code = code.replace(
  `onClick={() => setExportType('school')}
                        className={\`flex items-center gap-2 p-2.5 rounded-lg border text-sm font-semibold transition-all \${exportType === 'school' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-slate-300 text-slate-700'}\`}`,
  `onPointerDown={(e) => { e.preventDefault(); setExportType('school'); }}
                        className={\`flex items-center gap-2 p-2 md:p-2.5 rounded-lg border text-xs md:text-sm font-semibold transition-all \${exportType === 'school' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-slate-300 text-slate-700 active:bg-slate-100'}\`}`
);

code = code.replace(
  `<button onClick={handlePrint} className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white p-2.5 rounded-lg font-bold hover:bg-slate-800 transition-colors">`,
  `<button onPointerDown={(e) => { e.preventDefault(); handlePrint(); }} className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white p-2 md:p-2.5 rounded-lg text-sm md:text-base font-bold hover:bg-slate-800 transition-colors active:scale-[0.98]">`
);

code = code.replace(
  `<button onClick={generateExcel} className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white p-2.5 rounded-lg font-bold hover:bg-emerald-700 transition-colors">`,
  `<button onPointerDown={(e) => { e.preventDefault(); generateExcel(); }} className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white p-2 md:p-2.5 rounded-lg text-sm md:text-base font-bold hover:bg-emerald-700 transition-colors active:scale-[0.98]">`
);

fs.writeFileSync('src/components/ExportReportingModal.tsx', code);
console.log("Success patch buttons");
