const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove states
code = code.replace(/const \[distributionRules, setDistributionRules\] = useState\(\{[\s\S]*?\}\);\n/, '');
code = code.replace(/const \[rulesModalOpen, setRulesModalOpen\] = useState\(false\);\n/, '');
code = code.replace(/const \[rulesMenuOpen, setRulesMenuOpen\] = useState\(false\);\n/, '');

// 2. Remove from worker postMessage
code = code.replace(/distributionRules,\n\s*lockedCells/g, 'lockedCells');

// 3. Replace getConflictReport
const getConflictReportRegex = /const getConflictReport = \(\) => \{[\s\S]*?return reportList;\n  \};/;
const getConflictReportReplacement = `const getConflictReport = () => {
     const reportList = [];
     const activeDays = schoolSettings.weekDays.filter(d => d.active);

     unplacedCourses.forEach(card => {
         let availableSlots = 0, maxConsecutiveSlot = 0;
         let possiblePlacements = 0;
         
         for(let dayIdx = 0; dayIdx < activeDays.length; dayIdx++) {
             const day = activeDays[dayIdx];
             const absDIdx = day.id - 1;
             
             let hasSubj = false;
             card.classes.forEach(c => {
                 for(let p=0; p<15; p++) {
                     const cellVal = classSchedules[c]?.[absDIdx]?.[p];
                     if(cellVal) {
                         const parsed = parseCellData(cellVal);
                         if (parsed && parsed.subject === card.subject && parsed.id !== card.id) hasSubj = true;
                     }
                 }
             });
             if (hasSubj) continue;
             
             let currentConsecutive = 0;
             for(let pIdx=0; pIdx<day.periods; pIdx++) {
                 let isClosed = false; let isBusy = false;

                 card.teachers.forEach(t => {
                    if(constraints.teachers[t]?.includes(\`\${absDIdx}-\${pIdx}\`)) isClosed = true;
                    if(schedules[t]?.[absDIdx]?.[pIdx]) isBusy = true;
                 });
                 card.classes.forEach(c => {
                    if(constraints.classes[c]?.includes(\`\${absDIdx}-\${pIdx}\`)) isClosed = true;
                    if(classSchedules[c]?.[absDIdx]?.[pIdx]) isBusy = true;
                 });
                 card.rooms?.forEach(r => {
                     if(constraints.rooms?.[r]?.includes(\`\${absDIdx}-\${pIdx}\`)) isClosed = true;
                     if(roomSchedules[r]?.[absDIdx]?.[pIdx]) isBusy = true;
                 });

                 if (!isClosed && !isBusy) {
                    availableSlots++; 
                    currentConsecutive++;
                    if (currentConsecutive > maxConsecutiveSlot) maxConsecutiveSlot = currentConsecutive;
                    if (currentConsecutive >= card.hours) possiblePlacements++;
                 } else {
                    currentConsecutive = 0;
                 }
             }
         }
         
         if (possiblePlacements === 0) {
             reportList.push({ card, availableSlots, maxConsecutiveSlot, reason: 'Yerleşebileceği uygun gün/saat (blok) bulunamadı.' });
         }
     });

     const subjectCountsByClass = {};
     unplacedCourses.forEach(card => {
         card.classes.forEach(c => {
             if (!subjectCountsByClass[c]) subjectCountsByClass[c] = {};
             if (!subjectCountsByClass[c][card.subject]) subjectCountsByClass[c][card.subject] = [];
             subjectCountsByClass[c][card.subject].push(card);
         });
     });

     Object.keys(subjectCountsByClass).forEach(c => {
         Object.keys(subjectCountsByClass[c]).forEach(subject => {
             const cards = subjectCountsByClass[c][subject];
             
             let availableDays = 0;
             activeDays.forEach(day => {
                 const absDIdx = day.id - 1;
                 let hasSubj = false;
                 for(let p=0; p<15; p++) {
                     const cellVal = classSchedules[c]?.[absDIdx]?.[p];
                     if(cellVal) {
                         const parsed = parseCellData(cellVal);
                         if (parsed && parsed.subject === subject) hasSubj = true;
                     }
                 }
                 let closedPeriods = 0;
                 for(let p=0; p<day.periods; p++) {
                     if(constraints.classes[c]?.includes(\`\${absDIdx}-\${p}\`)) closedPeriods++;
                 }
                 if (closedPeriods === day.periods) hasSubj = true;

                 if (!hasSubj) availableDays++;
             });

             if (cards.length > availableDays) {
                 cards.forEach(card => {
                     if (!reportList.find(r => r.card.id === card.id)) {
                         reportList.push({
                             card, 
                             availableSlots: 0, 
                             maxConsecutiveSlot: 0, 
                             reason: \`"\${subject}" dersi için "\${c}" sınıfının \${cards.length} farklı kartı var ancak sadece \${availableDays} uygun gün var. Her kart farklı güne kuralı gereği yerleşim imkansız.\`
                         });
                     }
                 });
             }
         });
     });

     return reportList;
  };`;

code = code.replace(getConflictReportRegex, getConflictReportReplacement);

// 4. Remove UI "Kurallar" and its dropdown
const rulesButtonRegex = /<div className="flex gap-2 relative">\s*<button onClick=\{\(\) => setRulesMenuOpen\(\!rulesMenuOpen\)\}[\s\S]*?<\/AnimatePresence>\s*<\/div>/;

const newButtonArea = `<div className="flex gap-2">
                        <button onClick={autoDistributePro} disabled={distributeState.isRunning || unplacedCourses.length === 0} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 rounded-lg font-black shadow-md flex items-center justify-center gap-2 group transition-all disabled:opacity-50">
                            <Wand2 className="w-5 h-5 group-hover:scale-110 transition-transform" /> Kuantum Dağıt
                        </button>
                     </div>`;

code = code.replace(rulesButtonRegex, newButtonArea);

fs.writeFileSync('src/App.tsx', code);
console.log("Cleaned App.tsx");
