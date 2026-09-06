const fs = require('fs');
let code = fs.readFileSync('src/workers/quantum.ts', 'utf8');

const CONFLICTS_REPLACEMENT = `
        const rules = schoolSettings.distributionRules || { preventSameDay: true };
        
        for(let i=0; i<c.mappedClasses.length; i++) {
            const cl = c.mappedClasses[i];
            
            let sameDayCards = [];
            for(let hr=0; hr<15; hr++) {
                const id = grid_C[cl*7 + d][hr];
                if (id !== -1 && id !== c.mappedId && !sameDayCards.includes(id)) {
                    const existingCard = movableMap.get(id);
                    if (existingCard && existingCard.mappedSubject === c.mappedSubject) {
                        sameDayCards.push(id);
                    }
                }
            }
            
            if (sameDayCards.length > 0) {
                if (rules.preventSameDay) {
                    sameDayCards.forEach(id => { if(!conflicts.includes(id)) conflicts.push(id); });
                } else {
                    let totalHours = c.hours;
                    sameDayCards.forEach(id => totalHours += movableMap.get(id).hours);
                    if (rules.maxHoursActive && totalHours > rules.maxHours) {
                        sameDayCards.forEach(id => { if(!conflicts.includes(id)) conflicts.push(id); });
                    }
                    
                    sameDayCards.forEach(id => {
                        const existingCard = movableMap.get(id);
                        const gap1 = p - (existingCard.p + existingCard.hours);
                        const gap2 = existingCard.p - (p + c.hours);
                        const actualGap = Math.max(gap1, gap2);
                        
                        let isValidGap = true;
                        if (rules.minGapActive && actualGap < rules.minGap) isValidGap = false;
                        if (rules.maxGapActive && actualGap > rules.maxGap) isValidGap = false;
                        
                        if (!isValidGap && !conflicts.includes(id)) conflicts.push(id);
                    });
                }
            }
        }
`;

// Replace the existing // --- NEW: Add existing same-subject cards as conflicts --- loop
const startMarker = "// --- NEW: Add existing same-subject cards as conflicts ---";
const endMarker = "for(let i=0; i<c.mappedTeachers.length; i++) {";

if (code.includes(startMarker)) {
    const startIndex = code.indexOf(startMarker);
    const endIndex = code.indexOf(endMarker, startIndex);
    
    if (startIndex !== -1 && endIndex !== -1) {
        code = code.slice(0, startIndex) + startMarker + "\n" + CONFLICTS_REPLACEMENT + "\n        " + code.slice(endIndex);
        
        fs.writeFileSync('src/workers/quantum.ts', code);
        console.log("Patched getConflicts");
    } else {
        console.log("Could not find markers");
    }
} else {
    console.log("Already patched or marker missing");
}
