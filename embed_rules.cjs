const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const modalCodeRegex = /\{rulesModalOpen && \([\s\S]*?\}\)\}/;
code = code.replace(modalCodeRegex, '');

const rulesButtonTarget = `                  <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-slate-200">
                     
                     <div className="flex gap-2">
                        <button onClick={() => setRulesModalOpen(true)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg font-bold shadow-sm flex items-center justify-center gap-2 transition-all border border-slate-300 text-sm">
                            <Settings className="w-4 h-4"/> Kurallar
                        </button>
                        <button onClick={autoDistributePro} disabled={distributeState.isRunning || unplacedCourses.length === 0} className="flex-[2] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 rounded-lg font-black shadow-md flex items-center justify-center gap-2 group transition-all disabled:opacity-50">
                            <Wand2 className="w-5 h-5 group-hover:scale-110 transition-transform" /> Kuantum Dağıt
                        </button>
                     </div>`;

const inlineRulesHtml = `                  <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-slate-200">
                     
                     {/* Şartlar Bölümü */}
                     <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                        <button onClick={() => setRulesModalOpen(!rulesModalOpen)} className="w-full flex items-center justify-between p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors border-b border-slate-200">
                           <div className="flex items-center gap-2">
                               <Settings className="w-4 h-4 text-indigo-500"/>
                               Şartlar
                           </div>
                           <ChevronDown className={\`w-4 h-4 transition-transform \${rulesModalOpen ? "rotate-180" : ""}\`}/>
                        </button>
                        
                        <AnimatePresence>
                           {rulesModalOpen && (
                               <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                   <div className="p-3 text-xs space-y-3 bg-white">
                                       <label className="flex items-center gap-2 cursor-pointer">
                                           <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                                                  checked={distributionRules.freeDistribution} 
                                                  onChange={e => setDistributionRules({...distributionRules, freeDistribution: e.target.checked})} />
                                           <span className="font-semibold text-slate-700">Kartları serbest dağıt</span>
                                       </label>
                                       
                                       <div className={\`pl-5 space-y-2.5 border-l-2 \${distributionRules.freeDistribution ? 'border-indigo-100' : 'border-slate-100'} ml-1.5 transition-opacity duration-200 \${!distributionRules.freeDistribution ? 'opacity-50 pointer-events-none' : ''}\`}>
                                           <label className="flex items-center gap-2 cursor-pointer">
                                               <input type="checkbox" className="w-3 h-3 rounded border-slate-300 text-indigo-600" 
                                                      checked={distributionRules.contiguousSameDay} 
                                                      onChange={e => setDistributionRules({...distributionRules, contiguousSameDay: e.target.checked})} />
                                               <span className="text-slate-600">Aynı güne gelen kartlar birleşik olsun</span>
                                           </label>
                                           
                                           <div className="flex items-center justify-between gap-2">
                                               <label className="flex items-center gap-2 cursor-pointer">
                                                   <input type="checkbox" className="w-3 h-3 rounded border-slate-300 text-indigo-600" 
                                                          checked={distributionRules.gapBetweenSameDay > 0} 
                                                          onChange={e => setDistributionRules({...distributionRules, gapBetweenSameDay: e.target.checked ? 1 : 0})} />
                                                   <span className="text-slate-600">Aynı güne gelen kartlar arasına en az şu kadar saat boşluk bırakılsın</span>
                                               </label>
                                               <input type="number" min="0" max="10" className="w-12 h-6 text-xs text-center border-slate-300 rounded" 
                                                      value={distributionRules.gapBetweenSameDay} 
                                                      onChange={e => setDistributionRules({...distributionRules, gapBetweenSameDay: parseInt(e.target.value)||0})} 
                                                      disabled={distributionRules.gapBetweenSameDay === 0} />
                                           </div>
                                           
                                           <div className="flex items-center justify-between gap-2">
                                               <label className="flex items-center gap-2 cursor-pointer">
                                                   <input type="checkbox" className="w-3 h-3 rounded border-slate-300 text-indigo-600" 
                                                          checked={distributionRules.maxHoursPerDay > 0} 
                                                          onChange={e => setDistributionRules({...distributionRules, maxHoursPerDay: e.target.checked ? 2 : 0})} />
                                                   <span className="text-slate-600">Ders verilen gündeki toplam saat sayısı şunu geçmesin</span>
                                               </label>
                                               <input type="number" min="0" max="15" className="w-12 h-6 text-xs text-center border-slate-300 rounded" 
                                                      value={distributionRules.maxHoursPerDay} 
                                                      onChange={e => setDistributionRules({...distributionRules, maxHoursPerDay: parseInt(e.target.value)||0})} 
                                                      disabled={distributionRules.maxHoursPerDay === 0} />
                                           </div>
                                           
                                           <div className="flex items-center justify-between gap-2">
                                               <label className="flex items-center gap-2 cursor-pointer">
                                                   <input type="checkbox" className="w-3 h-3 rounded border-slate-300 text-indigo-600" 
                                                          checked={distributionRules.minHoursPerDay > 0} 
                                                          onChange={e => setDistributionRules({...distributionRules, minHoursPerDay: e.target.checked ? 2 : 0})} />
                                                   <span className="text-slate-600">Ders verilen gündeki toplam saat sayısı şunun altına düşmesin</span>
                                               </label>
                                               <input type="number" min="0" max="15" className="w-12 h-6 text-xs text-center border-slate-300 rounded" 
                                                      value={distributionRules.minHoursPerDay} 
                                                      onChange={e => setDistributionRules({...distributionRules, minHoursPerDay: parseInt(e.target.value)||0})} 
                                                      disabled={distributionRules.minHoursPerDay === 0} />
                                           </div>
                                       </div>
                                   </div>
                               </motion.div>
                           )}
                        </AnimatePresence>
                     </div>

                     <div className="flex gap-2">
                        <button onClick={autoDistributePro} disabled={distributeState.isRunning || unplacedCourses.length === 0} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 rounded-lg font-black shadow-md flex items-center justify-center gap-2 group transition-all disabled:opacity-50">
                            <Wand2 className="w-5 h-5 group-hover:scale-110 transition-transform" /> Kuantum Dağıt
                        </button>
                     </div>`;

if(code.includes(rulesButtonTarget)) {
    code = code.replace(rulesButtonTarget, inlineRulesHtml);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Updated rules section to be inline like the screenshot");
} else {
    console.log("Could not find rules button target to replace.");
}
