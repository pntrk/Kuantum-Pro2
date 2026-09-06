const fs = require('fs');
let code = fs.readFileSync('src/components/ExportReportingModal.tsx', 'utf8');

let target4 = `<div className="flex-1 bg-slate-200/50 p-6 overflow-y-auto flex justify-center items-start print:p-0 print:bg-white print:overflow-visible">`;
let replacement4 = `<div className="flex-1 bg-slate-200/50 p-2 md:p-6 overflow-y-auto flex justify-center items-start print:p-0 print:bg-white print:overflow-visible">`;

code = code.replace(target4, replacement4);

let target5 = `className="bg-white p-8 md:p-12 shadow-xl print:shadow-none w-full max-w-[800px] mx-auto min-h-[500px]"`;
let replacement5 = `className="bg-white p-3 md:p-12 shadow-md md:shadow-xl rounded-lg md:rounded-none print:shadow-none w-full max-w-[800px] mx-auto min-h-[300px] md:min-h-[500px]"`;

code = code.replace(target5, replacement5);

fs.writeFileSync('src/components/ExportReportingModal.tsx', code);
console.log("Success patch preview");
