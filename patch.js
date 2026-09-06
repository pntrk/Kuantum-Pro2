const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `                                   <div key={card.id} draggable onDragStart={(e) => handlePoolDragStart(e, card)} onDragEnd={handleDragEnd}
                                        onClick={() => { editPoolCard(card); setPoolMenuOpen(true); }}
                                        className={\`relative p-2.5 rounded-lg shadow-xs \${cClass} border-l-[4px] cursor-grab hover:-translate-y-0.5 hover:shadow-md transition-all group select-none \${status.cardBorderClass}\`}>
                                       {/* Bottleneck Warning Badge Header */}
                                       {status.category !== 'optimal' && (
                                          <div className="mb-1.5 flex items-center justify-between gap-1">
                                             <span className={\`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-black tracking-tight \${status.badgeClass}\`}>
                                                {status.category === 'dead_end' ? <ShieldAlert className="w-3 h-3 shrink-0" /> : <AlertTriangle className="w-3 h-3 shrink-0" />}
                                                <span>{status.badgeLabel}</span>
                                             </span>
                                             <button 
                                               onPointerDown={(e) => { e.stopPropagation(); setInspectingCard(card); }} onClick={(e) => e.stopPropagation()}
                                               className="text-[10px] md:text-[9px] font-bold text-indigo-700 hover:text-indigo-900 bg-white/90 px-2 py-1 md:px-1.5 md:py-0.5 rounded border border-indigo-200/60 shadow-sm md:shadow-2xs flex items-center gap-1 md:gap-0.5 shrink-0 pointer-events-auto"
                                               title="Kart Çakışma Analizörünü Aç"
                                             >
                                               <Search className="w-3 h-3 md:w-2.5 md:h-2.5" /> İncele
                                             </button>
                                          </div>
                                       )}
                                      <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
                                          <button onPointerDown={(e) => { e.stopPropagation(); setInspectingCard(card); }} onClick={(e) => e.stopPropagation()} title="Neden Yerleşemedi? (Çakışma Analizi)" className="p-1.5 md:p-1 text-slate-600 hover:text-indigo-600 bg-white/95 hover:bg-white rounded shadow-sm md:shadow-2xs border border-slate-200 md:border-transparent transition-colors pointer-events-auto"><Search className="w-3.5 h-3.5 md:w-3 md:h-3"/></button>
                                          <button onPointerDown={(e) => { e.stopPropagation(); editPoolCard(card); setPoolMenuOpen(true); }} onClick={(e) => e.stopPropagation()} className="p-1.5 md:p-1 text-slate-600 hover:text-blue-600 bg-white/95 hover:bg-white rounded shadow-sm md:shadow-2xs border border-slate-200 md:border-transparent transition-colors pointer-events-auto"><Edit2 className="w-3.5 h-3.5 md:w-3 md:h-3"/></button>
                                          <button onPointerDown={(e) => { e.stopPropagation(); handleDeletePoolCard(card.id); }} onClick={(e) => e.stopPropagation()} className="p-1.5 md:p-1 text-slate-600 hover:text-red-600 bg-white/95 hover:bg-white rounded shadow-sm md:shadow-2xs border border-slate-200 md:border-transparent transition-colors pointer-events-auto"><Trash2 className="w-3.5 h-3.5 md:w-3 md:h-3"/></button>
                                      </div>`;

const replacement = `                                   <div key={card.id} className={\`relative rounded-lg shadow-xs border-l-[4px] group select-none overflow-hidden \${cClass} \${status.cardBorderClass}\`}>
                                       {/* Mobile Swipe Action Buttons (Background layer) */}
                                       <div className="md:hidden absolute inset-y-0 right-0 w-32 flex items-center justify-end pr-2 gap-1.5 z-0">
                                          <button onPointerDown={(e) => { e.stopPropagation(); setInspectingCard(card); }} onClick={(e) => e.stopPropagation()} className="p-2 text-indigo-600 bg-white/90 rounded-full shadow-sm"><Search className="w-4 h-4"/></button>
                                          <button onPointerDown={(e) => { e.stopPropagation(); editPoolCard(card); setPoolMenuOpen(true); }} onClick={(e) => e.stopPropagation()} className="p-2 text-blue-600 bg-white/90 rounded-full shadow-sm"><Edit2 className="w-4 h-4"/></button>
                                          <button onPointerDown={(e) => { e.stopPropagation(); handleDeletePoolCard(card.id); }} onClick={(e) => e.stopPropagation()} className="p-2 text-red-600 bg-white/90 rounded-full shadow-sm"><Trash2 className="w-4 h-4"/></button>
                                       </div>
                                       
                                       {/* Scrollable Container */}
                                       <div className="relative z-10 w-full overflow-x-auto hide-scrollbar snap-x snap-mandatory flex">
                                            {/* Foreground Card */}
                                            <div draggable onDragStart={(e) => handlePoolDragStart(e, card)} onDragEnd={handleDragEnd}
                                                 onClick={() => { editPoolCard(card); setPoolMenuOpen(true); }}
                                                 className={\`w-full shrink-0 snap-start relative p-2.5 cursor-grab md:hover:-translate-y-0.5 md:hover:shadow-md transition-transform \${cClass} rounded-r-lg\`}>
                                                
                                                {/* Bottleneck Warning Badge Header */}
                                                {status.category !== 'optimal' && (
                                                   <div className="mb-1.5 flex items-center justify-between gap-1">
                                                      <span className={\`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-black tracking-tight \${status.badgeClass}\`}>
                                                         {status.category === 'dead_end' ? <ShieldAlert className="w-3 h-3 shrink-0" /> : <AlertTriangle className="w-3 h-3 shrink-0" />}
                                                         <span>{status.badgeLabel}</span>
                                                      </span>
                                                      <button
                                                         onPointerDown={(e) => { e.stopPropagation(); setInspectingCard(card); }} onClick={(e) => e.stopPropagation()}
                                                         className="text-[10px] md:text-[9px] font-bold text-indigo-700 hover:text-indigo-900 bg-white/90 px-2 py-1 md:px-1.5 md:py-0.5 rounded border border-indigo-200/60 shadow-sm md:shadow-2xs flex items-center gap-1 md:gap-0.5 shrink-0 pointer-events-auto"
                                                         title="Kart Çakışma Analizörünü Aç"
                                                      >
                                                         <Search className="w-3 h-3 md:w-2.5 md:h-2.5" /> İncele
                                                      </button>
                                                   </div>
                                                )}

                                                {/* Desktop Overlay Actions (Hidden on Mobile) */}
                                                <div className="hidden md:flex absolute top-1.5 right-1.5 gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                    <button onPointerDown={(e) => { e.stopPropagation(); setInspectingCard(card); }} onClick={(e) => e.stopPropagation()} title="Neden Yerleşemedi? (Çakışma Analizi)" className="p-1 text-slate-600 hover:text-indigo-600 bg-white/95 hover:bg-white rounded shadow-2xs transition-colors pointer-events-auto"><Search className="w-3 h-3"/></button>
                                                    <button onPointerDown={(e) => { e.stopPropagation(); editPoolCard(card); setPoolMenuOpen(true); }} onClick={(e) => e.stopPropagation()} className="p-1 text-slate-600 hover:text-blue-600 bg-white/95 hover:bg-white rounded shadow-2xs transition-colors pointer-events-auto"><Edit2 className="w-3 h-3"/></button>
                                                    <button onPointerDown={(e) => { e.stopPropagation(); handleDeletePoolCard(card.id); }} onClick={(e) => e.stopPropagation()} className="p-1 text-slate-600 hover:text-red-600 bg-white/95 hover:bg-white rounded shadow-2xs transition-colors pointer-events-auto"><Trash2 className="w-3 h-3"/></button>
                                                </div>`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Success");
} else {
  console.log("Target string not found.");
}
