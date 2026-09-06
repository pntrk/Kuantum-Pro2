const fs = require('fs');
let code = fs.readFileSync('src/workers/quantum.ts', 'utf8');

const regexCheckRules = /const checkRules = \(c, d, p\) => \{[\s\S]*?return true;\n    \};/;
const replacementCheckRules = `const checkRules = (c, d, p) => {
        if (!distributionRules) return true;
        
        for(let i=0; i<c.mappedClasses.length; i++) {
            const cl = c.mappedClasses[i];
            
            let existingPeriods = [];
            for(let hr=0; hr<15; hr++) {
                const id = grid_C[cl*7 + d][hr];
                if (id !== -1) {
                    const existingCard = movableMap.get(id);
                    if (existingCard && existingCard.mappedSubject === c.mappedSubject && id !== c.mappedId) {
                        existingPeriods.push(hr);
                    }
                }
            }
            
            if (existingPeriods.length > 0 && distributionRules.freeDistribution) {
                if (distributionRules.contiguousSameDay) {
                    let touches = false;
                    for(let hr=0; hr<c.hours; hr++) {
                        const currentP = p + hr;
                        if (existingPeriods.includes(currentP - 1) || existingPeriods.includes(currentP + 1)) {
                            touches = true; break;
                        }
                    }
                    if (!touches) return false;
                }
                
                if (!distributionRules.contiguousSameDay && distributionRules.gapBetweenSameDay > 0) {
                    const minGap = distributionRules.gapBetweenSameDay;
                    for(let hr=0; hr<c.hours; hr++) {
                        const currentP = p + hr;
                        for(let exP of existingPeriods) {
                            if (Math.abs(currentP - exP) <= minGap) return false;
                        }
                    }
                }
                
                if (distributionRules.maxHoursPerDayEnabled) {
                    if (existingPeriods.length + c.hours > distributionRules.maxHoursPerDay) return false;
                }
            }
        }
        return true;
    };`;

if (code.match(regexCheckRules)) {
    code = code.replace(regexCheckRules, replacementCheckRules);
    fs.writeFileSync('src/workers/quantum.ts', code);
    console.log("checkRules replaced again.");
} else {
    console.log("Could not find checkRules regex");
}
