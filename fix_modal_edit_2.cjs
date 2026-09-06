const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Revert the onClick to eject and edit:
// onClick={() => { editModalPoolCard({ ...blk.fullCard, _editingBlock: { typeKey, name, dIdx: blk.dIdx, pIdx: blk.pIdx }}); }}
code = code.replace(/onClick=\{\(\) => \{ editModalPoolCard\(\{ \.\.\.blk\.fullCard, _editingBlock: \{ typeKey, name, dIdx: blk\.dIdx, pIdx: blk\.pIdx \}\}\); \}\}/g, 
    "onClick={() => { ejectCellIfOccupied(typeKey, name, blk.dIdx, blk.pIdx); setTimeout(() => editModalPoolCard(blk.fullCard), 100); }}");

fs.writeFileSync('src/App.tsx', code);
console.log("Updated groupedPlaced to eject and edit");
