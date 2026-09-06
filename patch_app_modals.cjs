const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// constraint modal scroll area
const cmScrollTarget = `<div className="flex-1 p-4 overflow-auto custom-scrollbar border-r border-slate-200">`;
const cmScrollRep = `<div className="flex-1 p-4 overflow-auto custom-scrollbar border-r border-slate-200 pb-32 md:pb-4">`;
code = code.replace(cmScrollTarget, cmScrollRep);

// constraint modal right side scroll area
const cmRightScrollTarget = `<div className="w-full md:w-80 bg-slate-50 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-4">`;
const cmRightScrollRep = `<div className="w-full md:w-80 bg-slate-50 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-4 pb-32 md:pb-4">`;
code = code.replace(cmRightScrollTarget, cmRightScrollRep);

// constraint modal button mobile enlargement
const cmBtnTarget = `<button onClick={() => setConstraintModal(null)} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-sm transition-colors">Kaydet ve Kapat</button>`;
const cmBtnRep = `<button onClick={() => setConstraintModal(null)} className="w-full md:w-auto px-6 py-3 md:py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-sm transition-colors text-base md:text-sm min-h-[44px]">Kaydet ve Kapat</button>`;
code = code.replace(cmBtnTarget, cmBtnRep);

const cmFooterTarget = `<div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0">`;
const cmFooterRep = `<div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0 sticky bottom-0 z-20 w-full">`;
code = code.replace(cmFooterTarget, cmFooterRep);

fs.writeFileSync('src/App.tsx', code);
console.log("App.tsx patched!");
