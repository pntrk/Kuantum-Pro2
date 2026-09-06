const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `                                                             <>
                                                                {/* Desktop Hover Overlay */}
                                                                <div className="hidden md:flex absolute inset-0 bg-slate-900/15 backdrop-blur-[0.5px] opacity-0 group-hover/cell:opacity-100 transition-opacity rounded-[3px] items-center justify-center gap-1.5 pointer-events-none z-20">
                                                                    <button className="pointer-events-auto p-1.5 bg-white rounded-md text-slate-700 hover:text-blue-600 hover:scale-105 shadow-sm transition-all" title="Kartı Düzenle" onPointerDown={(e) => { e.stopPropagation(); editPoolCard({...cData, hours: blockSize}); setPoolMenuOpen(true); }} onClick={(e) => e.stopPropagation()}><Edit2 className="w-3 h-3"/></button>
                                                                    <button className={\`pointer-events-auto p-1.5 bg-white rounded-md \${isLocked ? "text-amber-600 hover:text-slate-700" : "text-slate-700 hover:text-amber-600"} hover:scale-105 shadow-sm transition-all\`} title={isLocked ? "Kilidi Aç" : "Kilitle"} onPointerDown={(e) => toggleLock(e, lockEntity, absDIdx, pIdx, blockSize)} onClick={(e) => e.stopPropagation()}>
                                                                       {isLocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3"/>}
                                                                    </button>
                                                                </div>
                                                                {/* Mobile Action Bar */}
                                                                <div className="md:hidden absolute bottom-0 right-0 flex gap-0.5 p-0.5 z-20 pointer-events-auto">
                                                                    <button className="p-1.5 bg-white/95 backdrop-blur-sm rounded text-slate-700 active:bg-slate-200 shadow-sm border border-slate-200/50" title="Kartı Düzenle" onPointerDown={(e) => { e.stopPropagation(); editPoolCard({...cData, hours: blockSize}); setPoolMenuOpen(true); }} onClick={(e) => e.stopPropagation()}><Edit2 className="w-3 h-3"/></button>
                                                                    <button className={\`p-1.5 bg-white/95 backdrop-blur-sm rounded \${isLocked ? "text-amber-600" : "text-slate-700"} active:bg-slate-200 shadow-sm border border-slate-200/50\`} title={isLocked ? "Kilidi Aç" : "Kilitle"} onPointerDown={(e) => toggleLock(e, lockEntity, absDIdx, pIdx, blockSize)} onClick={(e) => e.stopPropagation()}>
                                                                       {isLocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3"/>}
                                                                    </button>
                                                                </div>
                                                             </>`;

const replacement = `                                                             {/* Universal Hover/Tap Overlay */}
                                                             <div className="absolute inset-0 bg-slate-900/15 backdrop-blur-[0.5px] opacity-0 group-hover/cell:opacity-100 transition-opacity rounded-[3px] flex items-center justify-center gap-1.5 pointer-events-none z-20" tabIndex={0}>
                                                                 <button className="pointer-events-auto p-2 md:p-1.5 bg-white rounded-md text-slate-700 hover:text-blue-600 active:scale-95 shadow-sm transition-all" title="Kartı Düzenle" onPointerDown={(e) => { e.stopPropagation(); editPoolCard({...cData, hours: blockSize}); setPoolMenuOpen(true); }} onClick={(e) => e.stopPropagation()}><Edit2 className="w-4 h-4 md:w-3 md:h-3"/></button>
                                                                 <button className={\`pointer-events-auto p-2 md:p-1.5 bg-white rounded-md \${isLocked ? "text-amber-600 hover:text-slate-700" : "text-slate-700 hover:text-amber-600"} active:scale-95 shadow-sm transition-all\`} title={isLocked ? "Kilidi Aç" : "Kilitle"} onPointerDown={(e) => toggleLock(e, lockEntity, absDIdx, pIdx, blockSize)} onClick={(e) => e.stopPropagation()}>
                                                                    {isLocked ? <Unlock className="w-4 h-4 md:w-3 md:h-3" /> : <Lock className="w-4 h-4 md:w-3 md:h-3"/>}
                                                                 </button>
                                                             </div>`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Success table cell");
} else {
  console.log("target string not found.");
}
