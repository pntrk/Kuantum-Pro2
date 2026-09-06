const fs = require('fs');
let code = fs.readFileSync('src/components/DutyManager.tsx', 'utf8');

// 1. Grid layouts
code = code.replace(
  `className="grid grid-cols-1 lg:grid-cols-12 gap-6"`,
  `className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6"`
);

code = code.replace(
  `className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-4"`,
  `className="md:col-span-1 lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-4 min-w-0 overflow-hidden"`
);

code = code.replace(
  `className="lg:col-span-5 flex flex-col gap-6"`,
  `className="md:col-span-1 lg:col-span-5 flex flex-col gap-6 min-w-0 overflow-hidden"`
);

code = code.replace(
  `className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"`,
  `className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start"`
);

code = code.replace(
  `className="lg:col-span-2 flex flex-col gap-4"`,
  `className="md:col-span-1 lg:col-span-2 flex flex-col gap-4 min-w-0 overflow-hidden"`
);

code = code.replace(
  `className="lg:col-span-1 flex flex-col gap-4"`,
  `className="md:col-span-1 lg:col-span-1 flex flex-col gap-4 min-w-0 overflow-hidden"`
);

// 2. Wrap tables in overflow-x-auto w-full if needed, or adjust existing wrappers
code = code.replace(
  `className="border border-slate-200 rounded-xl overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar bg-white"`,
  `className="border border-slate-200 rounded-xl overflow-x-auto w-full max-h-[600px] overflow-y-auto custom-scrollbar bg-white"`
);

code = code.replace(
  `className="border border-slate-200 rounded-xl overflow-x-auto bg-white shadow-xs"`,
  `className="border border-slate-200 rounded-xl overflow-x-auto w-full bg-white shadow-xs"`
);

// 3. Touch targets for selects
code = code.replace(
  `className={\`text-xs font-bold p-1.5 rounded-lg bg-white border \${selectBorderClass} focus:outline-none focus:ring-1 focus:ring-opacity-50 text-slate-700 cursor-pointer\`}`,
  `className={\`text-xs font-bold p-1.5 rounded-lg bg-white border \${selectBorderClass} focus:outline-none focus:ring-1 focus:ring-opacity-50 text-slate-700 cursor-pointer min-h-[44px] md:min-h-0\`}`
);

code = code.replace(
  `className="w-full text-[11px] font-bold p-1.5 rounded-md border border-slate-200 focus:border-indigo-500 bg-slate-50 text-indigo-700 outline-none cursor-pointer"`,
  `className="w-full text-[11px] font-bold p-1.5 rounded-md border border-slate-200 focus:border-indigo-500 bg-slate-50 text-indigo-700 outline-none cursor-pointer min-h-[44px] md:min-h-0"`
);

// Touch targets for buttons in covers
code = code.replace(
  `className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-indigo-200 flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"`,
  `className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-indigo-200 flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 min-h-[44px] min-w-[44px]"`
);

code = code.replace(
  `className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-100 transition-all hover:scale-[1.01] active:scale-[0.99]"`,
  `className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-100 transition-all hover:scale-[1.01] active:scale-[0.99] min-h-[44px] min-w-[44px]"`
);

fs.writeFileSync('src/components/DutyManager.tsx', code);
console.log("Success patch layout");
