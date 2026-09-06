const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
    '.genel-table th { font-size: 11px; padding: 2px; }',
    '.genel-table th { font-size: 11.5px; padding: 3px; background-color: #f1f5f9 !important; border: 1px solid #94a3b8; }'
);
code = code.replace(
    '.genel-table .row-header { font-size: 11px; width: 90px; }',
    '.genel-table .row-header { font-size: 11.5px; width: 95px; font-weight: 900; background-color: #f8fafc !important; }'
);
code = code.replace(
    '.genel-table .main-text { font-size: clamp(9px, 1vw, 12px); }',
    '.genel-table .main-text { font-size: 10px; font-weight: 800; line-height: 1.1; display: block; padding-bottom: 2px; }'
);
code = code.replace(
    '.genel-table .sub-text { font-size: clamp(8px, 0.9vw, 10px); color: #475569; font-weight: normal; }',
    '.genel-table .sub-text { font-size: 8.5px; color: #475569; font-weight: 600; line-height: 1; display: block; }'
);
code = code.replace(
    '.genel-table th, td { border: 1px solid #64748b; text-align: center; overflow: hidden; padding: 4px; vertical-align: middle; word-wrap: break-word; }',
    'th, td { border: 1px solid #94a3b8; text-align: center; overflow: hidden; padding: 3px; vertical-align: middle; word-wrap: break-word; }'
);
code = code.replace(
    'th { background-color: #e2e8f0 !important; font-weight: 800; font-size: 12px; color: #0f172a; -webkit-print-color-adjust: exact; print-color-adjust: exact; }',
    'th { background-color: #e2e8f0 !important; font-weight: 800; font-size: 12.5px; color: #0f172a; -webkit-print-color-adjust: exact; print-color-adjust: exact; }'
);

fs.writeFileSync('src/App.tsx', code);
console.log('patched pdf styles');
