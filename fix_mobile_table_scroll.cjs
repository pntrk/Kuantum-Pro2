const fs = require('fs');
let code = fs.readFileSync('src/components/ExportReportingModal.tsx', 'utf-8');

code = code.replace(
  /<table className="w-full text-left text-xs border-collapse">/g,
  '<table className="w-full min-w-max text-left text-xs border-collapse">'
);

fs.writeFileSync('src/components/ExportReportingModal.tsx', code);
console.log("Fixed mobile table horizontal scroll.");
