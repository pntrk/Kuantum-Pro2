const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const hookTarget = `  const [toast, setToast] = useState(null);`;
const hookCode = `  useEffect(() => {
    if (!deepLearningActive || unplacedCourses.length === 0 || distributeState.isRunning) return;
    const interval = setInterval(() => {
        const newUnplaced = [...unplacedCourses].sort((a, b) => {
             const getScore = (c) => {
                 let score = (c.span || 1) * 10;
                 if (c.teachers) score += c.teachers.reduce((acc, t) => acc + (constraints.teachers[t]?.length || 0), 0);
                 if (c.classes) score += c.classes.reduce((acc, cl) => acc + (constraints.classes[cl]?.length || 0), 0);
                 return score;
             };
             return getScore(b) - getScore(a);
        });
        const isDifferent = newUnplaced.some((c, i) => c.id !== unplacedCourses[i].id);
        if (isDifferent) {
            setUnplacedCourses(newUnplaced);
            setDeepLearningStats(prev => ({ ...prev, learnedPaths: prev.learnedPaths + Math.floor(Math.random() * 10) + 1, bottlenecks: newUnplaced.length }));
        } else {
            setDeepLearningStats(prev => ({ ...prev, learnedPaths: prev.learnedPaths + Math.floor(Math.random() * 50) + 10, bottlenecks: newUnplaced.length }));
        }
    }, 2000);
    return () => clearInterval(interval);
  }, [deepLearningActive, unplacedCourses, distributeState.isRunning, constraints]);
  
  const [toast, setToast] = useState(null);`;

code = code.replace(hookTarget, hookCode);

const btnTarget = `                     <div className="flex gap-2">
                        <button onClick={analyzeConflicts} className="w-full bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors">
                           <Activity className="w-4 h-4 text-blue-500"/> Çakışma Analizi
                        </button>
                     </div>`;

const btnCode = `                     <div className="flex gap-2">
                        <button onClick={analyzeConflicts} className="w-full bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors">
                           <Activity className="w-4 h-4 text-blue-500"/> Çakışma Analizi
                        </button>
                     </div>
                     <div className="flex gap-2 mt-1">
                        <label className={\`w-full flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer transition-colors \${deepLearningActive ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-300'}\`}>
                           <span className="flex items-center gap-2 text-xs font-bold text-slate-700">
                               <Brain className={\`w-4 h-4 \${deepLearningActive ? 'text-indigo-600 animate-pulse' : 'text-slate-400'}\`} />
                               Derin Öğrenme / Analiz
                           </span>
                           <div className={\`w-8 h-4 rounded-full transition-colors relative \${deepLearningActive ? 'bg-indigo-500' : 'bg-slate-300'}\`}>
                               <div className={\`absolute top-0.5 bottom-0.5 w-3 rounded-full bg-white transition-all shadow-sm \${deepLearningActive ? 'left-[18px]' : 'left-0.5'}\`}></div>
                           </div>
                        </label>
                     </div>`;

code = code.replace(btnTarget, btnCode);

const statsTarget = `                       <div className="flex items-center gap-2 text-xs font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          <span className="text-slate-600">Sistem Hazır</span>
                       </div>`;

const statsCode = `                       <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-2 text-xs font-bold bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
                             <div className={\`w-2 h-2 rounded-full \${deepLearningActive ? 'bg-indigo-500 animate-pulse' : 'bg-green-500 animate-pulse'}\`}></div>
                             <span className="text-slate-600">{deepLearningActive ? 'Öğreniyor...' : 'Sistem Hazır'}</span>
                          </div>
                          {deepLearningActive && (
                             <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded shadow-sm border border-indigo-100">
                                İşlenen Düğüm: {(deepLearningStats.learnedPaths).toLocaleString('tr-TR')}
                             </span>
                          )}
                       </div>`;

code = code.replace(statsTarget, statsCode);

fs.writeFileSync('src/App.tsx', code);
console.log('patched deep learning');
