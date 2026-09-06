const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `<label className={\`w-full flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer transition-colors \${deepLearningActive ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-300'}\`}>`;

const replace = `<label className={\`w-full flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer transition-colors \${deepLearningActive ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-300'}\`}>
                           <input type="checkbox" className="hidden" checked={deepLearningActive} onChange={() => setDeepLearningActive(!deepLearningActive)} />`;

code = code.replace(target, replace);
fs.writeFileSync('src/App.tsx', code);
console.log('patched checkbox');
