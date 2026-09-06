const fs = require('fs');
let code = fs.readFileSync('src/components/DutyManager.tsx', 'utf8');

const regex = /<div className="flex items-center gap-2 flex-wrap">[\s\S]*?<button[\s\S]*?handleAutoAssign[\s\S]*?Otomatik Dağıt[\s\S]*?<\/button>[\s\S]*?<button[\s\S]*?handleClearAssignments[\s\S]*?Temizle[\s\S]*?<\/button>[\s\S]*?<button[\s\S]*?handleSaveAll[\s\S]*?Kaydet[\s\S]*?<\/button>[\s\S]*?<button[\s\S]*?setPrintModalOpen[\s\S]*?Önizle \/ Yazdır[\s\S]*?<\/button>\s*<\/div>/;

const replacement = `<div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto hide-scrollbar w-full md:w-auto pb-2 md:pb-0 shrink-0 snap-x">
                   <button 
                     onPointerDown={handleAutoAssign}
                     className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors border border-indigo-200 shrink-0 snap-start"
                   >
                      <Wand2 className="w-3.5 h-3.5" /> <span className="whitespace-nowrap">Otomatik Dağıt</span>
                   </button>
                   <button 
                     onPointerDown={handleClearAssignments} 
                     className="bg-rose-50 text-rose-700 hover:bg-rose-100 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors border border-rose-200 shrink-0 snap-start"
                   >
                      <Trash2 className="w-3.5 h-3.5" /> <span className="whitespace-nowrap">Temizle</span>
                   </button>
                   <button 
                     onPointerDown={handleSaveAll}
                     className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors border border-emerald-200 shrink-0 snap-start"
                   >
                      <Save className="w-3.5 h-3.5" /> <span className="whitespace-nowrap">Kaydet</span>
                   </button>
                   <button 
                     onPointerDown={() => setPrintModalOpen(true)}
                     className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-200 shrink-0 snap-start"
                   >
                      <Printer className="w-3.5 h-3.5" /> <span className="whitespace-nowrap">Önizle / Yazdır</span>
                   </button>
                 </div>`;

if (regex.test(code)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('src/components/DutyManager.tsx', code);
  console.log("Success regex patch roster buttons");
} else {
  console.log("target string not found.");
}
