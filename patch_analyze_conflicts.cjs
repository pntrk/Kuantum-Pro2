const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `
             let hasSubj = false;
             let totalHours = card.hours;
             let sameDayCards = [];
             card.classes.forEach(c => {
                 for(let p=0; p<15; p++) {
                     const cellVal = classSchedules[c]?.[absDIdx]?.[p];
                     if(cellVal) {
                         const parsed = parseCellData(cellVal);
                         if (parsed && parsed.subject === card.subject && parsed.id !== card.id) {
                             hasSubj = true;
                             if (!sameDayCards.includes(parsed.id)) {
                                 sameDayCards.push(parsed.id);
                                 totalHours += parsed.hours;
                             }
                         }
                     }
                 }
             });
             
             const rules = schoolSettings.distributionRules || { preventSameDay: true };
             if (hasSubj) {
                 if (rules.preventSameDay) continue;
                 if (rules.maxHoursActive && totalHours > rules.maxHours) continue;
             }
`;

code = code.replace(
    /let hasSubj = false;[\s\S]*?if \(hasSubj\) continue;/m,
    replacement
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched analyze conflicts");
