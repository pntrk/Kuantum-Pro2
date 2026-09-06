const fs = require('fs');
let code = fs.readFileSync('src/workers/quantum.ts', 'utf8');

const tabuRuleTarget = `                let hasSubj = false;
                for(let i=0; i<c.mappedClasses.length; i++) {
                    if (hasSubject(c.mappedClasses[i], dIdx, c.mappedSubject)) { hasSubj = true; break; }
                }`;

code = code.replace(tabuRuleTarget, `                // Check rules handled by getConflicts -> checkRules`);

fs.writeFileSync('src/workers/quantum.ts', code);
console.log("Updated quantum worker Tabu part");
