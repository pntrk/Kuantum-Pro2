const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (code.includes('{renderConflictModal()}')) {
    code = code.replace('{renderConflictModal()}', '{renderRulesModal()}\n      {renderConflictModal()}');
}

if (code.includes('<button onClick={analyzeConflicts}')) {
    code = code.replace('<button onClick={analyzeConflicts}', `<button onClick={() => setShowRulesModal(true)} className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all group">\n                         <Settings2 className="w-5 h-5 text-slate-500 group-hover:text-slate-700"/> Şartlar / Kurallar\n                      </button>\n                      <button onClick={analyzeConflicts}`);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Added button and modal render");
}
