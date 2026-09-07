import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /<div className="md:hidden flex-1 h-full w-full overflow-hidden flex flex-col"> h-full w-full overflow-hidden \$\{mobileMatrixTab === 'timeline' \? 'flex flex-col' : 'hidden'\}`\}>/,
  `<div className="md:hidden flex-1 h-full w-full overflow-hidden flex flex-col">`
);

content = content.replace(
  /<div className="w-full md:w-80 shrink-0 bg-white rounded-xl shadow-sm border border-slate-200 flex-col h-full \$\{mobileMatrixTab === 'pool' \? 'flex' : 'hidden md:flex'\}`\}>/,
  `<div className="w-full md:w-80 shrink-0 bg-white rounded-xl shadow-sm border border-slate-200 flex-col h-full hidden md:flex">`
);

fs.writeFileSync('src/App.tsx', content);
