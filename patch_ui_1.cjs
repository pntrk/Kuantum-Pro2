const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Change header background
code = code.replace(
    'className="bg-[#1e293b] text-white p-3 md:p-4 shadow-lg shrink-0 flex flex-col md:flex-row justify-between items-center relative z-[60]"',
    'className="bg-slate-950 text-white p-3 md:p-4 shadow-xl border-b border-white/5 shrink-0 flex flex-col md:flex-row justify-between items-center relative z-[60]"'
);

// 2. Tweak main layout background to a cleaner slate-50
// (Actually it is already bg-slate-50, let's leave it or make it bg-slate-50/50 for a subtler look)

// 3. Matrix table headers
code = code.replace(
    'className="sticky top-0 z-40 bg-slate-200 text-slate-800 shadow-md ring-1 ring-slate-300"',
    'className="sticky top-0 z-40 bg-slate-100 text-slate-700 shadow-sm ring-1 ring-slate-200/60 backdrop-blur-sm"'
);
code = code.replace(
    'className="sticky left-0 z-50 border-r border-b border-slate-300 p-3 w-32 md:w-40 text-left font-black bg-slate-200 uppercase tracking-wider text-xs md:text-sm"',
    'className="sticky left-0 z-50 border-r border-b border-slate-200 p-3 w-32 md:w-40 text-left font-black bg-slate-100 uppercase tracking-wider text-xs md:text-sm"'
);
// replace multiple occurrences
code = code.replace(/border-slate-300 p-2 font-black text-center bg-slate-200/g, 'border-slate-200 p-2 font-black text-center bg-slate-100/90 backdrop-blur-md text-slate-700');
code = code.replace(/border-slate-300 p-1 text-\[10px\] md:text-xs font-bold text-center bg-slate-100 text-slate-600/g, 'border-slate-200 p-1 text-[10px] md:text-xs font-bold text-center bg-slate-50 text-slate-500');

// 4. Improve card styles for rows
code = code.replace(/hover:bg-slate-50 group transition-colors/g, 'hover:bg-indigo-50/30 group transition-colors duration-200');

// 5. Enhance sidebar container
code = code.replace(
    'className="w-full md:w-80 lg:w-96 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col shrink-0 relative z-[55] overflow-visible shadow-[4px_0_24px_rgba(0,0,0,0.02)]"',
    'className="w-full md:w-80 lg:w-96 bg-white/80 backdrop-blur-xl border-b md:border-b-0 md:border-r border-slate-200 flex flex-col shrink-0 relative z-[55] overflow-visible shadow-[4px_0_24px_rgba(0,0,0,0.02)]"'
);

fs.writeFileSync('src/App.tsx', code);
console.log('patched UI 1');
