const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `<button onClick={autoDistributePro} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 rounded-lg font-black shadow-md flex items-center justify-center gap-2 group transition-all">
                        <Wand2 className="w-5 h-5 group-hover:scale-110 transition-transform" /> Kuantum Dağıt
                     </button>`;

const replacement = `<div className="flex gap-2">
                        <button onClick={() => setRulesModalOpen(true)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg font-bold shadow-sm flex items-center justify-center gap-2 transition-all border border-slate-300 text-sm">
                            <Settings className="w-4 h-4"/> Kurallar
                        </button>
                        <button onClick={autoDistributePro} disabled={distributeState.isRunning || unplacedCourses.length === 0} className="flex-[2] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 rounded-lg font-black shadow-md flex items-center justify-center gap-2 group transition-all disabled:opacity-50">
                            <Wand2 className="w-5 h-5 group-hover:scale-110 transition-transform" /> Kuantum Dağıt
                        </button>
                     </div>`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Fixed buttons");
} else {
    console.log("Could not find button target");
}
