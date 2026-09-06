const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const analyzeConflictsReplacement = `
  const getConflictReport = () => {
     const report = {
         kartTest: { title: 'Kartların yerleşim testi', status: 'ok', errors: [] },
         tanimliDersTest: { title: 'Tanımlı derslerin yerleşim testi', status: 'ok', errors: [] },
         sinifOgretmenTest: { title: 'Sınıf ve öğretmen yerleşim testi', status: 'ok', errors: [] },
         ogretmenYeterlilikTest: { title: 'Öğretmen yeterlilik testi', status: 'ok', errors: [] },
         derslikTest: { title: 'Derslik yerleşim testi', status: 'ok', errors: [] }
     };
     
     const activeDays = schoolSettings.weekDays.filter(d => d.active);
     
     // 1. Tanımlı Ders Testi
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
             report.tanimliDersTest.status = 'error';
             report.tanimliDersTest.errors.push({
                 label: \`\${card.classes.join(', ')} || \${card.subject} || \${card.teachers.join(', ')}\`,
                 reason: 'Tanımlı dersin parçaları aynı güne geliyor veya kısıtlamalardan dolayı boş yer yok.'
             });
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
                 report.tanimliDersTest.status = 'error';
                 report.tanimliDersTest.errors.push({
                     label: \`\${c} || \${subject}\`,
                     reason: \`\${cards.length} farklı kartı var ancak sadece \${availableDays} uygun gün var.\`
                 });
             }
         });
     });

     // 2. Öğretmen Yeterlilik Testi (Teacher Capacity)
     teachers.forEach(t => {
         let totalHoursNeeded = 0;
         unplacedCourses.forEach(c => {
             if (c.teachers.includes(t)) totalHoursNeeded += c.hours;
         });
         
         let totalAvailable = 0;
         activeDays.forEach(day => {
             const absDIdx = day.id - 1;
             for(let p=0; p<day.periods; p++) {
                 const isClosed = constraints.teachers[t]?.includes(\`\${absDIdx}-\${p}\`);
                 const isBusy = schedules[t]?.[absDIdx]?.[p];
                 if (!isClosed && !isBusy) totalAvailable++;
             }
         });
         
         if (totalHoursNeeded > totalAvailable) {
             report.ogretmenYeterlilikTest.status = 'error';
             report.ogretmenYeterlilikTest.errors.push({
                 label: t,
                 reason: \`Kalan ders yükü (\${totalHoursNeeded} saat) uygun boşluktan (\${totalAvailable} saat) fazla.\`
             });
         }
     });

     // 3. Sınıf ve Öğretmen yerleşim testi (Class Capacity)
     classes.forEach(c => {
         let totalHoursNeeded = 0;
         unplacedCourses.forEach(card => {
             if (card.classes.includes(c)) totalHoursNeeded += card.hours;
         });
         
         let totalAvailable = 0;
         activeDays.forEach(day => {
             const absDIdx = day.id - 1;
             for(let p=0; p<day.periods; p++) {
                 const isClosed = constraints.classes[c]?.includes(\`\${absDIdx}-\${p}\`);
                 const isBusy = classSchedules[c]?.[absDIdx]?.[p];
                 if (!isClosed && !isBusy) totalAvailable++;
             }
         });
         
         if (totalHoursNeeded > totalAvailable) {
             report.sinifOgretmenTest.status = 'error';
             report.sinifOgretmenTest.errors.push({
                 label: c,
                 reason: \`Sınıfın alması gereken ders yükü (\${totalHoursNeeded} saat) uygun boşluktan (\${totalAvailable} saat) fazla.\`
             });
         }
     });

     // Has Conflicts?
     const hasConflicts = Object.values(report).some(r => r.status === 'error');
     return { report, hasConflicts };
  };

  const analyzeConflicts = () => {
     if (unplacedCourses.length === 0) return showToast("Havuza ait analiz edilecek bekleyen kart yok.", "warning");
     const result = getConflictReport();
     setConflictReport(result);
  };
`;

const renderModalReplacement = `
  const renderConflictModal = () => {
      if (!conflictReport) return null;
      const { report, hasConflicts } = conflictReport;
      
      const tests = [
          report.kartTest,
          report.tanimliDersTest,
          report.sinifOgretmenTest,
          report.ogretmenYeterlilikTest,
          report.derslikTest
      ];

      return (
        <div className="fixed inset-0 bg-slate-900/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded border shadow-2xl max-w-4xl w-full flex flex-col h-[80vh] overflow-hidden">
               {/* Header like native app */}
               <div className="bg-slate-700 text-white px-3 py-2 flex items-center justify-between text-sm shadow">
                 <div className="flex items-center gap-2">
                     <Settings className="w-4 h-4 text-slate-300" />
                     <span>Program dağıtım kontrolü</span>
                 </div>
                 <div className="flex items-center gap-2">
                     <button className="text-xs flex items-center gap-1 bg-slate-600 px-2 py-1 rounded hover:bg-slate-500">
                         <HelpCircle className="w-3 h-3" /> Yardım
                     </button>
                     <button onClick={() => setConflictReport(null)} className="hover:bg-red-500 hover:text-white px-2 py-0.5 rounded transition-colors"><X className="w-4 h-4" /></button>
                 </div>
               </div>
               
               {/* Content area */}
               <div className="flex-1 flex flex-col overflow-hidden bg-white text-slate-800 text-sm">
                   <div className="flex bg-slate-100 font-semibold border-b border-slate-300 p-1">
                       <div className="flex-1 px-2 border-r border-slate-300">Kontrol</div>
                       <div className="flex-1 px-2">Hata</div>
                   </div>
                   
                   <div className="flex-1 overflow-auto p-1 custom-scrollbar">
                       {tests.map((test, i) => (
                           <div key={i} className="mb-1">
                               <div className="flex">
                                   <div className="flex-1 px-2 py-1 flex items-start gap-2">
                                       <span className="mt-0.5">
                                           {test.status === 'ok' ? (
                                               <Check className="w-4 h-4 text-green-600 font-bold" />
                                           ) : (
                                               <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                           )}
                                       </span>
                                       <span className="font-semibold text-slate-800">{test.title}</span>
                                   </div>
                                   <div className="flex-1 px-2 py-1 font-semibold">
                                       {test.status === 'ok' ? 'Hata yok' : \`\${test.errors.length} \${test.title} hata var\`}
                                   </div>
                               </div>
                               
                               {test.errors.length > 0 && (
                                   <div className="ml-6 pl-2 border-l border-slate-200">
                                       {test.errors.map((err, j) => (
                                           <div key={j} className="flex hover:bg-slate-50 py-0.5">
                                               <div className="flex-1 px-2 text-slate-700 flex items-center gap-2">
                                                   <span className="w-3 h-3 bg-blue-400 block shrink-0"></span>
                                                   <span>{err.label}</span>
                                               </div>
                                               <div className="flex-1 px-2 text-slate-600">
                                                   {err.reason}
                                               </div>
                                           </div>
                                       ))}
                                   </div>
                               )}
                           </div>
                       ))}
                   </div>
                   
                   {/* Log area */}
                   <div className="h-48 border-t border-slate-300 bg-white p-2 overflow-auto font-mono text-xs text-slate-700 custom-scrollbar leading-relaxed">
                       <div className="flex items-center gap-2 text-green-600"><Check className="w-3 h-3"/> Tüm veriler hafızaya yüklendi.</div>
                       <div className="flex items-center gap-2 text-green-600"><Check className="w-3 h-3"/> Kısıtlamalar işlendi.</div>
                       <div className="flex items-center gap-2 text-slate-800 font-bold mt-2 mb-1"><ArrowRight className="w-3 h-3"/> Derslik durumları kontrol ediliyor...</div>
                       {rooms.map(r => (
                           <div key={r} className="flex gap-4 ml-2">
                               <div className="flex items-center gap-2 w-32"><Check className="w-3 h-3 text-green-600"/> {r}</div>
                               <div className="text-slate-600">Kapasite / Uygunluk taranıyor...</div>
                           </div>
                       ))}
                   </div>
               </div>

               {/* Footer */}
               <div className="bg-slate-100 border-t border-slate-300 px-4 py-3 flex justify-end gap-2 items-center">
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
        </div>
      );
  };
`;

const fileContent = code;
// Find getConflictReport definition up to handleRename
const startIdx = fileContent.indexOf('const getConflictReport = () => {');
const endIdx = fileContent.indexOf('const handleRename = (type, oldName, newName) => {');

// Find renderConflictModal up to handleModalCreatePoolCard
const renderStartIdx = fileContent.indexOf('const renderConflictModal = () => {');
const renderEndIdx = fileContent.indexOf('const handleModalCreatePoolCard = () => {');

if (startIdx !== -1 && endIdx !== -1 && renderStartIdx !== -1 && renderEndIdx !== -1) {
    let newContent = fileContent.slice(0, startIdx) + 
                     analyzeConflictsReplacement + 
                     fileContent.slice(endIdx, renderStartIdx) +
                     renderModalReplacement +
                     fileContent.slice(renderEndIdx);
    fs.writeFileSync('src/App.tsx', newContent);
    console.log("Successfully replaced getConflictReport and renderConflictModal.");
} else {
    console.error("Could not find boundaries.");
}
