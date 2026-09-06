const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Find the section where "Kuantum Dağıt" button is.
const buttonTarget = `<button onClick={autoDistributePro} disabled={distributeState.isRunning || unplacedCourses.length === 0} className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-bold shadow hover:from-indigo-700 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center gap-2">`;
const buttonReplacement = `<button onClick={() => setRulesModalOpen(true)} className="px-4 py-2.5 bg-slate-100 border border-slate-300 text-slate-700 rounded-lg font-bold shadow-sm hover:bg-slate-200 transition-all flex items-center gap-2">
    <Settings className="w-5 h-5"/> Kurallar
</button>
<button onClick={autoDistributePro} disabled={distributeState.isRunning || unplacedCourses.length === 0} className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-bold shadow hover:from-indigo-700 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center gap-2">`;
code = code.replace(buttonTarget, buttonReplacement);

// Modal UI for rules.
// Let's add it before {distributeState.isRunning && (
const modalTarget = `{distributeState.isRunning && (`;
const modalReplacement = `{rulesModalOpen && (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Settings className="w-5 h-5 text-indigo-600"/> Dağıtım Kuralları</h3>
                <button onClick={() => setRulesModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto bg-slate-50 space-y-4">
                <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                               checked={distributionRules.freeDistribution} 
                               onChange={e => setDistributionRules({...distributionRules, freeDistribution: e.target.checked})} />
                        <span className="font-bold text-slate-700">Kartları serbest dağıt (Aynı güne aynı ders gelebilir)</span>
                    </label>
                    
                    {distributionRules.freeDistribution && (
                        <div className="pl-8 space-y-3 border-l-2 border-indigo-100 ml-2">
                            <label className="flex items-center gap-3 cursor-pointer text-sm">
                                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600" 
                                       checked={distributionRules.contiguousSameDay} 
                                       onChange={e => setDistributionRules({...distributionRules, contiguousSameDay: e.target.checked})} />
                                <span className="text-slate-700">Aynı güne gelen kartlar birleşik olsun</span>
                            </label>
                            
                            <label className="flex items-center gap-3 cursor-pointer text-sm">
                                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600" 
                                       checked={!distributionRules.contiguousSameDay} 
                                       onChange={e => {
                                           if (e.target.checked) setDistributionRules({...distributionRules, contiguousSameDay: false});
                                       }} />
                                <span className="text-slate-700 flex items-center gap-2 whitespace-nowrap">
                                    Aynı güne gelen kartlar arasına en az <input type="number" min="1" max="10" disabled={distributionRules.contiguousSameDay} className="w-16 p-1 border border-slate-300 rounded" value={distributionRules.gapBetweenSameDay} onChange={e => setDistributionRules({...distributionRules, gapBetweenSameDay: parseInt(e.target.value) || 0})} /> saat boşluk bırakılsın
                                </span>
                            </label>
                            
                            <label className="flex items-center gap-3 cursor-pointer text-sm">
                                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600" 
                                       checked={distributionRules.maxHoursPerDayEnabled} 
                                       onChange={e => setDistributionRules({...distributionRules, maxHoursPerDayEnabled: e.target.checked})} />
                                <span className="text-slate-700 flex items-center gap-2 whitespace-nowrap">
                                    Ders verilen gündeki toplam saat sayısı şunu geçmesin: <input type="number" min="1" max="15" disabled={!distributionRules.maxHoursPerDayEnabled} className="w-16 p-1 border border-slate-300 rounded" value={distributionRules.maxHoursPerDay} onChange={e => setDistributionRules({...distributionRules, maxHoursPerDay: parseInt(e.target.value) || 0})} />
                                </span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer text-sm">
                                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600" 
                                       checked={distributionRules.minHoursPerDayEnabled} 
                                       onChange={e => setDistributionRules({...distributionRules, minHoursPerDayEnabled: e.target.checked})} />
                                <span className="text-slate-700 flex items-center gap-2 whitespace-nowrap">
                                    Ders verilen gündeki toplam saat sayısı şunun altına düşmesin: <input type="number" min="1" max="15" disabled={!distributionRules.minHoursPerDayEnabled} className="w-16 p-1 border border-slate-300 rounded" value={distributionRules.minHoursPerDay} onChange={e => setDistributionRules({...distributionRules, minHoursPerDay: parseInt(e.target.value) || 0})} />
                                </span>
                            </label>
                        </div>
                    )}
                </div>
            </div>
            <div className="p-4 bg-white border-t border-slate-100 flex justify-end">
                <button onClick={() => setRulesModalOpen(false)} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors">Tamam</button>
            </div>
        </motion.div>
    </div>
)}
{distributeState.isRunning && (`;
code = code.replace(modalTarget, modalReplacement);

fs.writeFileSync('src/App.tsx', code);
console.log("Updated UI for Kurallar");
