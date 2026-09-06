const fs = require('fs');
let code = fs.readFileSync('src/components/DutyManager.tsx', 'utf8');

const targetStr = `                                     <div key={t} className={\`bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1.5 rounded-md flex justify-between items-center group/item shadow-sm \${ringClass}\`}>
                                        <span className="flex flex-col items-start gap-0.5">
                                          <span className="flex items-center gap-1">
                                            {t}
                                            {isMultiple && <AlertTriangle className="w-3.5 h-3.5 text-red-500" title="Haftada birden fazla nöbet" />}
                                          </span>
                                          {isNotActive && (
                                            <span className="text-[9px] uppercase font-black bg-white/70 px-1 py-0.2 rounded mt-0.5 border">
                                              {status}
                                            </span>
                                          )}
                                        </span>
                                        <button 
                                          onClick={(e) => removeAssignment(loc, day.id, t, e)}
                                          className="text-indigo-400 hover:text-rose-500 sm:opacity-0 sm:group-hover/item:opacity-100 transition-opacity ml-1.5 p-1 hover:bg-white/50 rounded"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                     </div>`;

const replacement = `                                     <div key={t} className={\`relative overflow-hidden rounded-md group/item shadow-sm \${ringClass || 'bg-indigo-100 text-indigo-800'}\`}>
                                        <div className="flex w-full overflow-x-auto hide-scrollbar snap-x snap-mandatory">
                                          {/* Main Content */}
                                          <div className="flex-1 w-full shrink-0 snap-start flex justify-between items-center px-2 py-1.5">
                                            <span className="flex flex-col items-start gap-0.5">
                                              <span className="flex items-center gap-1 text-xs font-bold">
                                                {t}
                                                {isMultiple && <AlertTriangle className="w-3.5 h-3.5 text-red-500" title="Haftada birden fazla nöbet" />}
                                              </span>
                                              {isNotActive && (
                                                <span className="text-[9px] uppercase font-black bg-white/70 px-1 py-0.2 rounded mt-0.5 border">
                                                  {status}
                                                </span>
                                              )}
                                            </span>
                                            {/* Desktop hover icon (hidden on mobile) */}
                                            <button 
                                              onClick={(e) => removeAssignment(loc, day.id, t, e)}
                                              className="hidden md:flex text-indigo-400 hover:text-rose-500 opacity-0 group-hover/item:opacity-100 transition-opacity ml-1.5 p-1 hover:bg-white/50 rounded"
                                              title="Sil"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                          {/* Mobile Swipe Action */}
                                          <div className="md:hidden shrink-0 snap-start flex items-center justify-center bg-rose-500 text-white px-3">
                                            <button 
                                              onClick={(e) => removeAssignment(loc, day.id, t, e)}
                                              className="p-1"
                                              title="Sil"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          </div>
                                        </div>
                                     </div>`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacement);
  fs.writeFileSync('src/components/DutyManager.tsx', code);
  console.log("Success patch duty cell");
} else {
  console.log("target string not found.");
}
