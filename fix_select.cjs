const fs = require('fs');
let code = fs.readFileSync('src/components/ExportReportingModal.tsx', 'utf-8');

const regex = /\{\/\* Desktop View: Multi-Select \*\/\}\n\s*<div className="hidden sm:flex flex-col w-full flex-1 border border-slate-300 bg-white rounded-xl shadow-sm overflow-hidden">[\s\S]*?<\/div>\n\s*<\/div>\n\s*<\/div>/;

const replacement = `{/* Desktop View: Multi-Select (Collapsible) */}
                <div className="hidden sm:flex flex-col w-full max-w-3xl border border-slate-300 bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* Header */}
                  <div 
                    className="flex justify-between items-center px-3 py-2.5 bg-white cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setIsMultiSelectOpen(!isMultiSelectOpen)}
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                        {exportType === "teacher"
                          ? "Öğretmen Seçimi"
                          : "Sınıf Seçimi"}
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md font-bold">
                          Çoklu Seçim
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {selectedEntities.length} kayıt seçildi. Seçimleri görmek ve düzenlemek için tıklayın.
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEntities(
                            exportType === "teacher"
                              ? [...teachers]
                              : [...classes],
                          );
                        }}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs active:scale-95"
                      >
                        Tümünü Seç
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEntities([]);
                        }}
                        className="text-xs font-bold text-slate-500 hover:text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs active:scale-95"
                      >
                        Temizle
                      </button>
                      <div className="text-slate-400 ml-1">
                        {isMultiSelectOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Content (Collapsible) */}
                  <AnimatePresence>
                    {isMultiSelectOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-200 bg-slate-50/50"
                      >
                        <div className="p-3">
                          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                            {(exportType === "teacher" ? teachers : classes).map(
                              (item) => (
                                <button
                                  key={item}
                                  onClick={() => {
                                    setSelectedEntities((prev) =>
                                      prev.includes(item)
                                        ? prev.filter((i) => i !== item)
                                        : [...prev, item],
                                    );
                                  }}
                                  className={\`px-3 py-1.5 text-[11px] rounded-lg font-extrabold transition-all shadow-2xs cursor-pointer \${
                                    selectedEntities.includes(item)
                                      ? "bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-200 ring-offset-1"
                                      : "bg-white border border-slate-300 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 font-bold"
                                  }\`}
                                >
                                  {item}
                                </button>
                              ),
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 font-semibold mt-3 flex items-center gap-1">
                            <Info className="w-3.5 h-3.5 shrink-0" />
                            <span>Önizlemede (ve sistemden yazdırmada) sadece 1. seçili kayıt görünür. Çoklu dışa aktarım için "PDF/Excel İndir"i kullanın.</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>`;

if (regex.test(code)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/components/ExportReportingModal.tsx', code);
    console.log("Regex matched and replaced!");
} else {
    console.log("Regex did not match.");
}
