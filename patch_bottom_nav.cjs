const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Hide the top main tabs on mobile
const topTabsTarget = `<div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700 overflow-x-auto max-w-full whitespace-nowrap custom-scrollbar shrink-0">`;
const topTabsReplacement = `<div className="hidden md:flex bg-slate-800 rounded-xl p-1 border border-slate-700 overflow-x-auto max-w-full whitespace-nowrap custom-scrollbar shrink-0">`;
code = code.replace(topTabsTarget, topTabsReplacement);

// 2. Add bottom padding to main content wrapper on mobile
const contentTarget = `<div className="flex-1 overflow-hidden p-0 md:p-4 md:pb-4">`;
const contentReplacement = `<div className="flex-1 overflow-hidden p-0 pb-[72px] md:p-4 md:pb-4">`;
code = code.replace(contentTarget, contentReplacement);

// 3. Add bottom navigation bar before the closing div of App
const footerTarget = `      <div className="bg-[#111827] border-t border-slate-800 px-4 py-2 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 font-medium shrink-0 gap-1 relative z-[60]">
        <div>
          <span>Kuantum Pro © {new Date().getFullYear()}</span>
        </div>
        <div>
          <span>Geliştirici: <strong className="text-indigo-400">Bahadır Şafak Kumcu</strong></span>
        </div>
      </div>
    </div>`;

const footerReplacement = `      <div className="hidden md:flex bg-[#111827] border-t border-slate-800 px-4 py-2 flex-col sm:flex-row justify-between items-center text-[10px] text-slate-400 font-medium shrink-0 gap-1 relative z-[60]">
        <div>
          <span>Kuantum Pro © {new Date().getFullYear()}</span>
        </div>
        <div>
          <span>Geliştirici: <strong className="text-indigo-400">Bahadır Şafak Kumcu</strong></span>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-[100] flex items-center justify-around p-1.5 pb-2">
         <button onPointerDown={(e) => { e.preventDefault(); setMainTab('matrix'); }} className={\`flex flex-col items-center justify-center gap-1 w-full p-2 rounded-xl transition-colors active:scale-95 \${mainTab === 'matrix' ? 'text-indigo-600 bg-indigo-50/80 shadow-sm' : 'text-slate-500 hover:text-indigo-500 active:bg-slate-100'}\`}>
           <LayoutGrid className="w-5 h-5"/>
           <span className="text-[10px] font-bold">Dağıtım</span>
         </button>
         <button onPointerDown={(e) => { e.preventDefault(); setMainTab('duty'); }} className={\`flex flex-col items-center justify-center gap-1 w-full p-2 rounded-xl transition-colors active:scale-95 \${mainTab === 'duty' ? 'text-indigo-600 bg-indigo-50/80 shadow-sm' : 'text-slate-500 hover:text-indigo-500 active:bg-slate-100'}\`}>
           <ClipboardCheck className="w-5 h-5"/>
           <span className="text-[10px] font-bold">Nöbet</span>
         </button>
         <button onPointerDown={(e) => { e.preventDefault(); setMainTab('settings'); }} className={\`flex flex-col items-center justify-center gap-1 w-full p-2 rounded-xl transition-colors active:scale-95 \${mainTab === 'settings' ? 'text-indigo-600 bg-indigo-50/80 shadow-sm' : 'text-slate-500 hover:text-indigo-500 active:bg-slate-100'}\`}>
           <Settings className="w-5 h-5"/>
           <span className="text-[10px] font-bold">Ayarlar</span>
         </button>
      </div>
    </div>`;

code = code.replace(footerTarget, footerReplacement);

fs.writeFileSync('src/App.tsx', code);
console.log("Success patch bottom nav");
