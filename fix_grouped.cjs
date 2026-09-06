const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Update relatedCardsPlaced.push to include full card data
code = code.replace(/relatedCardsPlaced\.push\(\{ other: otherEntities, subject: cData\.subject, day: day\.name, hour: pIdx \+ 1, dIdx: absDIdx, pIdx \}\);/g, 
    "relatedCardsPlaced.push({ other: otherEntities, subject: cData.subject, day: day.name, hour: pIdx + 1, dIdx: absDIdx, pIdx, fullCard: cData, originalVal: val });");

code = code.replace(/relatedCardsPlaced\.push\(\{ other: \`\$\{tName\} ➔ \$\{cData\.classes\.join\(\', \'\}\)\}\`, subject: cData\.subject, day: day\.name, hour: pIdx \+ 1, dIdx: absDIdx, pIdx \}\);/g, 
    "relatedCardsPlaced.push({ other: `${tName} ➔ ${cData.classes.join(', ')}`, subject: cData.subject, day: day.name, hour: pIdx + 1, dIdx: absDIdx, pIdx, fullCard: cData, originalVal: val });");

// Update groupedPlaced to retain fullCard
code = code.replace(/if \(!currentBlock\) \{ currentBlock = \{ \.\.\.card, span: 1 \}; \} /g,
    "if (!currentBlock) { currentBlock = { ...card, span: 1, fullCards: [card] }; } ");
    
code = code.replace(/currentBlock\.span \+= 1;/g,
    "currentBlock.span += 1; currentBlock.fullCards.push(card);");

code = code.replace(/currentBlock = \{ \.\.\.card, span: 1 \};/g,
    "currentBlock = { ...card, span: 1, fullCards: [card] };");

// Update rendering of groupedPlaced to be clickable!
const placedTarget = '<div key={i} className="text-xs p-2 bg-white border border-slate-200 rounded shadow-sm flex flex-col gap-1 group hover:border-indigo-300 transition-colors">';
const placedReplace = '<div key={i} onClick={() => { editModalPoolCard(blk.fullCard); }} className="text-xs p-2 bg-white border border-slate-200 rounded shadow-sm flex flex-col gap-1 group hover:border-indigo-300 transition-colors cursor-pointer">';

code = code.replace(placedTarget, placedReplace);

fs.writeFileSync('src/App.tsx', code);
console.log("Updated groupedPlaced to be editable");
