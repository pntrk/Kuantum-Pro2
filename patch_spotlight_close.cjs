const fs = require('fs');
let code = fs.readFileSync('src/components/SpotlightPaletteModal.tsx', 'utf8');

const target = `          {query && (
            <button 
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>`;

const rep = `          {query && (
            <button 
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <button 
             onClick={onClose} 
             className="md:hidden p-1.5 ml-1 text-slate-500 hover:text-slate-800 bg-slate-200/50 rounded-lg"
          >
             <X className="w-5 h-5" />
          </button>
        </div>`;

code = code.replace(target, rep);

// Also add pb-24 to the scroll area
const scrollTarget = `        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 max-h-[60vh]">`;
const scrollRep = `        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 max-h-[60vh] pb-32 md:pb-2">`;
code = code.replace(scrollTarget, scrollRep);

fs.writeFileSync('src/components/SpotlightPaletteModal.tsx', code);
console.log("Spotlight close added");
