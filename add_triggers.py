import re

with open('src/components/DutyManager.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

btn_mobile = """                {/* 2. MOBILE VIEW: Responsive Card List */}
                <div className="md:hidden flex flex-col gap-3">
                  
                  {/* Mobile Quick Action Button */}
                  <div className="flex gap-2">
                     <button 
                       onClick={() => setShowQuickCoverModal(true)}
                       className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 flex flex-col items-center justify-center gap-2 border border-indigo-500"
                     >
                        <Wand2 className="w-6 h-6 text-indigo-100" />
                        <span className="font-black text-sm">Hızlı Gelmeyen Bildir & Dağıt</span>
                     </button>
                     <button 
                       onClick={() => setShowShareModal(true)}
                       className="bg-white text-indigo-700 border border-indigo-200 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 flex flex-col items-center justify-center gap-2 min-w-[90px]"
                     >
                        <FileText className="w-6 h-6" />
                        <span className="font-bold text-[10px]">Tebliğ</span>
                     </button>
                  </div>"""

code = code.replace("""                {/* 2. MOBILE VIEW: Responsive Card List */}
                <div className="md:hidden flex flex-col gap-3">""", btn_mobile)


# Also let's add the button to the header of Covers container
desktop_btn = """              <div className="flex items-center gap-2 w-full md:w-auto">
                <button 
                  onClick={() => setShowShareModal(true)}
                  className="bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-2 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 min-h-[40px] shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" /> Tebliğ / Duyuru Paylaş
                </button>
                <button"""

code = code.replace("""              <div className="flex items-center gap-2 w-full md:w-auto">
                <button""", desktop_btn)


with open('src/components/DutyManager.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
