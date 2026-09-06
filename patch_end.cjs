const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `                                         <span className="flex items-center gap-1 text-[10px] font-black text-white bg-slate-900 px-2 py-0.5 rounded-full shadow-xs"><Clock className="w-3 h-3"/> {card.hours}s Blok</span>
                                      </div>
                                   </div>
                                )
                            })}
                        </div>`;

const replacement = `                                         <span className="flex items-center gap-1 text-[10px] font-black text-white bg-slate-900 px-2 py-0.5 rounded-full shadow-xs"><Clock className="w-3 h-3"/> {card.hours}s Blok</span>
                                      </div>
                                   </div>
                                   {/* Spacer for swipe reveal */}
                                   <div className="w-[110px] shrink-0 snap-end md:hidden pointer-events-none"></div>
                               </div>
                               </div>
                                )
                            })}
                        </div>`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Success phase 2");
} else {
  console.log("Target string not found.");
}
