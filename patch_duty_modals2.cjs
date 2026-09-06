const fs = require('fs');
let code = fs.readFileSync('src/components/DutyManager.tsx', 'utf8');

const selectTarget = `             {/* Modal Footer */}
             <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl shrink-0 flex justify-end">
                <button onClick={() => setSelectingCell(null)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md">
                   Tamamla
                </button>
             </div>
          </div>
        </div>`;

const selectRep = `             {/* Modal Footer */}
             <div className="p-4 border-t border-slate-200 bg-slate-50 sm:rounded-b-2xl shrink-0 flex justify-end sticky bottom-0 z-10 w-full">
                <button onClick={() => setSelectingCell(null)} className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 sm:py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md text-base sm:text-sm min-h-[44px]">
                   Tamamla
                </button>
             </div>
          </div>
        </div>`;

code = code.replace(selectTarget, selectRep);

const printTarget = `             <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl shrink-0 flex justify-end gap-2">
                <button onClick={() => setPrintModalOpen(false)} className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700 transition-colors">İptal</button>
                <button onClick={() => {
                   let y = printYear;
                   if (!y) y = new Date().getFullYear();
                   onPrint(printType, printMonth, y);
                   setPrintModalOpen(false);
                }} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm">Yazdır</button>
             </div>
          </div>
        </div>`;

const printRep = `             <div className="p-4 border-t border-slate-200 bg-slate-50 sm:rounded-b-2xl shrink-0 flex flex-col sm:flex-row justify-end gap-2 sticky bottom-0 z-10 w-full">
                <button onClick={() => setPrintModalOpen(false)} className="px-4 py-3 sm:py-2 font-bold text-slate-500 hover:text-slate-700 transition-colors order-2 sm:order-1 text-base sm:text-sm min-h-[44px]">İptal</button>
                <button onClick={() => {
                   let y = printYear;
                   if (!y) y = new Date().getFullYear();
                   onPrint(printType, printMonth, y);
                   setPrintModalOpen(false);
                }} className="px-4 py-3 sm:py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm order-1 sm:order-2 text-base sm:text-sm min-h-[44px]">Yazdır</button>
             </div>
          </div>
        </div>`;
code = code.replace(printTarget, printRep);

fs.writeFileSync('src/components/DutyManager.tsx', code);
console.log("Patched both footer");
