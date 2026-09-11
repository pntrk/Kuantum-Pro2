const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /<div className="h-screen flex flex-col bg-slate-50 text-slate-800 font-sans overflow-hidden">/g,
  '<div className="h-[100dvh] flex flex-col bg-slate-50 text-slate-800 font-sans overflow-hidden">'
);

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed h-screen to h-[100dvh].");
