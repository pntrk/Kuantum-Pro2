const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldOpening = `                                   <div key={card.id} className={\`relative rounded-lg shadow-xs border-l-[4px] group select-none overflow-hidden \${cClass} \${status.cardBorderClass}\`}>
                                       {/* Mobile Swipe Action Buttons (Background layer) */}
                                       <div className="md:hidden absolute inset-y-0 right-0 w-32 flex items-center justify-end pr-2 gap-1.5 z-0">
                                          <button onPointerDown={(e) => { e.stopPropagation(); setInspectingCard(card); }} onClick={(e) => e.stopPropagation()} className="p-2 text-indigo-600 bg-white/90 rounded-full shadow-sm active:scale-95 transition-transform"><Search className="w-4 h-4"/></button>
                                          <button onPointerDown={(e) => { e.stopPropagation(); editPoolCard(card); setPoolMenuOpen(true); }} onClick={(e) => e.stopPropagation()} className="p-2 text-blue-600 bg-white/90 rounded-full shadow-sm active:scale-95 transition-transform"><Edit2 className="w-4 h-4"/></button>
                                          <button onPointerDown={(e) => { e.stopPropagation(); handleDeletePoolCard(card.id); }} onClick={(e) => e.stopPropagation()} className="p-2 text-red-600 bg-white/90 rounded-full shadow-sm active:scale-95 transition-transform"><Trash2 className="w-4 h-4"/></button>
                                       </div>
                                       
                                       {/* Scrollable Container */}
                                       <div className="relative z-10 w-full overflow-x-auto hide-scrollbar snap-x snap-mandatory flex">
                                            {/* Foreground Card */}
                                            <div draggable onDragStart={(e) => handlePoolDragStart(e, card)} onDragEnd={handleDragEnd}
                                                 onClick={() => { editPoolCard(card); setPoolMenuOpen(true); }}
                                                 className={\`w-full shrink-0 snap-start relative p-2.5 cursor-grab md:hover:-translate-y-0.5 md:hover:shadow-md transition-transform \${cClass} rounded-r-lg\`}>`;

const newOpening = `                                   <div key={card.id} className={\`relative rounded-lg shadow-xs border-l-[4px] group select-none overflow-hidden \${cClass} \${status.cardBorderClass}\`}>
                                       {/* Scrollable Container */}
                                       <div className="w-full overflow-x-auto hide-scrollbar snap-x snap-mandatory flex items-stretch">
                                            {/* Foreground Card */}
                                            <div draggable onDragStart={(e) => handlePoolDragStart(e, card)} onDragEnd={handleDragEnd}
                                                 onClick={() => { editPoolCard(card); setPoolMenuOpen(true); }}
                                                 className="w-full shrink-0 snap-start relative p-2.5 cursor-grab md:hover:-translate-y-0.5 md:hover:shadow-md transition-transform rounded-r-lg">`;


const oldEnding = `                                         <span className="flex items-center gap-1 text-[10px] font-black text-white bg-slate-900 px-2 py-0.5 rounded-full shadow-xs"><Clock className="w-3 h-3"/> {card.hours}s Blok</span>
                                      </div>
                                   </div>
                                   {/* Spacer for swipe reveal */}
                                   <div className="w-[110px] shrink-0 snap-end md:hidden pointer-events-none"></div>
                               </div>
                               </div>
                                )
                            })}
                        </div>`;

const newEnding = `                                         <span className="flex items-center gap-1 text-[10px] font-black text-white bg-slate-900 px-2 py-0.5 rounded-full shadow-xs"><Clock className="w-3 h-3"/> {card.hours}s Blok</span>
                                      </div>
                                   </div>
                                   {/* Mobile Swipe Action Buttons */}
                                   <div className="md:hidden flex items-center justify-end px-3 gap-2 shrink-0 snap-end">
                                      <button onPointerDown={(e) => { e.stopPropagation(); setInspectingCard(card); }} onClick={(e) => e.stopPropagation()} className="p-2.5 text-indigo-600 bg-white/90 rounded-full shadow-sm active:scale-95 transition-transform"><Search className="w-4 h-4"/></button>
                                      <button onPointerDown={(e) => { e.stopPropagation(); editPoolCard(card); setPoolMenuOpen(true); }} onClick={(e) => e.stopPropagation()} className="p-2.5 text-blue-600 bg-white/90 rounded-full shadow-sm active:scale-95 transition-transform"><Edit2 className="w-4 h-4"/></button>
                                      <button onPointerDown={(e) => { e.stopPropagation(); handleDeletePoolCard(card.id); }} onClick={(e) => e.stopPropagation()} className="p-2.5 text-red-600 bg-white/90 rounded-full shadow-sm active:scale-95 transition-transform"><Trash2 className="w-4 h-4"/></button>
                                   </div>
                               </div>
                               </div>
                                )
                            })}
                        </div>`;

if (code.includes(oldOpening)) {
  code = code.replace(oldOpening, newOpening);
  code = code.replace(oldEnding, newEnding);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Success phase 3");
} else {
  console.log("oldOpening not found!");
}
