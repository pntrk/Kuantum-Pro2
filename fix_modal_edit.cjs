const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Update modalPoolForm state structure implicitly where used, wait, it's just state.
code = code.replace(/setModalPoolForm\(prev => \(\{ \.\.\.prev, subject: '', format: '2', editingId: null \}\)\)/g, 
    "setModalPoolForm(prev => ({ ...prev, subject: '', format: '2', editingId: null, editingBlock: null }))");

code = code.replace(/setModalPoolForm\(\{/g, 
    "setModalPoolForm({ editingBlock: card._editingBlock || null,");
    
code = code.replace(/<button onClick=\{\(\) => setModalPoolForm\(prev => \(\{ \.\.\.prev, subject: '', format: '2', editingId: null \}\)\)\} className="px-2 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded transition-colors">İptal<\/button>/,
    '<button onClick={() => setModalPoolForm(prev => ({...prev, subject: \'\', format: \'2\', editingId: null, editingBlock: null}))} className="px-2 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded transition-colors">İptal</button>');

// In groupedPlaced:
// onClick={() => { editModalPoolCard(blk.fullCard); }} -> onClick={() => { editModalPoolCard({ ...blk.fullCard, _editingBlock: { typeKey, name, dIdx: blk.dIdx, pIdx: blk.pIdx }}); }}
code = code.replace(/onClick=\{\(\) => \{ editModalPoolCard\(blk\.fullCard\); \}\}/g, 
    "onClick={() => { editModalPoolCard({ ...blk.fullCard, _editingBlock: { typeKey, name, dIdx: blk.dIdx, pIdx: blk.pIdx }}); }}");

// In handleModalCreatePoolCard:
// if (modalPoolForm.editingId) {
//     currentUnplaced = currentUnplaced.filter(c => c.id !== modalPoolForm.editingId);
// }
// Change to:
// if (modalPoolForm.editingId) {
//     currentUnplaced = currentUnplaced.filter(c => c.id !== modalPoolForm.editingId);
//     if (modalPoolForm.editingBlock) {
//         const b = modalPoolForm.editingBlock;
//         ejectCellIfOccupied(b.typeKey, b.name, b.dIdx, b.pIdx);
//         // Because ejectCellIfOccupied updates unplacedCourses asynchronously, it's a bit tricky...
//         // Actually, wait, ejectCellIfOccupied is a state setter. It will add the old card to the pool.
//         // Then we would have the OLD card and the NEW card.
//         // To prevent this, we should NOT call ejectCellIfOccupied. We should do the ejection logic manually in handleModalCreatePoolCard? No, too complex.
//     }
// }

fs.writeFileSync('src/App.tsx', code);
console.log("Updated groupedPlaced to pass editingBlock");
