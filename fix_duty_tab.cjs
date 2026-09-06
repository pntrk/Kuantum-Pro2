const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldDutyBlock = `        ) : mainTab === 'duty' ? (
          <div className="h-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col h-[calc(100vh-140px)]">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                 <div>
                     <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <ClipboardCheck className="w-7 h-7 text-indigo-600" /> Nöbet Asistanı
                     </h2>
                     <p className="text-slate-500 font-medium text-sm mt-1">Nöbet yerleri ve nöbetçi atamalarını buradan yönetin.</p>
                 </div>
                 <button className="bg-indigo-600 text-white font-bold py-2.5 px-5 rounded-lg text-sm hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2">
                     <Plus className="w-4 h-4"/> Yeni Kural Ekle
                 </button>
             </div>
             
             <div className="flex-1 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-center p-8">
                 <ClipboardCheck className="w-16 h-16 text-slate-300 mb-4" />
                 <h3 className="text-xl font-bold text-slate-700 mb-2">Henüz İçerik Yok</h3>
                 <p className="text-slate-500 max-w-md text-sm leading-relaxed">
                   Nöbet asistanı menüsünü adım adım beraber oluşturacağız. İlk özellik olarak ne eklemek istersiniz?
                 </p>
             </div>
          </div>
        ) : (`;

const newDutyBlock = `        ) : mainTab === 'duty' ? (
          <div className="h-full bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-[calc(100vh-140px)]">
             <DutyManager teachers={teachers} schedules={schedules} />
          </div>
        ) : (`;

if (content.includes(oldDutyBlock)) {
    content = content.replace(oldDutyBlock, newDutyBlock);
    fs.writeFileSync('src/App.tsx', content);
    console.log("Duty block replaced successfully");
} else {
    console.log("Could not find old duty block");
}
