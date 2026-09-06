const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = '<div key={card.id} draggable onDragStart={(e) => handlePoolDragStart(e, card)}\n                                        className={`relative p-2 rounded-lg shadow-sm border-l-4 ${cClass.split(\' \')[0]} bg-white cursor-grab hover:-translate-y-0.5 hover:shadow-md transition-all group border border-slate-200/50`}>';
const replaceStr = '<div key={card.id} draggable onDragStart={(e) => handlePoolDragStart(e, card)}\n                                        onClick={() => { editPoolCard(card); setPoolMenuOpen(true); }}\n                                        className={`relative p-2 rounded-lg shadow-sm border-l-4 ${cClass.split(\' \')[0]} bg-white cursor-grab hover:-translate-y-0.5 hover:shadow-md transition-all group border border-slate-200/50`}>';

code = code.replace(targetStr, replaceStr);

fs.writeFileSync('src/App.tsx', code);
console.log("Updated main pool cards click");
