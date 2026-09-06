const fs = require('fs');
let code = fs.readFileSync('src/workers/quantum.ts', 'utf8');

const target1 = `    const { 
        unplacedCourses, 
        schoolSettings, 
        schedules, 
        classSchedules, 
        roomSchedules, 
        lockedCells, 
        constraints
    } = e.data;`;

const replacement1 = `    const { 
        unplacedCourses, 
        schoolSettings, 
        schedules, 
        classSchedules, 
        roomSchedules, 
        lockedCells, 
        constraints,
        distributionRules
    } = e.data;`;
code = code.replace(target1, replacement1);


// We need to inject checkRules before getConflicts returns conflicts
// Let's inject it into `getConflicts`.
// We will replace the entire getConflicts function.
// Also we need to modify the fast initial placement logic.

const getConflictsTarget = `    const getConflicts = (c, d, p) => {
        const mask = ((1 << c.hours) - 1) << p;
        
        const subMasks = subjectConstraintsMask.get(c.mappedSubject);
        if (subMasks && (subMasks[d] & mask) !== 0) return null;
        
        const conflicts = [];
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

const getConflictsReplacement = `    const checkRules = (c, d, p) => {
        if (!distributionRules) return true;
        
        if (!distributionRules.freeDistribution) {
            for(let i=0; i<c.mappedClasses.length; i++) {
                if (hasSubject(c.mappedClasses[i], d, c.mappedSubject)) return false;
            }
            return true;
        }
        
        for(let i=0; i<c.mappedClasses.length; i++) {
            const cl = c.mappedClasses[i];
            if (hasSubject(cl, d, c.mappedSubject)) {
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
        }
        return true;
    };

    const getConflicts = (c, d, p) => {
        if (!checkRules(c, d, p)) return null;

        const mask = ((1 << c.hours) - 1) << p;
        
        const subMasks = subjectConstraintsMask.get(c.mappedSubject);
        if (subMasks && (subMasks[d] & mask) !== 0) return null;
        
        const conflicts = [];
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

code = code.replace(getConflictsTarget, getConflictsReplacement);

// Remove the hardcoded pass 0 rules because our checkRules handles freeDistribution and everything.
// Target:
/*
                if (pass === 0 && c.failCount < 20) {
                    let hasSubj = false;
                    for(let i=0; i<c.mappedClasses.length; i++) {
                        if (hasSubject(c.mappedClasses[i], dIdx, c.mappedSubject)) { hasSubj = true; break; }
                    }
                    if (hasSubj) continue;
                }
*/

const oldRuleTarget = `                if (pass === 0 && c.failCount < 20) {
                    let hasSubj = false;
                    for(let i=0; i<c.mappedClasses.length; i++) {
                        if (hasSubject(c.mappedClasses[i], dIdx, c.mappedSubject)) { hasSubj = true; break; }
                    }
                    if (hasSubj) continue;
                }`;
// We just remove it. checkRules will now perfectly govern "freeDistribution" vs normal distribution
// Wait, if !freeDistribution, checkRules returns false if subject exists.
// Meaning pass === 1 won't be able to bypass it either! This is CORRECT. If free distribution is false, we should NEVER allow two subjects on the same day.
// BUT wait... what if it's strictly impossible to find a valid day? Then the algorithm fails to place the card, increasing unplaced cards. This is also CORRECT! The user expects it to be impossible if there's no room.
// Let's replace the old rule with nothing.
code = code.replace(oldRuleTarget, `                // Check rules handled by getConflicts -> checkRules`);

fs.writeFileSync('src/workers/quantum.ts', code);
console.log("Updated quantum worker");
