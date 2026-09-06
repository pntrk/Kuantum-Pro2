const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// We need to inject getConflictReport and update analyzeConflicts and autoDistributePro.
// We will also add distributionRules state and the Kurallar button.

code = code.replace("const [schoolInfo, setSchoolInfo] = useState({ name: 'Belirtilmedi', year: '2025-2026', principal: '', vicePrincipal: '' });",
`const [schoolInfo, setSchoolInfo] = useState({ name: 'Belirtilmedi', year: '2025-2026', principal: '', vicePrincipal: '' });
  const [distributionRules, setDistributionRules] = useState({
     freeDistribution: false,
     contiguousSameDay: false,
     gapBetweenSameDay: 1,
     maxHoursPerDayEnabled: false,
     maxHoursPerDay: 2,
     minHoursPerDayEnabled: false,
     minHoursPerDay: 2,
  });
  const [rulesModalOpen, setRulesModalOpen] = useState(false);`);

const analyzeConflictsTarget = `  const analyzeConflicts = () => {
     if (unplacedCourses.length === 0) return showToast("Havuza ait analiz edilecek bekleyen kart yok.", "warning");
     
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

     if (reportList.length > 0) {
         setConflictReport(reportList);
         showToast("Analiz tamamlandı. Çözülemeyen " + reportList.length + " kart tespit edildi.", "warning");
     } else {
         showToast("Havuzdaki tüm derslerin yerleşimi için yeterli alan var.", "success");
     }
  };`;

const analyzeConflictsReplacement = `  const getConflictReport = () => {
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
         showToast("Havuzdaki tüm derslerin yerleşimi için yeterli alan var.", "success");
     }
  };`;

code = code.replace(analyzeConflictsTarget, analyzeConflictsReplacement);

fs.writeFileSync('src/App.tsx', code);
console.log("Updated analyzeConflicts logic.");
