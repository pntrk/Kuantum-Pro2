const fs = require('fs');
let code = fs.readFileSync('src/components/ExportReportingModal.tsx', 'utf-8');

// The `( ` from replacing `{mobileDisplayMode === "card" && (` is causing a mismatch because the closing was `)}`.
code = code.replace(/\(\s*<div className="space-y-4 block lg:hidden print:hidden">/g, '<div className="space-y-4 block lg:hidden print:hidden">');
code = code.replace(/                  \)\}\s*                  \{\/\* 2\. FULL MATRIX TABLE VIEW/g, '                  {/* 2. FULL MATRIX TABLE VIEW');

code = code.replace(/                  \)\}\s*                  \{\/\* 2\. CLASSIC MATRIX TABLE VIEW/g, '                  {/* 2. CLASSIC MATRIX TABLE VIEW');

fs.writeFileSync('src/components/ExportReportingModal.tsx', code);
console.log("Syntax fixed!");
