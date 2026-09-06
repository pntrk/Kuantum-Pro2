const fs = require('fs');

let file = fs.readFileSync('src/App.tsx', 'utf8');

const oldPick = `        // Pick a card
        const unplacedArr = Array.from(unplaced);
        const c_id = unplacedArr[Math.floor(Math.random() * unplacedArr.length)];
        const c = movableMap.get(c_id);`;

const newPick = `        // Pick a card (MRV heuristic: prioritize cards with higher hours, more constraints or high failCount)
        const unplacedArr = Array.from(unplaced);
        let best_c_id = unplacedArr[0];
        let best_score = -999999;
        
        // Only sample up to 10 unplaced cards to save CPU time
        const sampleSize = Math.min(unplacedArr.length, 10);
        for(let i=0; i<sampleSize; i++) {
            const id = unplacedArr[Math.floor(Math.random() * unplacedArr.length)];
            const card = movableMap.get(id);
            const score = (card.hours * 20) + (card.mappedTeachers.length * 10) + card.failCount;
            if (score > best_score) {
                best_score = score;
                best_c_id = id;
            }
        }
        
        const c_id = best_c_id;
        const c = movableMap.get(c_id);`;

file = file.replace(oldPick, newPick);
fs.writeFileSync('src/App.tsx', file);
console.log("Solver updated.");
