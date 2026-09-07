import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove Mobile Matrix Sub-nav
content = content.replace(
  /\s*\{\/\*\s*Mobile Sub-Navigation Bar for Matrix View\s*\*\/\}[\s\S]*?<\/div>\s*<\/div>\s*\{\/\*\s*Mobile-only Timeline View.*?(\n\s*<div className={`md:hidden flex-1)/,
  `\n             {/* Mobile-only Timeline View (Kompakt Ders Blokları & Akıllı Hücre Taşıma) */}
             <div className="md:hidden flex-1 h-full w-full overflow-hidden flex flex-col">`
);

// Remove the inline previewer inside Matrix tab
content = content.replace(
  /\s*\{\/\*\s*Mobile-only Previewer\s*\*\/\}[\s\S]*?<\/div>\s*<div className={`w-full md:w-80 shrink-0/m,
  `\n             <div className="w-full md:w-80 shrink-0`
);

// Make the pool and interactive desktop-only by removing the dynamic class conditionally
content = content.replace(
  /className=\{`w-full md:w-80 shrink-0 bg-white rounded-xl shadow-sm border border-slate-200 flex-col h-full \$\{mobileMatrixTab === 'pool' \? 'flex' : 'hidden md:flex'\}`\}/g,
  `className="w-full md:w-80 shrink-0 bg-white rounded-xl shadow-sm border border-slate-200 flex-col h-full hidden md:flex"`
);

content = content.replace(
  /className=\{`flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex-col overflow-hidden relative \$\{mobileMatrixTab === 'interactive' \? 'flex' : 'hidden md:flex'\}`\}/g,
  `className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex-col overflow-hidden relative hidden md:flex"`
);

// Add the 'preview' mainTab handling
content = content.replace(
  /(\s*)\) : mainTab === 'duty' \? \(/,
  `$1) : mainTab === 'preview' ? (
          <div key={workspaceKey + '_prev'} className="h-full bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden min-h-0">
             <ExportReportingModal
                 isOpen={true}
                 isInline={true}
                 onClose={() => {}}
                 schedules={schedules}
                 classSchedules={classSchedules}
                 teachers={teachers}
                 classes={classes}
                 schoolInfo={schoolInfo}
                 schoolSettings={schoolSettings}
             />
          </div>$1) : mainTab === 'duty' ? (`
);

// Update bottom navigation bar
content = content.replace(
  /className="md:hidden fixed bottom-0 left-0 right-0 bg-white\/95 backdrop-blur-md border-t border-slate-200\/90 shadow-\[0_-8px_25px_rgba\(0,0,0,0\.06\)\] z-\[100\] grid grid-cols-3 items-center/g,
  `className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-8px_25px_rgba(0,0,0,0.06)] z-[100] grid grid-cols-4 items-center`
);

content = content.replace(
  /Dağıtım<\/span>\s*<\/button>/,
  `Dağıtım</span>
         </button>
         <button onPointerDown={(e) => { e.preventDefault(); setMainTab('preview'); }} className={\`flex flex-col items-center justify-center gap-1 w-full min-h-[46px] py-1 px-2 rounded-xl transition-all active:scale-95 touch-manipulation \${mainTab === 'preview' ? 'text-indigo-600 bg-indigo-50/90 font-bold shadow-2xs' : 'text-slate-500 hover:text-slate-800'}\`}>
           <Eye className={\`w-5 h-5 transition-transform \${mainTab === 'preview' ? 'scale-110 stroke-[2.5]' : 'stroke-2'}\`}/>
           <span className="text-[11px] font-bold tracking-tight">Önizleme</span>
         </button>`
);

fs.writeFileSync('src/App.tsx', content);
