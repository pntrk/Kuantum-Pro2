const fs = require('fs');
const pid = 2242;

try {
  const maps = fs.readFileSync(`/proc/${pid}/maps`, 'utf8').split('\n');
  const fd = fs.openSync(`/proc/${pid}/mem`, 'r');
  let allStrings = [];

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
        let currentString = '';
        for (let i = 0; i < size; i++) {
          const char = buf[i];
          if ((char >= 32 && char <= 126) || char === 10 || char === 9 || char === 13 || char > 127) {
            currentString += String.fromCharCode(char);
          } else {
            if (currentString.length > 5000 && currentString.includes('import React')) {
               allStrings.push(currentString);
            }
            currentString = '';
          }
        }
      } catch (e) {}
    }
  }
  fs.closeSync(fd);
  
  fs.writeFileSync('dumped_strings.txt', allStrings.join('\n---MAGIC-SEP---\n'));
  console.log('Dumped ' + allStrings.length + ' strings.');
} catch (e) {
  console.error(e);
}
