const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /  const ejectCellIfOccupied = \(typeKey, entityName, dIdx, pIdx\) => \{[\s\S]*?const checkAndEject = \(valStr\) => \{[\s\S]*?if \(!valStr \|\| valStr === ''\) return;[\s\S]*?const info = getEjectBlockInfo\(valStr, dIdx, pIdx\);/;

const replacement = `  // Cache to prevent duplicate ejections within the same event loop
  const ejectedInThisEventLoop = useRef(new Set());

  const ejectCellIfOccupied = (typeKey, entityName, dIdx, pIdx) => {
      const blocksToEjectMap = new Map();
      
      const checkAndEject = (valStr) => {
          if (!valStr || valStr === '') return;
          if (ejectedInThisEventLoop.current.has(valStr)) return;
          const info = getEjectBlockInfo(valStr, dIdx, pIdx);`;

if(regex.test(content)) {
    content = content.replace(regex, replacement);
    // Also we need to add the setTimeout to clear the cache when we add it
    const regexAdd = /blocksToEjectMap\.set\(info\.valStr, info\);/;
    content = content.replace(regexAdd, `blocksToEjectMap.set(info.valStr, info);\n              ejectedInThisEventLoop.current.add(info.valStr);\n              setTimeout(() => ejectedInThisEventLoop.current.delete(info.valStr), 0);`);
    
    fs.writeFileSync('src/App.tsx', content);
    console.log("Success replacing checkAndEject");
} else {
    console.log("Failed replacing checkAndEject regex");
}
