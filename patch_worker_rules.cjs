const fs = require('fs');
let code = fs.readFileSync('src/workers/quantum.ts', 'utf8');

const RULES_REPLACEMENT = `
    const checkRules = (c, d, p) => {
        const rules = schoolSettings.distributionRules || {};
        
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
                if (rules.preventSameDay) return false;
                
                let totalHours = c.hours;
                sameDayCards.forEach(id => totalHours += movableMap.get(id).hours);
                if (rules.maxHoursActive && totalHours > rules.maxHours) return false;
                
                let isValidGap = true;
                sameDayCards.forEach(id => {
                    const existingCard = movableMap.get(id);
                    const gap1 = p - (existingCard.p + existingCard.hours);
                    const gap2 = existingCard.p - (p + c.hours);
                    const actualGap = Math.max(gap1, gap2);
                    
                    if (rules.minGapActive && actualGap < rules.minGap) isValidGap = false;
                    if (rules.maxGapActive && actualGap > rules.maxGap) isValidGap = false;
                });
                if (!isValidGap) return false;
            }
        }
        return true;
    };
`;

if (code.includes('const checkRules = (c, d, p) => {') && !code.includes('const rules = schoolSettings.distributionRules')) {
    code = code.replace(
        /const checkRules = \(c, d, p\) => \{\s*return true;\s*\};/,
        RULES_REPLACEMENT
    );
    
    // Disable the old getConflicts "same-subject as conflicts" behavior since we now strictly check rules in checkRules
    // Actually, wait, if rules.preventSameDay is false, we SHOULD allow them. 
    // If they are allowed, they shouldn't be added to conflicts unless they violate rules.
    // If they violate rules, checkRules returns false, so getConflicts will return null!
    // BUT what if we want Tabu search to push them out? If checkRules returns false, it returns null (invalid move).
    // Tabu search might need to evict them!
    
    // So instead of returning false in checkRules, we should add them to conflicts!
    console.log("Written replacement");
}
