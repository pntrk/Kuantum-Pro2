const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `                  {poolMenuOpen && (
                     <div className="mt-3 p-3 bg-white border border-indigo-100 rounded-lg shadow-lg relative z-20">
                        <div className="space-y-3">
                           <div>
                              <div className="text-xs font-bold text-slate-500 mb-1 flex justify-between">
                                  <span>Öğretmenler *</span>
                                  <span className="text-[10px] bg-slate-100 px-1 rounded text-slate-400">Çoklu seçilebilir</span>
                              </div>`;

const repStr = `                  {poolMenuOpen && (
                     <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-900/40 p-0 md:p-4" onClick={() => setPoolMenuOpen(false)}>
                        <div className="bg-white rounded-t-2xl md:rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] relative" onClick={e => e.stopPropagation()}>
                           {/* Drag handle for mobile */}
                           <div className="w-full flex justify-center pt-3 pb-2 md:hidden shrink-0 touch-none">
                              <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
                           </div>
                           
                           {/* Header */}
                           <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 md:rounded-t-xl shrink-0 sticky top-0 z-10">
                              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Plus className="w-5 h-5 text-indigo-600"/> Kart Düzenle</h3>
                              <button onClick={() => setPoolMenuOpen(false)} className="p-1.5 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                                <X className="w-5 h-5" />
                              </button>
                           </div>

                           <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1 pb-24 md:pb-4">
                           <div>
                              <div className="text-sm font-bold text-slate-700 mb-1.5 flex justify-between">
                                  <span>Öğretmenler *</span>
                                  <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">Çoklu seçilebilir</span>
                              </div>`;

if(code.includes(targetStr)) {
    code = code.replace(targetStr, repStr);
} else {
    console.log("Could not find poolMenu target");
}

const targetStr2 = `                           <div className="flex gap-2 pt-1 border-t border-slate-100">
                               <button onClick={() => {setPoolForm({ teachers: [], classes: [], rooms: [], subject: '', format: '2', editingId: null }); setPoolMenuOpen(false);}} className="flex-1 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded transition-colors">İptal</button>
                               <button onClick={handleCreatePoolCard} className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white rounded py-2 text-xs font-bold transition-colors shadow-sm">{poolForm.editingId ? 'Güncelle' : 'Karta Çevir'}</button>
                           </div>
                        </div>
                     </div>
                  )}`;

const repStr2 = `                           </div>
                           
                           {/* Footer */}
                           <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-2 shrink-0 sticky bottom-0 z-10 w-full md:rounded-b-xl">
                               <button onClick={() => {setPoolForm({ teachers: [], classes: [], rooms: [], subject: '', format: '2', editingId: null }); setPoolMenuOpen(false);}} className="flex-1 py-3 md:py-2 text-sm font-bold text-slate-500 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors min-h-[44px]">İptal</button>
                               <button onClick={handleCreatePoolCard} className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 md:py-2 text-sm font-bold transition-colors shadow-sm min-h-[44px]">{poolForm.editingId ? 'Güncelle' : 'Karta Çevir'}</button>
                           </div>
                        </div>
                     </div>
                  )}`;

if(code.includes(targetStr2)) {
    code = code.replace(targetStr2, repStr2);
} else {
    console.log("Could not find poolMenu end target");
}

fs.writeFileSync('src/App.tsx', code);
console.log("Patched poolMenuOpen!");
