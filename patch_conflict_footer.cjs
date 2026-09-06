const fs = require('fs');
let code = fs.readFileSync('src/components/ConflictInspectorModal.tsx', 'utf8');

const target = `        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-medium">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Kırmızı çakışmalı dersleri çözmek için o saatteki dersleri sürükleyerek kaydırabilirsiniz.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors shadow-xs"
          >
            Kapat
          </button>
        </div>`;

const rep = `        <div className="px-4 md:px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500 sticky bottom-0 w-full z-10 shrink-0">
          <div className="flex items-center justify-center text-center md:text-left gap-1.5 font-medium">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Kırmızı çakışmalı dersleri çözmek için o saatteki dersleri sürükleyerek kaydırabilirsiniz.</span>
          </div>
          <button
            onClick={onClose}
            className="w-full md:w-auto px-4 py-3 md:py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors shadow-xs min-h-[44px] text-sm md:text-xs shrink-0"
          >
            Kapat
          </button>
        </div>`;

code = code.replace(target, rep);
fs.writeFileSync('src/components/ConflictInspectorModal.tsx', code);
console.log("Conflict footer patched");
