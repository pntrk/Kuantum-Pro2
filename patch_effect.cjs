const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regexEffect = /  \/\/ Auto-eject conflicting lessons when constraints change\s*useEffect\(\(\) => \{[\s\S]*?\}, 100\);\s*\}\s*\}, \[constraints, schoolSettings.weekDays\]\);/;

const replacementEffect = `  // Auto-eject conflicting lessons when constraints change
  useEffect(() => {
    let ejectedCount = 0;
    const ejectedBlockIds = new Set();
    const blocksToEject = [];

    // 1. Scan the schedules and detect any conflicts
    Object.entries(schedules).forEach(([teacher, teacherSched]) => {
      if (!Array.isArray(teacherSched)) return;
      teacherSched.forEach((daySched, dIdx) => {
        if (!Array.isArray(daySched)) return;
        daySched.forEach((cellVal, pIdx) => {
          if (cellVal && cellVal !== '') {
            const cData = parseCellData(cellVal);
            if (cData && !ejectedBlockIds.has(cData.id)) {
              let pStart = pIdx;
              while(pStart > 0 && teacherSched[dIdx][pStart - 1] === cellVal) pStart--;
              
              let blockSize = 1;
              const maxPeriods = schoolSettings.weekDays?.[dIdx]?.periods || 15;
              while(pStart + blockSize < maxPeriods && teacherSched[dIdx][pStart + blockSize] === cellVal) blockSize++;

              let hasConflict = false;
              for (let i = 0; i < blockSize; i++) {
                const currentP = pStart + i;
                const constraintKey = \`\${dIdx}-\${currentP}\`;
                
                const teacherViolation = cData.teachers.some(t => constraints.teachers?.[t]?.includes(constraintKey));
                const classViolation = cData.classes.some(c => constraints.classes?.[c]?.includes(constraintKey));
                const roomViolation = cData.rooms?.some(r => constraints.rooms?.[r]?.includes(constraintKey));
                const subjectViolation = constraints.subjects?.[cData.subject]?.includes(constraintKey);
                
                if (teacherViolation || classViolation || roomViolation || subjectViolation) {
                  hasConflict = true;
                  break;
                }
              }

              if (hasConflict) {
                ejectedBlockIds.add(cData.id);
                blocksToEject.push({
                  cData,
                  dIdx,
                  pStart,
                  blockSize
                });
              }
            }
          }
        });
      });
    });

    if (blocksToEject.length > 0) {
      // 2. Perform atomic batch updates of all schedules and the unplaced pool
      ejectMultipleCellsFromSchedules(blocksToEject);

      setTimeout(() => {
        showToast(\`Kısıtlama değiştiği için çakışan \${blocksToEject.length} ders kartı otomatik havuza alındı!\`, "info");
      }, 100);
    }
  }, [constraints, schoolSettings.weekDays]);`;

if(regexEffect.test(content)) {
    content = content.replace(regexEffect, replacementEffect);
    fs.writeFileSync('src/App.tsx', content);
    console.log("Success replacing useEffect");
} else {
    console.log("Failed replacing useEffect regex");
}
