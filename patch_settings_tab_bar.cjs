const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The side navigation tabs in renderSettings are currently:
const target = `<div className="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 flex flex-row md:flex-col p-2 gap-2 overflow-x-auto whitespace-nowrap shrink-0 custom-scrollbar">`;
const replacement = `<div className="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 flex flex-row md:flex-col p-2 gap-2 overflow-x-auto hide-scrollbar whitespace-nowrap shrink-0">`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Success patch tabs");
}

