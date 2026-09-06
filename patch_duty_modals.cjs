const fs = require('fs');
let code = fs.readFileSync('src/components/DutyManager.tsx', 'utf8');

// 1. selectingCell Modal Patch
const selectModalTarget = `        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={() => setSelectingCell(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-full" onClick={e => e.stopPropagation()}>
             
             {/* Modal Header */}
             <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                <div>
                   <h3 className="font-black text-slate-800">{selectingCell.loc} Nöbetçisi</h3>
                   <p className="text-sm font-medium text-slate-500">{activeDays.find(d => d.id === selectingCell.dayId)?.name} Günü</p>
                </div>
                <button onClick={() => setSelectingCell(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
             </div>
             
             {/* Modal Search / List of teachers */}
             <div className="p-4 overflow-y-auto custom-scrollbar flex-1">`;

const selectModalRep = `        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/40 sm:p-4" onClick={() => setSelectingCell(null)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md flex flex-col max-h-[90vh] sm:max-h-[85vh] relative" onClick={e => e.stopPropagation()}>
             
             <div className="w-full flex justify-center pt-3 pb-2 sm:hidden shrink-0 touch-none">
               <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
             </div>
             
             {/* Modal Header */}
             <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 sm:rounded-t-2xl shrink-0 sticky top-0 z-10">
                <div>
                   <h3 className="font-black text-slate-800">{selectingCell.loc} Nöbetçisi</h3>
                   <p className="text-sm font-medium text-slate-500">{activeDays.find(d => d.id === selectingCell.dayId)?.name} Günü</p>
                </div>
                <button onClick={() => setSelectingCell(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                  <X className="w-6 h-6 sm:w-5 sm:h-5" />
                </button>
             </div>
             
             {/* Modal Search / List of teachers */}
             <div className="p-4 overflow-y-auto custom-scrollbar flex-1 pb-24 sm:pb-4">`;

if(code.includes(selectModalTarget)) {
    code = code.replace(selectModalTarget, selectModalRep);
} else {
    console.log("Could not find selectModalTarget");
}

const selectModalFooterTarget = `             <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                <button onClick={() => setSelectingCell(null)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md">
                   Tamamla
                </button>
             </div>
          </div>
        </div>`;

const selectModalFooterRep = `             <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end sticky bottom-0 z-10 shrink-0 w-full">
                <button onClick={() => setSelectingCell(null)} className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 sm:py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md text-base sm:text-sm">
                   Tamamla
                </button>
             </div>
          </div>
        </div>`;

if(code.includes(selectModalFooterTarget)) {
    code = code.replace(selectModalFooterTarget, selectModalFooterRep);
} else {
    console.log("Could not find selectModalFooterTarget");
}


// 2. printModalOpen Patch
const printModalTarget = `        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4" onClick={() => setPrintModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col" onClick={e => e.stopPropagation()}>
             <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                <div>
                   <h3 className="font-black text-slate-800">Çizelge Yazdır</h3>
                   <p className="text-sm font-medium text-slate-500">Yazdırma türünü ve seçeneklerini seçin.</p>
                </div>
                <button onClick={() => setPrintModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
             </div>
             
             <div className="p-6 flex flex-col gap-4">`;

const printModalRep = `        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/40 sm:p-4" onClick={() => setPrintModalOpen(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm flex flex-col max-h-[90vh] sm:max-h-[85vh] relative" onClick={e => e.stopPropagation()}>
             <div className="w-full flex justify-center pt-3 pb-2 sm:hidden shrink-0 touch-none">
               <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
             </div>
             <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 sm:rounded-t-2xl shrink-0 sticky top-0 z-10">
                <div>
                   <h3 className="font-black text-slate-800">Çizelge Yazdır</h3>
                   <p className="text-sm font-medium text-slate-500">Yazdırma türünü ve seçeneklerini seçin.</p>
                </div>
                <button onClick={() => setPrintModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                  <X className="w-6 h-6 sm:w-5 sm:h-5" />
                </button>
             </div>
             
             <div className="p-6 flex flex-col gap-4 overflow-y-auto custom-scrollbar flex-1 pb-24 sm:pb-6">`;

if(code.includes(printModalTarget)) {
    code = code.replace(printModalTarget, printModalRep);
} else {
    console.log("Could not find printModalTarget");
}

const printModalFooterTarget = `             <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
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

const printModalFooterRep = `             <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-end gap-2 sticky bottom-0 z-10 shrink-0 w-full">
                <button onClick={() => setPrintModalOpen(false)} className="px-4 py-3 sm:py-2 font-bold text-slate-500 hover:text-slate-700 transition-colors order-2 sm:order-1 text-base sm:text-sm">İptal</button>
                <button onClick={() => {
                   let y = printYear;
                   if (!y) y = new Date().getFullYear();
                   onPrint(printType, printMonth, y);
                   setPrintModalOpen(false);
                }} className="px-4 py-3 sm:py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm order-1 sm:order-2 text-base sm:text-sm">Yazdır</button>
             </div>
          </div>
        </div>`;

if(code.includes(printModalFooterTarget)) {
    code = code.replace(printModalFooterTarget, printModalFooterRep);
} else {
    console.log("Could not find printModalFooterTarget");
}

fs.writeFileSync('src/components/DutyManager.tsx', code);
console.log("DutyManager patched!");
