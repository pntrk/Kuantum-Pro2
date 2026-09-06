const fs = require('fs');
let code = fs.readFileSync('src/components/DutyManager.tsx', 'utf8');

// Roster Table wrapper
code = code.replace(
    `<div className="flex-1 overflow-auto custom-scrollbar p-4">
                <table className="w-full border-collapse">`,
    `<div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar p-0 md:p-4">
                <table className="w-full border-collapse min-w-[800px]">`
);

// Personel List Table wrapper
code = code.replace(
    `<div className="border border-slate-200 rounded-xl overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
              <table className="w-full border-collapse min-w-[650px]">`,
    `<div className="border border-slate-200 rounded-xl overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar bg-white">
              <table className="w-full border-collapse min-w-[900px]">`
);

// Roster Print button in Summary
code = code.replace(
    `<div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                          <table className="w-full text-left text-xs border-collapse">`,
    `<div className="border border-slate-200 rounded-xl overflow-x-auto bg-white shadow-xs">
                          <table className="w-full text-left text-xs border-collapse min-w-[650px] whitespace-nowrap">`
);

fs.writeFileSync('src/components/DutyManager.tsx', code);
console.log("Success patch");
