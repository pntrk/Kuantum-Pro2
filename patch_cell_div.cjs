const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `<div draggable={!brushMode.active} onDragStart={(e) => handleDragStart(e, rowKey, absDIdx, pIdx, cellVal, blockSize)} onDragEnd={handleDragEnd}
                                                            title={conflictTooltip}
                                                            className={\`h-full w-full min-h-[46px] md:min-h-[54px] p-1 flex flex-col justify-between items-center relative group/cell transition-all select-none \${cClass} border-l-[3.5px] rounded-[3px] \${hasConflict ? "ring-2 ring-red-500 ring-inset border-2 border-red-600 shadow-md shadow-red-200/60 bg-red-50/95" : ""} \${isLocked ? "ring-1 ring-amber-400/80 ring-inset" : ""} \${isSelectedForSwap ? 'ring-2 ring-blue-500 shadow-blue-200 bg-blue-50/50' : ''} \${brushMode.active ? "cursor-crosshair pointer-events-none" : "cursor-grab hover:shadow-md hover:brightness-[0.98] active:cursor-grabbing"}\`}>`;

const replacement = `<div draggable={!brushMode.active} onDragStart={(e) => handleDragStart(e, rowKey, absDIdx, pIdx, cellVal, blockSize)} onDragEnd={handleDragEnd}
                                                            title={conflictTooltip}
                                                            tabIndex={0}
                                                            className={\`h-full w-full min-h-[46px] md:min-h-[54px] p-1 flex flex-col justify-between items-center relative group/cell transition-all select-none outline-none \${cClass} border-l-[3.5px] rounded-[3px] \${hasConflict ? "ring-2 ring-red-500 ring-inset border-2 border-red-600 shadow-md shadow-red-200/60 bg-red-50/95" : ""} \${isLocked ? "ring-1 ring-amber-400/80 ring-inset" : ""} \${isSelectedForSwap ? 'ring-2 ring-blue-500 shadow-blue-200 bg-blue-50/50' : ''} \${brushMode.active ? "cursor-crosshair pointer-events-none" : "cursor-grab hover:shadow-md hover:brightness-[0.98] active:cursor-grabbing"}\`}>`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Success cell div");
} else {
  console.log("target string not found.");
}
