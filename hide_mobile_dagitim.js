import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Remove the Dağıtım button and change grid-cols-4 to grid-cols-3
content = content.replace(
  /<div className="md:hidden fixed bottom-0 left-0 right-0 bg-white\/95 backdrop-blur-md border-t border-slate-200\/90 shadow-\[0_-8px_25px_rgba\(0,0,0,0\.06\)\] z-\[100\] grid grid-cols-4 items-center px-3 py-1\.5 pb-\[max\(0\.5rem,env\(safe-area-inset-bottom\)\)\]">\s*<button onPointerDown=\{\(e\) => \{ e\.preventDefault\(\); setMainTab\('matrix'\); \}\} className=\{`flex flex-col items-center justify-center gap-1 w-full min-h-\[46px\] py-1 px-2 rounded-xl transition-all active:scale-95 touch-manipulation \$\{mainTab === 'matrix' \? 'text-indigo-600 bg-indigo-50\/90 font-bold shadow-2xs' : 'text-slate-500 hover:text-slate-800'\}`\}>\s*<LayoutGrid className=\{`w-5 h-5 transition-transform \$\{mainTab === 'matrix' \? 'scale-110 stroke-\[2\.5\]' : 'stroke-2'\}`\}\/>\s*<span className="text-\[11px\] font-bold tracking-tight">Dağıtım<\/span>\s*<\/button>/,
  `<div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-8px_25px_rgba(0,0,0,0.06)] z-[100] grid grid-cols-3 items-center px-3 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
         <button onPointerDown={(e) => { e.preventDefault(); setMainTab('matrix'); }} className="hidden">Dağıtım</button>` // Add a hidden button to maintain structural consistency if somehow needed, or just completely remove it. Better to remove it and fix the grid.
);

fs.writeFileSync('src/App.tsx', content);
