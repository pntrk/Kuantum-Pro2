const fs = require('fs');
let code = fs.readFileSync('src/workers/quantum.ts', 'utf8');

const regexCheckRules = /const checkRules = \(c, d, p\) => \{[\s\S]*?return true;\n    \};/;
const replacementCheckRules = `const checkRules = (c, d, p) => {
        // Advanced Distribution Logic: Standard rule avoids multiple blocks of the same subject on the same day
        for(let i=0; i<c.mappedClasses.length; i++) {
            const cl = c.mappedClasses[i];
            for(let hr=0; hr<15; hr++) {
                const id = grid_C[cl*7 + d][hr];
                if (id !== -1) {
                    const existingCard = movableMap.get(id);
                    if (existingCard && existingCard.mappedSubject === c.mappedSubject && id !== c.mappedId) {
                        return false;
                    }
                }
            }
        }
        return true;
    };`;

code = code.replace(regexCheckRules, replacementCheckRules);

const regexGetConflicts = /if \(distributionRules && !distributionRules\.freeDistribution\) \{([\s\S]*?)\}/;
const replacementGetConflicts = `$1`;

code = code.replace(regexGetConflicts, replacementGetConflicts);
code = code.replace(/let distributionRules: any = null;\n/g, '');
code = code.replace(/distributionRules = e\.data\.distributionRules;\n/g, '');

fs.writeFileSync('src/workers/quantum.ts', code);
console.log("Cleaned quantum.ts");
