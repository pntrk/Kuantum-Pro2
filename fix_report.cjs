const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  const analyzeConflicts = () => {
     if (unplacedCourses.length === 0) return showToast("Havuza ait analiz edilecek bekleyen kart yok.", "warning");
     
     const reportList = [];`;

if (code.includes(target)) {
    console.log("Found analyzeConflicts old version");
    const replacement = `  const getConflictReport = () => {
     const reportList = [];
     const activeDays = schoolSettings.weekDays.filter(d => d.active);

     unplacedCourses.forEach(card => {
         let teacherBusy = 0, classBusy = 0, teacherClosed = 0, classClosed = 0, totalChecked = 0, availableSlots = 0, maxConsecutiveSlot = 0; 
         
         activeDays.forEach((day) => {
             const absDIdx = day.id - 1;
             let currentConsecutive = 0;
             for(let pIdx=0; pIdx<day.periods; pIdx++) {
                 totalChecked++;
                 let isTClosed = false, isCClosed = false, isTBusy = false, isCBusy = false;

                 card.teachers.forEach(t => {
                    if(constraints.teachers[t]?.includes(\`\${absDIdx}-\${pIdx}\`)) isTClosed = true;
                    if(schedules[t]?.[absDIdx]?.[pIdx] && schedules[t]?.[absDIdx]?.[pIdx] !== '') isTBusy = true;
                 });
                 card.classes.forEach(c => {
                    if(constraints.classes[c]?.includes(\`\${absDIdx}-\${pIdx}\`)) isCClosed = true;
                    if(classSchedules[c]?.[absDIdx]?.[pIdx] && classSchedules[c]?.[absDIdx]?.[pIdx] !== '') isCBusy = true;
                 });
                 card.rooms?.forEach(r => {
                     // Check rooms if needed
                     if(constraints.rooms?.[r]?.includes(\`\${absDIdx}-\${pIdx}\`)) isCClosed = true;
                     if(roomSchedules[r]?.[absDIdx]?.[pIdx] && roomSchedules[r]?.[absDIdx]?.[pIdx] !== '') isCBusy = true;
                 });

                 if (isTClosed) teacherClosed++; if (isCClosed) classClosed++;
                 if (isTBusy) teacherBusy++; if (isCBusy) classBusy++;

                 if (!isTClosed && !isCClosed && !isTBusy && !isCBusy) {
                    availableSlots++; currentConsecutive++;
                    if (currentConsecutive > maxConsecutiveSlot) maxConsecutiveSlot = currentConsecutive;
                 } else {
                    currentConsecutive = 0;
                 }
             }
         });
         
         if (availableSlots === 0 || maxConsecutiveSlot < card.hours) {
             reportList.push({ card, teacherBusy, classBusy, teacherClosed, classClosed, totalChecked, availableSlots, maxConsecutiveSlot });
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

    // Regex replace
    const analyzeRegex = /const analyzeConflicts = \(\) => \{[\s\S]*?showToast\("Havuzdaki tüm derslerin yerleşimi için yeterli alan var.", "success"\);\n     \}\n  \};/;
    code = code.replace(analyzeRegex, replacement);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Updated analyzeConflicts logic.");

} else {
    console.log("Could not find analyzeConflicts old version");
    const regex = /const analyzeConflicts = \(\) => \{[\s\S]*?\}\n     \}\n  \};/;
    const match = code.match(regex);
    if(match) {
        console.log("Found something with regex:", match[0].substring(0, 100));
    } else {
        console.log("Could not find analyzeConflicts with regex either.");
    }
}
