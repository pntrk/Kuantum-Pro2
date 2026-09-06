import re

with open('src/components/DutyManager.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

modals = """
      {/* Quick Cover Modal */}
      {showQuickCoverModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
             <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="font-black text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" /> Hızlı Gelmeyen Bildirimi
                </h3>
                <button onClick={() => setShowQuickCoverModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
             </div>
             
             <div className="p-5 flex flex-col gap-4">
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Personel Seçin</label>
                   <select 
                     value={quickCoverTeacher} 
                     onChange={(e) => setQuickCoverTeacher(e.target.value)}
                     className="w-full p-3 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 outline-none focus:border-indigo-500"
                   >
                      <option value="">-- Personel Seç --</option>
                      {teachers.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                   </select>
                </div>
                
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Durum</label>
                   <select 
                     value={quickCoverStatus} 
                     onChange={(e) => setQuickCoverStatus(e.target.value)}
                     className="w-full p-3 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 outline-none focus:border-indigo-500"
                   >
                      <option value="raporlu">Raporlu</option>
                      <option value="izinli">İzinli</option>
                      <option value="görevli">Görevli</option>
                      <option value="mazeretsiz">Mazeretsiz</option>
                   </select>
                </div>
                
                <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 flex items-start gap-2 mt-2">
                   <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                   <p className="text-xs text-indigo-800 font-medium leading-relaxed">
                     Kaydet'e bastığınızda personelin durumu güncellenecek, boş geçen derslerine uygun nöbetçi öğretmenler <b>otomatik olarak atanacak</b> ve tebliğ ekranı açılacaktır.
                   </p>
                </div>
             </div>
             
             <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
                <button onClick={() => setShowQuickCoverModal(false)} className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700 transition-colors">İptal</button>
                <button onClick={handleQuickCoverSubmit} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-md hover:bg-indigo-700">
                   Kaydet ve Dağıt
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Share Announcement Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
             <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
                <h3 className="font-black text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" /> Tebliğ / Duyuru Paylaş
                </h3>
                <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
             </div>
             
             <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
                <p className="text-xs text-slate-500 font-medium mb-3">Bu metni kopyalayarak WhatsApp vb. kanallardan idari gruplarınızla paylaşabilirsiniz.</p>
                <textarea 
                  readOnly 
                  value={generateShareText()} 
                  className="w-full h-[350px] p-4 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm text-slate-700 outline-none resize-none focus:border-indigo-400"
                ></textarea>
             </div>
             
             <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0">
                <button onClick={() => setShowShareModal(false)} className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700 transition-colors">Kapat</button>
                <button 
                  onClick={() => {
                     navigator.clipboard.writeText(generateShareText());
                     setSuccessMessage("Metin panoya kopyalandı!");
                     setTimeout(() => setSuccessMessage(''), 3000);
                  }} 
                  className="bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold transition-colors shadow-md hover:bg-slate-900 flex items-center gap-2"
                >
                   <ClipboardCheck className="w-4 h-4"/> Kopyala
                </button>
                <a 
                  href={`https://wa.me/?text=${encodeURIComponent(generateShareText())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-md hover:bg-emerald-700 flex items-center gap-2"
                >
                   WhatsApp'ta Paylaş
                </a>
             </div>
          </div>
        </div>
      )}
"""

code = code.replace("{printModalOpen && (", modals + "\n      {printModalOpen && (", 1)

with open('src/components/DutyManager.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
