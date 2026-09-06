const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regexToReplace = /<h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-2">Ders Saatleri \(Zil\)<\/h2>\s*\}\)\}\s*<\/div>\s*<\/div>/;

const replacement = `<h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-2">Ders Saatleri (Zil)</h2>
                  <div className="space-y-2">
                     {schoolSettings.lessonTimes.map((lt, idx) => (
                       <div key={idx} className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200 shadow-sm">
                         <span className="font-bold text-slate-500 w-16">{idx+1}. Ders</span>
                         <div className="flex items-center gap-2">
                             <input type="time" className="border border-slate-300 rounded px-2 py-1 text-sm font-bold text-slate-700 focus:border-blue-500" value={lt.start} onChange={(e) => { const newTimes = [...schoolSettings.lessonTimes]; newTimes[idx].start = e.target.value; setSchoolSettings({...schoolSettings, lessonTimes: newTimes}); }}/>
                             <span className="text-slate-400">-</span>
                             <input type="time" className="border border-slate-300 rounded px-2 py-1 text-sm font-bold text-slate-700 focus:border-blue-500" value={lt.end} onChange={(e) => { const newTimes = [...schoolSettings.lessonTimes]; newTimes[idx].end = e.target.value; setSchoolSettings({...schoolSettings, lessonTimes: newTimes}); }}/>
                         </div>
                       </div>
                     ))}
                  </div>
                </div>`;

code = code.replace(regexToReplace, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log("Restored Zil settings 2");
