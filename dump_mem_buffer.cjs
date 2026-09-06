const fs = require('fs');
const pid = 2242;

try {
  const maps = fs.readFileSync(`/proc/${pid}/maps`, 'utf8').split('\n');
  const fd = fs.openSync(`/proc/${pid}/mem`, 'r');

  let foundBuffer = null;

  for (const line of maps) {
    if (!line) continue;
    const parts = line.split(' ');
    const range = parts[0].split('-');
    const start = BigInt('0x' + range[0]);
    const end = BigInt('0x' + range[1]);
    const perms = parts[1];
    
    if (perms.includes('r')) {
      const size = Number(end - start);
      if (size > 1024 * 1024 * 50) continue; 
      
      const buf = Buffer.allocUnsafe(size);
      try {
        fs.readSync(fd, buf, 0, size, Number(start));
        // We look for "import React" and "const renderConflictModal"
        if (buf.includes('import React') && buf.includes('const renderConflictModal') && !buf.includes('sourceMappingURL=')) {
           // We might have a match. Let's find the boundaries.
           const str = buf.toString('utf8');
           // the file starts with "import React"
           const startIdx = str.indexOf("import React");
           if (startIdx !== -1) {
              const substring = str.substring(startIdx, startIdx + 200000);
              // Let's verify it has renderConflictModal
              if (substring.includes('const renderConflictModal')) {
                 const endIdx = substring.lastIndexOf('export default App;');
                 if (endIdx !== -1) {
                    foundBuffer = substring.substring(0, endIdx + 19);
                    break;
                 }
              }
           }
        }
      } catch (e) {}
    }
  }
  fs.closeSync(fd);
  
  if (foundBuffer) {
     fs.writeFileSync('src/App.tsx', foundBuffer);
     console.log('Recovered fully via Buffer! Size:', foundBuffer.length);
  } else {
     console.log('Not found in memory');
  }
} catch (e) {
  console.error(e);
}
