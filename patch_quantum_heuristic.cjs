const fs = require('fs');
let code = fs.readFileSync('src/workers/quantum.ts', 'utf8');

code = code.replace(
    'const searchLimit = unplacedList.length < 100 ? unplacedList.length : 50;',
    'const searchLimit = unplacedList.length < 300 ? unplacedList.length : 150;'
);

code = code.replace(
    'const score = (card.hours * 100) +',
    'const score = (card.hours * 150) +'
);

code = code.replace(
    '(card.mappedTeachers.length * 40) +',
    '(card.mappedTeachers.length * 50) +'
);

code = code.replace(
    '(card.mappedClasses.length * 40) +',
    '(card.mappedClasses.length * 50) +'
);

code = code.replace(
    '(card.failCount * 80) +',
    '(card.failCount * 120) +'
);

code = code.replace(
    'if (Math.random() > 0.05) {',
    'if (Math.random() > 0.02) {'
);

fs.writeFileSync('src/workers/quantum.ts', code);
console.log('patched heuristic');
