const fs = require('fs');

let file = fs.readFileSync('src/App.tsx', 'utf8');

const printMenuOld = `{printMenuOpen && (
               <div className="absolute right-0 top-full mt-2 w-48 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden">
                 <button onMouseDown={() => printSchedule('ogretmen')} className="w-full text-left px-4 py-3 font-semibold text-sm hover:bg-slate-100 flex items-center gap-2 border-b border-slate-100"><Presentation className="w-4 h-4 text-indigo-600"/> Öğretmen El Programı</button>
                 <button onMouseDown={() => printSchedule('sinif')} className="w-full text-left px-4 py-3 font-semibold text-sm hover:bg-slate-100 flex items-center gap-2 border-b border-slate-100"><Users className="w-4 h-4 text-green-600"/> Sınıf El Programı</button>
                 <button onMouseDown={() => printSchedule('derslik')} className="w-full text-left px-4 py-3 font-semibold text-sm hover:bg-slate-100 flex items-center gap-2 border-b border-slate-100"><MapPin className="w-4 h-4 text-rose-600"/> Derslik El Programı</button>
                 <div className="bg-slate-50 px-3 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Çarşaf (Genel)</div>
                 <button onMouseDown={() => printSchedule('ogretmen_genel')} className="w-full text-left px-4 py-2 font-semibold text-sm hover:bg-slate-100 flex items-center gap-2"><Presentation className="w-4 h-4 text-slate-500"/> Öğretmenler</button>
                 <button onMouseDown={() => printSchedule('sinif_genel')} className="w-full text-left px-4 py-2 font-semibold text-sm hover:bg-slate-100 flex items-center gap-2"><Users className="w-4 h-4 text-slate-500"/> Sınıflar</button>
               </div>
             )}`;

const printMenuNew = `<AnimatePresence>
             {printMenuOpen && (
               <motion.div 
                 initial={{ opacity: 0, y: -10, scale: 0.95 }} 
                 animate={{ opacity: 1, y: 0, scale: 1 }} 
                 exit={{ opacity: 0, y: -10, scale: 0.95 }}
                 transition={{ duration: 0.2, ease: "easeOut" }}
                 className="absolute right-0 top-full mt-2 w-56 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-100/50 backdrop-blur-md z-50 overflow-hidden"
                 style={{ transformOrigin: 'top right' }}
               >
                 <div className="p-1">
                   <button onMouseDown={() => printSchedule('ogretmen')} className="w-full text-left px-4 py-2.5 font-semibold text-sm rounded-md hover:bg-slate-50 transition-colors flex items-center gap-2 mb-1"><Presentation className="w-4 h-4 text-indigo-600"/> Öğretmen El Programı</button>
                   <button onMouseDown={() => printSchedule('sinif')} className="w-full text-left px-4 py-2.5 font-semibold text-sm rounded-md hover:bg-slate-50 transition-colors flex items-center gap-2 mb-1"><Users className="w-4 h-4 text-green-600"/> Sınıf El Programı</button>
                   <button onMouseDown={() => printSchedule('derslik')} className="w-full text-left px-4 py-2.5 font-semibold text-sm rounded-md hover:bg-slate-50 transition-colors flex items-center gap-2"><MapPin className="w-4 h-4 text-rose-600"/> Derslik El Programı</button>
                 </div>
                 <div className="bg-slate-50/80 px-4 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider border-y border-slate-100">Çarşaf (Genel)</div>
                 <div className="p-1">
                   <button onMouseDown={() => printSchedule('ogretmen_genel')} className="w-full text-left px-4 py-2 font-medium text-sm rounded-md hover:bg-slate-50 transition-colors flex items-center gap-2 mb-1"><Presentation className="w-4 h-4 text-slate-400"/> Öğretmenler</button>
                   <button onMouseDown={() => printSchedule('sinif_genel')} className="w-full text-left px-4 py-2 font-medium text-sm rounded-md hover:bg-slate-50 transition-colors flex items-center gap-2"><Users className="w-4 h-4 text-slate-400"/> Sınıflar</button>
                 </div>
               </motion.div>
             )}
             </AnimatePresence>`;

const excelMenuOld = `{excelMenuOpen && (
               <div className="absolute right-0 top-full mt-2 w-48 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden">
                 <button onMouseDown={() => exportExcelData('ogretmen')} className="w-full text-left px-4 py-3 font-semibold text-sm hover:bg-slate-100 flex items-center gap-2 border-b border-slate-100"><Presentation className="w-4 h-4 text-emerald-600"/> Öğretmen Programları</button>
                 <button onMouseDown={() => exportExcelData('sinif')} className="w-full text-left px-4 py-3 font-semibold text-sm hover:bg-slate-100 flex items-center gap-2 border-b border-slate-100"><Users className="w-4 h-4 text-emerald-600"/> Sınıf Programları</button>
                 <div className="bg-slate-50 px-3 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Çarşaf (Genel)</div>
                 <button onMouseDown={() => exportExcelData('ogretmen_genel')} className="w-full text-left px-4 py-2 font-semibold text-sm hover:bg-slate-100 flex items-center gap-2"><Presentation className="w-4 h-4 text-slate-500"/> Öğretmenler</button>
                 <button onMouseDown={() => exportExcelData('sinif_genel')} className="w-full text-left px-4 py-2 font-semibold text-sm hover:bg-slate-100 flex items-center gap-2"><Users className="w-4 h-4 text-slate-500"/> Sınıflar</button>
               </div>
             )}`;

const excelMenuNew = `<AnimatePresence>
             {excelMenuOpen && (
               <motion.div 
                 initial={{ opacity: 0, y: -10, scale: 0.95 }} 
                 animate={{ opacity: 1, y: 0, scale: 1 }} 
                 exit={{ opacity: 0, y: -10, scale: 0.95 }}
                 transition={{ duration: 0.2, ease: "easeOut" }}
                 className="absolute right-0 top-full mt-2 w-56 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-100/50 backdrop-blur-md z-50 overflow-hidden"
                 style={{ transformOrigin: 'top right' }}
               >
                 <div className="p-1">
                   <button onMouseDown={() => exportExcelData('ogretmen')} className="w-full text-left px-4 py-2.5 font-semibold text-sm rounded-md hover:bg-slate-50 transition-colors flex items-center gap-2 mb-1"><Presentation className="w-4 h-4 text-emerald-600"/> Öğretmen Programları</button>
                   <button onMouseDown={() => exportExcelData('sinif')} className="w-full text-left px-4 py-2.5 font-semibold text-sm rounded-md hover:bg-slate-50 transition-colors flex items-center gap-2"><Users className="w-4 h-4 text-emerald-600"/> Sınıf Programları</button>
                 </div>
                 <div className="bg-slate-50/80 px-4 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider border-y border-slate-100">Çarşaf (Genel)</div>
                 <div className="p-1">
                   <button onMouseDown={() => exportExcelData('ogretmen_genel')} className="w-full text-left px-4 py-2 font-medium text-sm rounded-md hover:bg-slate-50 transition-colors flex items-center gap-2 mb-1"><Presentation className="w-4 h-4 text-slate-400"/> Öğretmenler</button>
                   <button onMouseDown={() => exportExcelData('sinif_genel')} className="w-full text-left px-4 py-2 font-medium text-sm rounded-md hover:bg-slate-50 transition-colors flex items-center gap-2"><Users className="w-4 h-4 text-slate-400"/> Sınıflar</button>
                 </div>
               </motion.div>
             )}
             </AnimatePresence>`;

const fileMenuOld = `{fileMenuOpen && (
               <div className="absolute right-0 top-full mt-2 w-48 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden">
                 <div className="bg-slate-50 px-3 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">JSON Formatı</div>
                 <button onMouseDown={() => programInputRef.current.click()} className="w-full text-left px-4 py-2 font-semibold text-sm hover:bg-slate-100 flex items-center gap-2"><Upload className="w-4 h-4 text-emerald-600"/> Program Yükle</button>
                 <button onMouseDown={exportProgramData} className="w-full text-left px-4 py-2 font-semibold text-sm hover:bg-slate-100 flex items-center gap-2 border-b border-slate-100"><Save className="w-4 h-4 text-blue-600"/> Program Kaydet</button>
                 <div className="bg-slate-50 px-3 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">XML Formatı</div>
                 <button onMouseDown={() => fileInputRef.current.click()} className="w-full text-left px-4 py-2 font-semibold text-sm hover:bg-slate-100 flex items-center gap-2"><Upload className="w-4 h-4 text-amber-600"/> XML Yükle</button>
                 <button onMouseDown={exportXMLData} className="w-full text-left px-4 py-2 font-semibold text-sm hover:bg-slate-100 flex items-center gap-2"><Save className="w-4 h-4 text-indigo-600"/> XML Kaydet</button>
               </div>
             )}`;

const fileMenuNew = `<AnimatePresence>
             {fileMenuOpen && (
               <motion.div 
                 initial={{ opacity: 0, y: -10, scale: 0.95 }} 
                 animate={{ opacity: 1, y: 0, scale: 1 }} 
                 exit={{ opacity: 0, y: -10, scale: 0.95 }}
                 transition={{ duration: 0.2, ease: "easeOut" }}
                 className="absolute right-0 top-full mt-2 w-56 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-100/50 backdrop-blur-md z-50 overflow-hidden"
                 style={{ transformOrigin: 'top right' }}
               >
                 <div className="bg-slate-50/80 px-4 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">JSON Formatı (Tam Yedek)</div>
                 <div className="p-1">
                   <button onMouseDown={() => programInputRef.current.click()} className="w-full text-left px-4 py-2.5 font-semibold text-sm rounded-md hover:bg-slate-50 transition-colors flex items-center gap-2 mb-1"><Upload className="w-4 h-4 text-emerald-600"/> Program Yükle</button>
                   <button onMouseDown={exportProgramData} className="w-full text-left px-4 py-2.5 font-semibold text-sm rounded-md hover:bg-slate-50 transition-colors flex items-center gap-2"><Save className="w-4 h-4 text-blue-600"/> Program Kaydet</button>
                 </div>
                 <div className="bg-slate-50/80 px-4 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider border-y border-slate-100">XML Formatı (Asc Timetables)</div>
                 <div className="p-1">
                   <button onMouseDown={() => fileInputRef.current.click()} className="w-full text-left px-4 py-2.5 font-medium text-sm rounded-md hover:bg-slate-50 transition-colors flex items-center gap-2 mb-1"><Upload className="w-4 h-4 text-amber-500"/> XML Yükle</button>
                   <button onMouseDown={exportXMLData} className="w-full text-left px-4 py-2.5 font-medium text-sm rounded-md hover:bg-slate-50 transition-colors flex items-center gap-2"><Save className="w-4 h-4 text-indigo-500"/> XML Kaydet</button>
                 </div>
               </motion.div>
             )}
             </AnimatePresence>`;

file = file.replace(printMenuOld, printMenuNew);
file = file.replace(excelMenuOld, excelMenuNew);
file = file.replace(fileMenuOld, fileMenuNew);

fs.writeFileSync('src/App.tsx', file);
console.log("Menus updated successfully.");
