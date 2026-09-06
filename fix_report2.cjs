const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const analyzeConflicts = \(\) => \{[\s\S]*?setConflictReport\(reportList\);\n  \};/;
const replacement = `  const getConflictReport = () => {
     const reportList = [];
     const activeDays = schoolSettings.weekDays.filter(d => d.active);

     unplacedCourses.forEach(card => {
         let availableSlots = 0, maxConsecutiveSlot = 0;
         let possiblePlacements = 0;
         
         // Real conflict analysis logic matching quantum worker rules
         for(let dayIdx = 0; dayIdx < activeDays.length; dayIdx++) {
             const day = activeDays[dayIdx];
             const absDIdx = day.id - 1;
             
             // Check if rules prevent placing on this day
             if (!distributionRules.freeDistribution) {
                 // Check if any class already has this subject today
                 let hasSubj = false;
                 card.classes.forEach(c => {
                     for(let p=0; p<15; p++) {
                         if(classSchedules[c]?.[absDIdx]?.[p] === card.subject) hasSubj = true;
                     }
                 });
                 if (hasSubj) continue; // Skip day
             }
             
             // Check continuous slots
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
             reportList.push({ card, availableSlots, maxConsecutiveSlot });
         }
     });
     return reportList;
  };

  const analyzeConflicts = () => {
     if (unplacedCourses.length === 0) return showToast("Havuza ait analiz edilecek bekleyen kart yok.", "warning");
     const reportList = getConflictReport();
     if (reportList.length > 0) {
         setConflictReport(reportList);
         showToast("Analiz tamamlandı. Çözülemeyen " + reportList.length + " kart tespit edildi.", "warning");
     } else {
         setConflictReport([]);
         showToast("Havuzdaki tüm derslerin yerleşimi için yeterli alan var.", "success");
     }
  };`;

if(code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Updated analyzeConflicts logic.");
} else {
    console.log("Failed to match analyzeConflicts");
}
