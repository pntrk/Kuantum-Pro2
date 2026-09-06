const fs = require('fs');
const content = fs.readFileSync('dumped_strings.txt', 'utf8');
const sections = content.split('\n---MAGIC-SEP---\n');

let bestSection = null;
let maxLen = 0;

for (const section of sections) {
  // We want the original App.tsx. The original has imports.
  // It shouldn't be the mangled sourcemap or corrupted file.
  // The original has around 3000 lines (or 100KB).
  if (section.includes('const analyzeConflicts') && section.includes('const renderMatrix')) {
     if (section.length > maxLen && !section.includes('sourceMappingURL=')) {
        maxLen = section.length;
        bestSection = section;
     }
  }
}

if (bestSection) {
  fs.writeFileSync('src/App.tsx', bestSection);
  console.log('Recovered! Size:', bestSection.length);
} else {
  console.log('Not found');
}
