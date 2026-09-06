const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

file = file.replace(
    '<Printer className="w-4 h-4" /> Yazdır / PDF <ChevronDown className="w-4 h-4"/>',
    '<Printer className="w-4 h-4" /> Yazdır / PDF <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${printMenuOpen ? "rotate-180" : ""}`}/>'
);

file = file.replace(
    '<FileSpreadsheet className="w-4 h-4" /> Excel <ChevronDown className="w-4 h-4"/>',
    '<FileSpreadsheet className="w-4 h-4" /> Excel <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${excelMenuOpen ? "rotate-180" : ""}`}/>'
);

file = file.replace(
    '<Settings className="w-4 h-4" /> Dosya İşlemleri <ChevronDown className="w-4 h-4"/>',
    '<Settings className="w-4 h-4" /> Dosya İşlemleri <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${fileMenuOpen ? "rotate-180" : ""}`}/>'
);

fs.writeFileSync('src/App.tsx', file);
console.log("Chevrons updated.");
