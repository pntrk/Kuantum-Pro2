const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `               <div className="bg-slate-100 border-t border-slate-300 px-4 py-3 flex justify-end gap-2 items-center">
                   <button onClick={() => setConflictReport(null)} className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded flex items-center gap-2 shadow-sm font-medium">
                       <X className="w-4 h-4 text-red-500" /> İptal
                   </button>
                   {!hasConflicts && (
                       <button onClick={() => { setConflictReport(null); autoDistributePro(); }} className="px-6 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded flex items-center gap-2 shadow font-medium">
                           <Play className="w-4 h-4" /> Dağıtıma Başla
                       </button>
                   )}
               </div>
           </div>
        </div>`;

const replacement = `               <div className="bg-slate-100 border-t border-slate-300 px-4 py-3 flex justify-end gap-2 items-center shrink-0">
                   <button onClick={() => setConflictReport(null)} className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded flex items-center gap-2 shadow-sm font-medium">
                       <X className="w-4 h-4 text-red-500" /> İptal
                   </button>
                   {!hasConflicts && (
                       <button onClick={() => { setConflictReport(null); autoDistributePro(); }} className="px-6 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded flex items-center gap-2 shadow font-medium">
                           <Play className="w-4 h-4" /> Dağıtıma Başla
                       </button>
                   )}
               </div>
           </motion.div>
        </div>`;

if(content.includes(target)) {
    fs.writeFileSync('src/App.tsx', content.replace(target, replacement));
    console.log("Success replacing renderConflictModal end");
} else {
    console.log("Failed replacing renderConflictModal end");
}
