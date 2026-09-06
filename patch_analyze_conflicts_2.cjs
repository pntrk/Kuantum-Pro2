const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `
             let availableDays = 0;
             const rules = schoolSettings.distributionRules || { preventSameDay: true };
             activeDays.forEach(day => {
                 const absDIdx = day.id - 1;
                 let hasSubj = false;
                 let dayHours = 0;
                 for(let p=0; p<15; p++) {
                     const cellVal = classSchedules[c]?.[absDIdx]?.[p];
                     if(cellVal) {
                         const parsed = parseCellData(cellVal);
                         if (parsed && parsed.subject === subject) {
                             hasSubj = true;
                             dayHours += 1;
                         }
                     }
                 }
                 let closedPeriods = 0;
                 for(let p=0; p<day.periods; p++) {
                     if(constraints.classes[c]?.includes(\`\${absDIdx}-\${p}\`)) closedPeriods++;
                 }
                 if (closedPeriods === day.periods) hasSubj = true;
                 
                 if (!hasSubj || (!rules.preventSameDay && (!rules.maxHoursActive || dayHours < rules.maxHours))) {
                     availableDays++;
                 }
             });
`;

code = code.replace(
    /let availableDays = 0;[\s\S]*?if \(!hasSubj\) availableDays\+\+;\s*\}\);/m,
    replacement
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched availableDays check");
