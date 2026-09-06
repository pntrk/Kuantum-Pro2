const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `           <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0">
             <button onClick={() => setConstraintModal(null)} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-sm transition-colors">Kaydet ve Kapat</button>
           </div>
        </div>
      </div>
    );`;

const replacement = `           <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0">
             <button onClick={() => setConstraintModal(null)} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-sm transition-colors">Kaydet ve Kapat</button>
           </div>
        </motion.div>
      </div>
    );`;

if(content.includes(target)) {
    fs.writeFileSync('src/App.tsx', content.replace(target, replacement));
    console.log("Success replacing renderConstraintModal end");
} else {
    console.log("Failed replacing renderConstraintModal end");
}
