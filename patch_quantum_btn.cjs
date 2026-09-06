const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
    '<Wand2 className="w-5 h-5 group-hover:scale-110 transition-transform" /> Kuantum Dağıt',
    '<div className="absolute inset-0 bg-white/20 w-full h-full -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div><Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" /> AI Kuantum Motoru'
);

code = code.replace(
    'className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 rounded-lg font-black shadow-md flex items-center justify-center gap-2 group transition-all disabled:opacity-50"',
    'className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 text-white py-2 rounded-lg font-black shadow-md flex items-center justify-center gap-2 group transition-all disabled:opacity-50 relative overflow-hidden"'
);

fs.writeFileSync('src/App.tsx', code);
console.log('patched btn');
