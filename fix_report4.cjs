const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const getConflictReport = \(\) => \{[\s\S]*?return reportList;\n  \};/;

const replacement = `  const getConflictReport = () => {
     const reportList = [];
     const activeDays = schoolSettings.weekDays.filter(d => d.active);

     // 1. Basic slot availability check per card
     unplacedCourses.forEach(card => {
         let availableSlots = 0, maxConsecutiveSlot = 0;
         let possiblePlacements = 0;
         
         for(let dayIdx = 0; dayIdx < activeDays.length; dayIdx++) {
             const day = activeDays[dayIdx];
             const absDIdx = day.id - 1;
             
             if (!distributionRules.freeDistribution) {
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
             }
             
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

     // 2. Global mathematical checks for freeDistribution=false
     if (!distributionRules.freeDistribution) {
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
                 
                 // How many active days does this class have available for this subject?
                 let availableDays = 0;
                 activeDays.forEach(day => {
                     const absDIdx = day.id - 1;
                     // Is this subject already on this day in the schedule?
                     let hasSubj = false;
                     for(let p=0; p<15; p++) {
                         const cellVal = classSchedules[c]?.[absDIdx]?.[p];
                         if(cellVal) {
                             const parsed = parseCellData(cellVal);
                             if (parsed && parsed.subject === subject) hasSubj = true;
                         }
                     }
                     // Check if day is completely blocked by constraints for this class
                     let closedPeriods = 0;
                     for(let p=0; p<day.periods; p++) {
                         if(constraints.classes[c]?.includes(\`\${absDIdx}-\${p}\`)) closedPeriods++;
                     }
                     if (closedPeriods === day.periods) hasSubj = true; // Fully closed day

                     if (!hasSubj) availableDays++;
                 });

                 if (cards.length > availableDays) {
                     cards.forEach(card => {
                         // Only add to report if not already added
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
     }

     return reportList;
  };`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Fixed report checking fully");
} else {
    console.log("Could not find getConflictReport");
}
