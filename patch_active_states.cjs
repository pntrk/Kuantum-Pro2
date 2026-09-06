const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Spotlight and Quick Buttons in top header
code = code.replace(
  `className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white px-3 md:px-3 py-1.5 md:py-2 rounded-lg font-bold text-xs md:text-sm flex items-center gap-2 transition-all shadow-sm group shrink-0 snap-start"`,
  `className="bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 text-slate-200 hover:text-white active:text-white px-3 md:px-3 py-1.5 md:py-2 rounded-lg font-bold text-xs md:text-sm flex items-center gap-2 transition-all shadow-sm group shrink-0 snap-start active:scale-[0.98]"`
);

code = code.replace(
  `className="bg-sky-700 hover:bg-sky-600 border border-sky-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-bold text-xs md:text-sm flex items-center gap-1.5 md:gap-2 transition-colors whitespace-nowrap shadow-sm"`,
  `className="bg-sky-700 hover:bg-sky-600 active:bg-sky-500 border border-sky-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-bold text-xs md:text-sm flex items-center gap-1.5 md:gap-2 transition-colors whitespace-nowrap shadow-sm active:scale-[0.98]"`
);

code = code.replace(
  `className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white px-3 py-1.5 md:py-2 rounded-lg font-bold text-xs md:text-sm flex items-center gap-2 transition-colors shrink-0 snap-start"`,
  `className="bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 text-slate-200 hover:text-white active:text-white px-3 py-1.5 md:py-2 rounded-lg font-bold text-xs md:text-sm flex items-center gap-2 transition-colors shrink-0 snap-start active:scale-[0.98]"`
);

code = code.replace(
  `className="w-full text-left px-4 py-2.5 font-semibold text-sm rounded-md hover:bg-slate-50 transition-colors flex items-center gap-2 mb-1"`,
  `className="w-full text-left px-4 py-2.5 font-semibold text-sm rounded-md hover:bg-slate-50 active:bg-slate-100 transition-colors flex items-center gap-2 mb-1"`
);

code = code.replace(
  `className="w-full text-left px-4 py-2.5 font-semibold text-sm rounded-md hover:bg-slate-50 transition-colors flex items-center gap-2"`,
  `className="w-full text-left px-4 py-2.5 font-semibold text-sm rounded-md hover:bg-slate-50 active:bg-slate-100 transition-colors flex items-center gap-2"`
);

fs.writeFileSync('src/App.tsx', code);
console.log("Success patch active states");
