const fs = require('fs');
let code = fs.readFileSync('src/components/ExportReportingModal.tsx', 'utf8');

code = code.replace(
  `<div className="mt-4 flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <QRCodeSVG value={getShareLink(selectedEntity)} size={150} level="H" includeMargin={true} />
                        <p className="mt-4 text-xs text-slate-500 font-medium text-center">Öğretmen bu kodu okutarak programını telefonundan görebilir.</p>
                     </div>`,
  `<div className="mt-2 md:mt-4 flex flex-col items-center justify-center p-4 md:p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <QRCodeSVG value={getShareLink(selectedEntity)} size={150} level="H" includeMargin={true} />
                        <p className="mt-3 md:mt-4 text-xs text-slate-500 font-medium text-center">Öğretmen bu kodu okutarak programını telefonundan görebilir.</p>
                     </div>`
);

fs.writeFileSync('src/components/ExportReportingModal.tsx', code);
console.log("Success patch qr");
