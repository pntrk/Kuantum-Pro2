const fs = require('fs');

let code = fs.readFileSync('src/workers/quantum.ts', 'utf8');

const targetStr = `
            // Tabu / Ejection / SA mode
            for(let dIdx of shuffledDaysIndices) {
`;

const replaceStr = `
            // Tabu / Ejection / SA mode
            let fallbackSlot = null;
            let fallbackConflicts = [];
            let fallbackMinWeight = 999999;
            for(let dIdx of shuffledDaysIndices) {
`;

code = code.replace(targetStr.trim(), replaceStr.trim());

const targetStr2 = `
                    if ((!isTabu || saAccept) && weight < minConflictWeight) {
                        minConflictWeight = weight;
                        bestSlot = {d: dIdx, p};
                        bestConflicts = conflicts;
                    }
                }
            }
`;

const replaceStr2 = `
                    if (weight < fallbackMinWeight) {
                        fallbackMinWeight = weight;
                        fallbackSlot = {d: dIdx, p};
                        fallbackConflicts = conflicts;
                    }

                    if ((!isTabu || saAccept) && weight < minConflictWeight) {
                        minConflictWeight = weight;
                        bestSlot = {d: dIdx, p};
                        bestConflicts = conflicts;
                    }
                }
            }
            if (!bestSlot && fallbackSlot) {
                bestSlot = fallbackSlot;
                bestConflicts = fallbackConflicts;
            }
`;

code = code.replace(targetStr2.trim(), replaceStr2.trim());

fs.writeFileSync('src/workers/quantum.ts', code);
console.log('patched fallback slot');
