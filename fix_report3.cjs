const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /card\.classes\.forEach\(c => \{\s*for\(let p=0; p<15; p\+\+\) \{\s*if\(classSchedules\[c\]\?\.\[absDIdx\]\?\.\[p\] === card\.subject\) hasSubj = true;\s*\}\s*\}\);/;
const replacement = `card.classes.forEach(c => {
                     for(let p=0; p<15; p++) {
                         const cellVal = classSchedules[c]?.[absDIdx]?.[p];
                         if(cellVal) {
                             const parsed = parseCellData(cellVal);
                             if (parsed && parsed.subject === card.subject && parsed.id !== card.id) hasSubj = true;
                         }
                     }
                 });`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Fixed report checking");
} else {
    console.log("Could not find regex");
}
