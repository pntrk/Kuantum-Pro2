const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `             <div className="max-w-4xl flex flex-col h-full">
                <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">{title} Yönetimi ve Kısıtlamalar</h2>
                <div className="flex gap-2 mb-4">
                  <input type="text" className="flex-1 border border-slate-300 p-2.5 rounded-xl focus:outline-blue-500 uppercase font-semibold text-sm" placeholder={\`Yeni \${title} Adı...\`} value={newItemName} onChange={e=>setNewItemName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddItem(getSingleType(settingTab))} />
                  <button onClick={() => handleAddItem(getSingleType(settingTab))} className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 rounded-xl font-bold text-sm flex items-center gap-1.5 shrink-0"><Plus className="w-5 h-5"/> Ekle</button>
                </div>
                <div className="bg-slate-50 rounded-xl border border-slate-200 shadow-inner flex-1 overflow-auto p-2 custom-scrollbar">
                   {list.length === 0 ? <p className="text-slate-400 p-4 text-center font-semibold text-sm">Kayıt bulunamadı.</p> : (
                     <table className="w-full text-left border-collapse">
                       <tbody>
                         {list.map((item, idx) => {
                           const typeKey = settingTab; 
                           const hasConstraints = constraints[typeKey][item] && constraints[typeKey][item].length > 0;
                           return (
                             <tr key={item} className="border-b border-slate-200 hover:bg-white transition-colors group">
                               <td className="p-3 font-semibold text-slate-700 text-sm">
                                 {editingItem === item ? (
                                   <input type="text" className="border-2 border-blue-400 rounded-lg px-2 py-1 w-full uppercase text-sm" autoFocus value={editValue} onChange={e=>setEditValue(e.target.value)} onBlur={() => handleRename(getSingleType(settingTab), item, editValue)} onKeyDown={e => e.key === 'Enter' && handleRename(getSingleType(settingTab), item, editValue)}/>
                                 ) : <span>{idx+1}. {item}</span>}
                               </td>
                               <td className="p-3 text-right">
                                 {editingItem !== item && (
                                   <div className="flex gap-1.5 sm:gap-2 justify-end flex-wrap">
                                     <button onClick={() => { setConstraintTargets([]); setShowConstraintTargets(false); setConstraintModal({ type: getSingleType(settingTab), name: item }); }} className={\`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 \${hasConstraints ? 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}\`}><Ban className="w-3.5 h-3.5"/> {hasConstraints ? 'Kısıtlı' : 'Koşullar'}</button>
                                     <button onClick={()=>{setEditingItem(item); setEditValue(item);}} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors bg-white border border-slate-200" title="Düzenle"><Edit2 className="w-4 h-4"/></button>
                                     <button onClick={()=>handleDeleteItem(getSingleType(settingTab), item)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors bg-white border border-slate-200" title="Sil"><Trash2 className="w-4 h-4"/></button>
                                   </div>
                                 )}
                               </td>
                             </tr>
                           )
                         })}
                       </tbody>
                     </table>
                   )}
                </div>
             </div>`;

const replacementStr = `             <div className="max-w-4xl flex flex-col h-full relative">
                <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2 hidden md:block">{title} Yönetimi ve Kısıtlamalar</h2>
                
                {/* Desktop Add Form (hidden on mobile) */}
                <div className="hidden md:flex gap-2 mb-4">
                  <input type="text" className="flex-1 border border-slate-300 p-2.5 rounded-xl focus:outline-blue-500 uppercase font-semibold text-sm" placeholder={\`Yeni \${title} Adı...\`} value={newItemName} onChange={e=>setNewItemName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddItem(getSingleType(settingTab))} />
                  <button onClick={() => handleAddItem(getSingleType(settingTab))} className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 rounded-xl font-bold text-sm flex items-center gap-1.5 shrink-0 min-h-[44px] min-w-[44px]"><Plus className="w-5 h-5"/> Ekle</button>
                </div>
                
                {/* List Container */}
                <div className="bg-slate-50 md:rounded-xl md:border border-slate-200 md:shadow-inner flex-1 overflow-auto p-0 md:p-2 custom-scrollbar pb-24 md:pb-2">
                   {list.length === 0 ? <p className="text-slate-400 p-4 text-center font-semibold text-sm">Kayıt bulunamadı.</p> : (
                     <div className="flex flex-col gap-2">
                         {list.map((item, idx) => {
                           const typeKey = settingTab; 
                           const hasConstraints = constraints[typeKey][item] && constraints[typeKey][item].length > 0;
                           return (
                             <div key={item} className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:shadow-md transition-all active:scale-[0.99]">
                               <div className="font-semibold text-slate-700 text-sm flex-1 flex items-center">
                                 <span className="text-slate-400 mr-2 w-6 text-right">{idx+1}.</span>
                                 {editingItem === item ? (
                                   <input type="text" className="border border-blue-400 rounded-lg px-3 py-2 w-full uppercase text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]" autoFocus value={editValue} onChange={e=>setEditValue(e.target.value)} onBlur={() => handleRename(getSingleType(settingTab), item, editValue)} onKeyDown={e => e.key === 'Enter' && handleRename(getSingleType(settingTab), item, editValue)}/>
                                 ) : <span className="truncate">{item}</span>}
                               </div>
                               
                               {editingItem !== item && (
                                 <div className="flex items-center gap-2 justify-end sm:shrink-0 border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0">
                                   <button onClick={() => { setConstraintTargets([]); setShowConstraintTargets(false); setConstraintModal({ type: getSingleType(settingTab), name: item }); }} className={\`px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 flex-1 sm:flex-none min-h-[44px] \${hasConstraints ? 'bg-red-100 text-red-700 border border-red-200 active:bg-red-200' : 'bg-slate-100 text-slate-600 border border-slate-200 active:bg-slate-200'}\`}><Ban className="w-4 h-4"/> {hasConstraints ? 'Kısıtlı' : 'Koşullar'}</button>
                                   <button onClick={()=>{setEditingItem(item); setEditValue(item);}} className="p-2.5 text-blue-600 bg-blue-50 active:bg-blue-100 rounded-xl transition-colors border border-blue-100 min-h-[44px] min-w-[44px] flex items-center justify-center" title="Düzenle"><Edit2 className="w-5 h-5"/></button>
                                   <button onClick={()=>handleDeleteItem(getSingleType(settingTab), item)} className="p-2.5 text-red-600 bg-red-50 active:bg-red-100 rounded-xl transition-colors border border-red-100 min-h-[44px] min-w-[44px] flex items-center justify-center" title="Sil"><Trash2 className="w-5 h-5"/></button>
                                 </div>
                               )}
                             </div>
                           )
                         })}
                     </div>
                   )}
                </div>

                {/* Mobile Add Form (Sticky Bottom) */}
                <div className="md:hidden absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-3 shadow-[0_-4px_15px_rgba(0,0,0,0.05)] z-20 flex gap-2">
                  <input type="text" className="flex-1 border border-slate-300 p-3 rounded-xl focus:outline-blue-500 uppercase font-bold text-sm bg-white min-h-[44px]" placeholder={\`Yeni \${title}...\`} value={newItemName} onChange={e=>setNewItemName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddItem(getSingleType(settingTab))} />
                  <button onClick={() => handleAddItem(getSingleType(settingTab))} className="bg-blue-600 active:bg-blue-700 text-white px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 shrink-0 min-h-[44px] shadow-sm"><Plus className="w-5 h-5"/> Ekle</button>
                </div>
             </div>`;

if (code.includes('Kayıt bulunamadı')) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Success patch");
} else {
  console.log("Could not find target string");
}
