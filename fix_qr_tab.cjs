const fs = require('fs');
let code = fs.readFileSync('src/components/ExportReportingModal.tsx', 'utf-8');

// Replace items-center with items-start to prevent top clipping when overflowing
code = code.replace(
  /\{activeTab === "qr" && \(\s*<div className="flex items-center justify-center py-4 px-2 sm:px-4">/g,
  '{activeTab === "qr" && (\n            <div className="flex items-start justify-center py-4 px-2 sm:px-4 min-h-full">'
);

fs.writeFileSync('src/components/ExportReportingModal.tsx', code);
console.log("QR tab fixed!");
