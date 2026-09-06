const fs = require('fs');
let code = fs.readFileSync('src/components/EditableText.tsx', 'utf8');

code = code.replace("className={`bg-white border-2 border-indigo-500 rounded px-2 py-0.5 outline-none text-slate-800 shadow-sm ${className || ''}`}", "className={`bg-white border-2 border-indigo-500 rounded px-2 py-0.5 outline-none text-slate-800 shadow-sm ${className || ''}`} onClick={e => e.stopPropagation()}");

fs.writeFileSync('src/components/EditableText.tsx', code);
