const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const rulesModalComponent = `
  const renderRulesModal = () => {
      if (!showRulesModal) return null;
      
      const rules = schoolSettings.distributionRules || {
          preventSameDay: true,
          minGapActive: false,
          minGap: 1,
          maxGapActive: false,
          maxGap: 0,
          maxHoursActive: false,
          maxHours: 2,
      };

      const updateRule = (key, value) => {
          setSchoolSettings(prev => ({
              ...prev,
              distributionRules: {
                  ...(prev.distributionRules || rules),
                  [key]: value
              }
          }));
      };

      return (
        <div className="fixed inset-0 bg-slate-900/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-slate-100 rounded border shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden text-slate-800 text-sm">
               <div className="bg-slate-100 px-3 py-2 flex items-center justify-between border-b border-slate-300">
                 <div className="flex items-center gap-2 font-semibold">
                     <span>Şartlar</span>
                 </div>
                 <button onClick={() => setShowRulesModal(false)} className="hover:bg-slate-200 px-2 py-0.5 rounded transition-colors"><X className="w-4 h-4" /></button>
               </div>
               
               <div className="p-4 bg-slate-100 flex flex-col gap-3 border-t border-white">
                   {/* preventSameDay */}
                   <label className="flex items-center gap-3 cursor-pointer">
                       <input 
                           type="checkbox" 
                           checked={rules.preventSameDay}
                           onChange={(e) => updateRule('preventSameDay', e.target.checked)}
                           className="w-4 h-4 rounded border-slate-400 bg-white cursor-pointer" 
                       />
                       <span>Aynı güne gelmesin</span>
                   </label>
                   
                   {/* minGap */}
                   <div className="flex items-center gap-3">
                       <label className="flex items-center gap-3 cursor-pointer">
                           <input 
                               type="checkbox" 
                               checked={rules.minGapActive}
                               onChange={(e) => updateRule('minGapActive', e.target.checked)}
                               className="w-4 h-4 rounded border-slate-400 bg-white cursor-pointer" 
                           />
                           <span>Aynı güne gelen dersler arasına en az şu kadar saat boşluk bırakılsın</span>
                       </label>
                       <input 
                           type="number" 
                           min="0"
                           value={rules.minGap}
                           onChange={(e) => updateRule('minGap', parseInt(e.target.value) || 0)}
                           disabled={!rules.minGapActive}
                           className="ml-auto w-20 px-2 py-1 border border-slate-300 rounded bg-white disabled:bg-slate-100 disabled:text-slate-400"
                       />
                   </div>

                   {/* maxGap */}
                   <div className="flex items-center gap-3">
                       <label className="flex items-center gap-3 cursor-pointer">
                           <input 
                               type="checkbox" 
                               checked={rules.maxGapActive}
                               onChange={(e) => updateRule('maxGapActive', e.target.checked)}
                               className="w-4 h-4 rounded border-slate-400 bg-white cursor-pointer" 
                           />
                           <span>Aynı güne gelen dersler arasına en fazla şu kadar saat boşluk bırakılsın</span>
                       </label>
                       <input 
                           type="number" 
                           min="0"
                           value={rules.maxGap}
                           onChange={(e) => updateRule('maxGap', parseInt(e.target.value) || 0)}
                           disabled={!rules.maxGapActive}
                           className="ml-auto w-20 px-2 py-1 border border-slate-300 rounded bg-white disabled:bg-slate-100 disabled:text-slate-400"
                       />
                   </div>

                   {/* maxHours */}
                   <div className="flex items-center gap-3">
                       <label className="flex items-center gap-3 cursor-pointer">
                           <input 
                               type="checkbox" 
                               checked={rules.maxHoursActive}
                               onChange={(e) => updateRule('maxHoursActive', e.target.checked)}
                               className="w-4 h-4 rounded border-slate-400 bg-white cursor-pointer" 
                           />
                           <span>Aynı güne gelen derslerin toplam saat sayısı şunu geçmesin</span>
                       </label>
                       <input 
                           type="number" 
                           min="1"
                           value={rules.maxHours}
                           onChange={(e) => updateRule('maxHours', parseInt(e.target.value) || 1)}
                           disabled={!rules.maxHoursActive}
                           className="ml-auto w-20 px-2 py-1 border border-slate-300 rounded bg-white disabled:bg-slate-100 disabled:text-slate-400"
                       />
                   </div>
               </div>

               <div className="bg-slate-100 border-t border-slate-300 px-4 py-3 flex justify-end gap-2 items-center border-t border-slate-300 shadow-inner">
                   <button onClick={() => setShowRulesModal(false)} className="px-6 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded shadow-sm border border-slate-300">
                       Kapat
                   </button>
               </div>
           </div>
        </div>
      );
  };
`;

if (!code.includes('const renderRulesModal')) {
    code = code.replace(
        'const renderConflictModal = () => {',
        rulesModalComponent + '\n  const renderConflictModal = () => {'
    );
    fs.writeFileSync('src/App.tsx', code);
    console.log("Added rules modal");
} else {
    console.log("Rules modal already exists");
}
