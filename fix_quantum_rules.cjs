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
            
            if (existingPeriods.length > 0) {
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

const regexGetConflicts = /const getConflicts = \(c, d, p\) => \{[\s\S]*?return conflicts;\n    \};/;
const replacementGetConflicts = `const getConflicts = (c, d, p) => {
        if (!checkRules(c, d, p)) return null;

        const mask = ((1 << c.hours) - 1) << p;
        
        const subMasks = subjectConstraintsMask.get(c.mappedSubject);
        if (subMasks && (subMasks[d] & mask) !== 0) return null;
        
        const conflicts = [];
        
        // --- NEW: Add existing same-subject cards as conflicts if freeDistribution is false ---
        if (distributionRules && !distributionRules.freeDistribution) {
            for(let i=0; i<c.mappedClasses.length; i++) {
                const cl = c.mappedClasses[i];
                for(let hr=0; hr<15; hr++) {
                    const id = grid_C[cl*7 + d][hr];
                    if (id !== -1) {
                        const existingCard = movableMap.get(id);
                        if (existingCard && existingCard.mappedSubject === c.mappedSubject && id !== c.mappedId) {
                            if (!conflicts.includes(id)) conflicts.push(id);
                        }
                    }
                }
            }
        }
        
        for(let i=0; i<c.mappedTeachers.length; i++) {
            const t = c.mappedTeachers[i];
            if ((constraint_T[t*7 + d] & mask) !== 0) return null;
            if ((state_T[t*7 + d] & mask) !== 0) {
                for(let hr=0; hr<c.hours; hr++) {
                    const id = grid_T[t*7 + d][p+hr];
                    if (id !== -1 && !conflicts.includes(id)) conflicts.push(id);
                }
            }
        }
        for(let i=0; i<c.mappedClasses.length; i++) {
            const cl = c.mappedClasses[i];
            if ((constraint_C[cl*7 + d] & mask) !== 0) return null;
            if ((state_C[cl*7 + d] & mask) !== 0) {
                for(let hr=0; hr<c.hours; hr++) {
                    const id = grid_C[cl*7 + d][p+hr];
                    if (id !== -1 && !conflicts.includes(id)) conflicts.push(id);
                }
            }
        }
        for(let i=0; i<c.mappedRooms.length; i++) {
            const r = c.mappedRooms[i];
            if ((constraint_R[r*7 + d] & mask) !== 0) return null;
            if ((state_R[r*7 + d] & mask) !== 0) {
                for(let hr=0; hr<c.hours; hr++) {
                    const id = grid_R[r*7 + d][p+hr];
                    if (id !== -1 && !conflicts.includes(id)) conflicts.push(id);
                }
            }
        }
        
        return conflicts;
    };`;

let success = true;
if (code.match(regexCheckRules)) {
    code = code.replace(regexCheckRules, replacementCheckRules);
    console.log("checkRules replaced.");
} else {
    console.log("Could not find checkRules regex");
    success = false;
}

if (code.match(regexGetConflicts)) {
    code = code.replace(regexGetConflicts, replacementGetConflicts);
    console.log("getConflicts replaced.");
} else {
    console.log("Could not find getConflicts regex");
    success = false;
}

if (success) {
    fs.writeFileSync('src/workers/quantum.ts', code);
}
