const fs = require('fs');
let code = fs.readFileSync('src/components/ExportReportingModal.tsx', 'utf8');

let target3 = `<div className="flex bg-slate-100/80 p-1 rounded-lg">
                <button 
                  onClick={() => setActiveTab('print')}
                  className={\`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-md transition-all \${activeTab === 'print' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}\`}
                >
                  <Printer className="w-4 h-4" /> Baskı & Çıktı
                </button>
                <button 
                  onClick={() => setActiveTab('qr')}
                  className={\`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-md transition-all \${activeTab === 'qr' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}\`}
                >
                  <QrCode className="w-4 h-4" /> Mobil Paylaşım
                </button>
              </div>`;

let replacement3 = `<div className="flex bg-slate-200/50 p-1 rounded-lg shrink-0">
                <button 
                  onPointerDown={(e) => { e.preventDefault(); setActiveTab('print'); }}
                  className={\`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-[11px] md:text-xs font-bold rounded-md transition-all \${activeTab === 'print' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 active:bg-slate-200'}\`}
                >
                  <Printer className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="truncate">Baskı & Çıktı</span>
                </button>
                <button 
                  onPointerDown={(e) => { e.preventDefault(); setActiveTab('qr'); }}
                  className={\`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-[11px] md:text-xs font-bold rounded-md transition-all \${activeTab === 'qr' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900 active:bg-slate-200'}\`}
                >
                  <QrCode className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="truncate">Mobil Paylaşım</span>
                </button>
              </div>`;
code = code.replace(target3, replacement3);

fs.writeFileSync('src/components/ExportReportingModal.tsx', code);
console.log("Success patch tabs");
