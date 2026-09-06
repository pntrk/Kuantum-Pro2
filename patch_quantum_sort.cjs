const fs = require('fs');
let code = fs.readFileSync('src/workers/quantum.ts', 'utf8');

// The worker does this on start:
// data.unplaced.forEach(c => {
//    addToUnplaced(c.id);
// });
// So unplacedList is populated in the order of data.unplaced.
// If we sort data.unplaced in App.tsx, they will be ordered in unplacedList.
// Let's change the random selection to favor the start of the array if deep learning is active.
// Actually, even without deep learning active, starting with hardest is good. 

code = code.replace(
    'let c_id = unplacedList[Math.floor(Math.random() * unplacedList.length)];',
    'let c_id = unplacedList[Math.floor(Math.pow(Math.random(), 2) * unplacedList.length)];'
);

code = code.replace(
    'const id = unplacedList[Math.floor(Math.random() * unplacedList.length)];',
    'const id = unplacedList[Math.floor(Math.pow(Math.random(), 2) * unplacedList.length)];'
);

fs.writeFileSync('src/workers/quantum.ts', code);
console.log('patched quantum logic');
