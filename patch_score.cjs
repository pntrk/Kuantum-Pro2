const fs = require('fs');

let code = fs.readFileSync('src/workers/quantum.ts', 'utf8');

const targetStr = `
        if (Math.random() > 0.12 - (workerIndex || 0) * 0.02) {
             let best_score = -999999;
             for(let i=0; i<Math.min(unplacedList.length, 25); i++) {
`;

const replaceStr = `
        if (Math.random() > 0.05) {
             let best_score = -999999;
             const searchLimit = unplacedList.length < 100 ? unplacedList.length : 50;
             for(let i=0; i<searchLimit; i++) {
`;

code = code.replace(targetStr.trim(), replaceStr.trim());

const scoreTarget = `
                      const score = (card.hours * 80) + 
                                    (card.mappedTeachers.length * 35) + 
                                    (card.mappedClasses.length * 35) + 
                                    (card.mappedRooms.length * 20) + 
                                    (card.failCount * 30) + 
                                    Math.random() * 20 + (workerIndex || 0) * 15;
`;

const scoreReplace = `
                      const score = (card.hours * 100) + 
                                    (card.mappedTeachers.length * 40) + 
                                    (card.mappedClasses.length * 40) + 
                                    (card.mappedRooms.length * 20) + 
                                    (card.failCount * 80) + 
                                    Math.random() * 30 + (workerIndex || 0) * 15;
`;

code = code.replace(scoreTarget.trim(), scoreReplace.trim());

const weightTarget = `
                        if (cc) {
                            weight += (cc.hours * cc.hours) * 20 + (cc.mappedTeachers.length + cc.mappedClasses.length) * 15 + (cc.failCount * 25);
                        } else {
`;

const weightReplace = `
                        if (cc) {
                            weight += (cc.hours * cc.hours) * 35 + (cc.mappedTeachers.length + cc.mappedClasses.length) * 20 + (cc.failCount * 40);
                        } else {
`;

code = code.replace(weightTarget.trim(), weightReplace.trim());

fs.writeFileSync('src/workers/quantum.ts', code);
console.log('patched scores and weights');
