const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add rulesMenuOpen state
if (!code.includes('const [rulesMenuOpen, setRulesMenuOpen]')) {
    code = code.replace(
        'const [rulesModalOpen, setRulesModalOpen] = useState(false);',
        'const [rulesModalOpen, setRulesModalOpen] = useState(false);\n  const [rulesMenuOpen, setRulesMenuOpen] = useState(false);'
    );
}

// 2. Remove the checkboxes from rulesModalOpen (Şartlar) accordion
const regexAccordionCheckboxes = /<div className=\{`pl-5 space-y-2\.5 border-l-2 \$\{distributionRules\.freeDistribution \? 'border-indigo-100' : 'border-slate-100'\} ml-1\.5 transition-opacity duration-200 \$\{\!distributionRules\.freeDistribution \? 'opacity-50 pointer-events-none' : ''\}`\}>[\s\S]*?<\/div>\s*<\/div>\s*<\/motion.div>/;

code = code.replace(regexAccordionCheckboxes, `</div></motion.div>`);

// 3. Add the Kurallar button and its dropdown menu next to Kuantum Dağıt
const kuantumButtonRegex = /<div className="flex gap-2">\s*<button onClick=\{autoDistributePro\}[\s\S]*?<\/button>\s*<\/div>/;

const newKuantumArea = `<div className="flex gap-2 relative">
                        <button onClick={() => setRulesMenuOpen(!rulesMenuOpen)} className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-bold shadow-md flex items-center justify-center gap-1 transition-all">
                           <Settings className="w-4 h-4" /> Kurallar
                        </button>
                        <button onClick={autoDistributePro} disabled={distributeState.isRunning || unplacedCourses.length === 0} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 rounded-lg font-black shadow-md flex items-center justify-center gap-2 group transition-all disabled:opacity-50">
                            <Wand2 className="w-5 h-5 group-hover:scale-110 transition-transform" /> Kuantum Dağıt
                        </button>
                        
                        <AnimatePresence>
                           {rulesMenuOpen && (
                               <motion.div 
                                 initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                                 animate={{ opacity: 1, y: 0, scale: 1 }} 
                                 exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                 transition={{ duration: 0.15 }}
                                 className="absolute bottom-full mb-2 left-0 w-80 bg-white border border-slate-200 shadow-xl rounded-xl z-50 overflow-hidden"
                               >
                                  <div className="p-3 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
                                     <h3 className="font-black text-slate-700 text-sm flex items-center gap-1.5"><Settings className="w-4 h-4 text-indigo-600"/> Dağıtım Kuralları</h3>
                                     <button onClick={()=>setRulesMenuOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4"/></button>
                                  </div>
                                  <div className={\`p-4 text-xs space-y-4 \$\{distributionRules.freeDistribution ? '' : 'opacity-50 pointer-events-none'\}\`}>
                                     {!distributionRules.freeDistribution && <div className="text-red-500 font-bold mb-2 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Bu kurallar sadece Serbest Dağıtım modunda aktiftir.</div>}
                                     <label className="flex items-center gap-2 cursor-pointer">
                                         <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600" 
                                                checked={distributionRules.contiguousSameDay} 
                                                onChange={e => setDistributionRules({...distributionRules, contiguousSameDay: e.target.checked})} />
                                         <span className="text-slate-700 font-semibold text-sm">Aynı güne gelen kartlar birleşik olsun</span>
                                     </label>
                                     
                                     <div className="flex flex-col gap-1.5">
                                         <label className="flex items-center gap-2 cursor-pointer">
                                             <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600" 
                                                    checked={distributionRules.gapBetweenSameDay > 0} 
                                                    onChange={e => setDistributionRules({...distributionRules, gapBetweenSameDay: e.target.checked ? 1 : 0})} />
                                             <span className="text-slate-700 font-semibold text-sm">Aynı güne gelen kartlar arasına boşluk bırakılsın</span>
                                         </label>
                                         <div className="pl-6 flex items-center gap-2">
                                             <span className="text-slate-500">En az boşluk (saat):</span>
                                             <input type="number" min="0" max="10" className="w-16 h-8 text-sm font-bold text-center border-slate-300 rounded focus:border-indigo-500 focus:ring-indigo-500" 
                                                    value={distributionRules.gapBetweenSameDay} 
                                                    onChange={e => setDistributionRules({...distributionRules, gapBetweenSameDay: parseInt(e.target.value)||0})} 
                                                    disabled={distributionRules.gapBetweenSameDay === 0} />
                                         </div>
                                     </div>
                                     
                                     <div className="flex flex-col gap-1.5">
                                         <label className="flex items-center gap-2 cursor-pointer">
                                             <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600" 
                                                    checked={distributionRules.maxHoursPerDay > 0} 
                                                    onChange={e => setDistributionRules({...distributionRules, maxHoursPerDay: e.target.checked ? 2 : 0})} />
                                             <span className="text-slate-700 font-semibold text-sm">Ders verilen gündeki saat sınırı (Maksimum)</span>
                                         </label>
                                         <div className="pl-6 flex items-center gap-2">
                                             <span className="text-slate-500">Maksimum saat:</span>
                                             <input type="number" min="0" max="15" className="w-16 h-8 text-sm font-bold text-center border-slate-300 rounded focus:border-indigo-500 focus:ring-indigo-500" 
                                                    value={distributionRules.maxHoursPerDay} 
                                                    onChange={e => setDistributionRules({...distributionRules, maxHoursPerDay: parseInt(e.target.value)||0})} 
                                                    disabled={distributionRules.maxHoursPerDay === 0} />
                                         </div>
                                     </div>
                                     
                                     <div className="flex flex-col gap-1.5">
                                         <label className="flex items-center gap-2 cursor-pointer">
                                             <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600" 
                                                    checked={distributionRules.minHoursPerDay > 0} 
                                                    onChange={e => setDistributionRules({...distributionRules, minHoursPerDay: e.target.checked ? 2 : 0})} />
                                             <span className="text-slate-700 font-semibold text-sm">Ders verilen gündeki saat sınırı (Minimum)</span>
                                         </label>
                                         <div className="pl-6 flex items-center gap-2">
                                             <span className="text-slate-500">Minimum saat:</span>
                                             <input type="number" min="0" max="15" className="w-16 h-8 text-sm font-bold text-center border-slate-300 rounded focus:border-indigo-500 focus:ring-indigo-500" 
                                                    value={distributionRules.minHoursPerDay} 
                                                    onChange={e => setDistributionRules({...distributionRules, minHoursPerDay: parseInt(e.target.value)||0})} 
                                                    disabled={distributionRules.minHoursPerDay === 0} />
                                         </div>
                                     </div>
                                  </div>
                               </motion.div>
                           )}
                        </AnimatePresence>
                     </div>`;

if (code.match(kuantumButtonRegex)) {
    code = code.replace(kuantumButtonRegex, newKuantumArea);
    fs.writeFileSync('src/App.tsx', code);
    console.log("UI updated!");
} else {
    console.log("Could not find button regex");
}
