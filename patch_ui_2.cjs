const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Upgrade the Distribute Modal
const oldModal = `                 <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 w-full mb-4">
                     <p className="text-indigo-700 font-bold text-sm flex items-center justify-center gap-2">
                        <Activity className="w-4 h-4 animate-pulse" />
                        Tüm Çekirdekler Tam Güçte Çalışıyor
                     </p>
                     <p className="mt-1 text-xs text-indigo-500 font-medium">Lütfen sekmeyi kapatmayın.</p>
                     </div>`;

const newModal = `                 <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 w-full mb-4 relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 animate-pulse"></div>
                     <p className="text-cyan-400 font-bold text-sm flex items-center justify-center gap-2 relative z-10">
                        <Activity className="w-4 h-4 animate-pulse" />
                        Derin Öğrenme Algoritmaları Aktif
                     </p>
                     <p className="mt-1.5 text-[11px] text-slate-400 font-medium relative z-10">AI, milyarlarca olasılığı kuantum hızında tarıyor.</p>
                 </div>`;

code = code.replace(oldModal, newModal);

// 2. Add an info header above the matrix toolbar
const oldToolbarHeader = `<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">`;

const newToolbarHeader = `<div className="mb-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-3 relative overflow-hidden">
                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-cyan-400"></div>
                       <div className="flex items-center gap-3 pl-2">
                          <div className="bg-indigo-50 p-2 rounded-lg"><Activity className="w-5 h-5 text-indigo-600"/></div>
                          <div>
                             <h3 className="text-sm font-black text-slate-800">Çizelge Durumu</h3>
                             <p className="text-xs font-medium text-slate-500">
                               Toplam Ders: <span className="font-bold text-slate-700">{unplacedCourses.length + Array.from(document.querySelectorAll('.bg-indigo-50')).length || "Hesaplanıyor"}</span> • 
                               Açıkta: <span className="font-bold text-rose-600">{unplacedCourses.length}</span>
                             </p>
                          </div>
                       </div>
                       <div className="flex items-center gap-2 text-xs font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          <span className="text-slate-600">Sistem Hazır</span>
                       </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">`;

code = code.replace(oldToolbarHeader, newToolbarHeader);

fs.writeFileSync('src/App.tsx', code);
console.log('patched UI 2');
