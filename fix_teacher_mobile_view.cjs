const fs = require('fs');
let code = fs.readFileSync('src/components/ExportReportingModal.tsx', 'utf-8');

// For Teacher/Class view, we will hide the CARD VIEW and show the MATRIX TABLE VIEW everywhere
// 1. Find the mobile card view block for Teacher/Class and completely comment it out or hide it.
// Actually, it starts around line 2389 with `<div className="space-y-4 block lg:hidden print:hidden">`

// Let's replace the Teacher/Class card view class to be completely hidden always
code = code.replace(/\{exportType === "teacher" \|\| exportType === "class"\) && \(\s*<>\s*\{\/\* 1\. MOBILE CARD VIEW FOR TEACHER \/ CLASS \*\/\}\s*<div className="space-y-4 block lg:hidden print:hidden">/g, 
  '{exportType === "teacher" || exportType === "class") && (\n                <>\n                  {/* 1. MOBILE CARD VIEW FOR TEACHER / CLASS (HIDDEN) */}\n                  <div className="hidden space-y-4 print:hidden">');

// 2. Unhide the Classic Matrix Table view for Teacher/Class on mobile
// The line is: className="overflow-x-auto custom-scrollbar border border-slate-300 rounded-lg shadow-2xs print:border-none print:shadow-none hidden lg:block print:block"
// Note: This string might be shared with School view. Let's make sure we only replace the one for Teacher/Class.

const matrixSearch = `                  {/* 2. CLASSIC MATRIX TABLE VIEW (Active on table mode or when printing) */}
                  <div
                    className="overflow-x-auto custom-scrollbar border border-slate-300 rounded-lg shadow-2xs print:border-none print:shadow-none hidden lg:block print:block"
                  >`;
const matrixReplace = `                  {/* 2. CLASSIC MATRIX TABLE VIEW (Active on table mode or when printing) */}
                  <div
                    className="overflow-x-auto custom-scrollbar border border-slate-300 rounded-lg shadow-2xs print:border-none print:shadow-none block print:block"
                  >`;
code = code.replace(matrixSearch, matrixReplace);

fs.writeFileSync('src/components/ExportReportingModal.tsx', code);
console.log("Teacher/Class mobile matrix applied!");
