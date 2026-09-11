const fs = require('fs');
let code = fs.readFileSync('src/components/ExportReportingModal.tsx', 'utf-8');

// Find activeDays definition
const lines = code.split('\n');
const adIdx = lines.findIndex(l => l.includes('const activeDays ='));
console.log(lines.slice(adIdx, adIdx + 10).join('\n'));
