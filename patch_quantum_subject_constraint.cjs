const fs = require('fs');
let code = fs.readFileSync('src/workers/quantum.ts', 'utf8');

const target = `    for (let i = 0; i < c.mappedRooms.length; i++) {
      const r = c.mappedRooms[i];
      if ((constraint_R[r * 7 + d] & mask) !== 0) return null;
    }`;

const rep = `    for (let i = 0; i < c.mappedRooms.length; i++) {
      const r = c.mappedRooms[i];
      if ((constraint_R[r * 7 + d] & mask) !== 0) return null;
    }
    
    // Fallback: check manual subject constraints as string keys just to be safe
    if (c.subject && constraints?.subjects?.[c.subject]) {
      for (let i = 0; i < c.hours; i++) {
         if (constraints.subjects[c.subject].includes(\`\${d}-\${p + i}\`)) return null;
      }
    }`;

if (code.includes(target)) {
    code = code.replace(target, rep);
    fs.writeFileSync('src/workers/quantum.ts', code);
    console.log("Patched quantum.ts getConflicts");
} else {
    console.log("Target not found");
}
