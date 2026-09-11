const fs = require('fs');
let code = fs.readFileSync('src/components/ExportReportingModal.tsx', 'utf-8');

// Remove mobileDisplayMode state
code = code.replace(/const \[mobileDisplayMode, setMobileDisplayMode\] = useState<"card" \| "table">\(\s*"card",\s*\);/, '');

// Replace conditional logic for School Card View
code = code.replace(/\{mobileDisplayMode === "card" && \(/g, '(');
code = code.replace(/<div className="space-y-4 print:hidden">/g, '<div className="space-y-4 block lg:hidden print:hidden">');

// Replace conditional logic for School Table View
code = code.replace(/className={`overflow-x-auto custom-scrollbar border border-slate-300 rounded-lg shadow-2xs print:border-none print:shadow-none \$\{\s*mobileDisplayMode === "card"\s*\? "hidden print:block"\s*: "block"\s*\}`}/g, 'className="overflow-x-auto custom-scrollbar border border-slate-300 rounded-lg shadow-2xs print:border-none print:shadow-none hidden lg:block print:block"');

fs.writeFileSync('src/components/ExportReportingModal.tsx', code);
console.log("Responsive logic applied!");
