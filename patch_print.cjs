const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
    'html, body { width: 100%; height: 100%; margin: 0; padding: 0; font-family: \'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif; background: #fff; color: #000; }',
    'html, body { width: 100%; margin: 0; padding: 0; font-family: \'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif; background: #fff; color: #000; }'
);
code = code.replace(
    '.page-container { width: 100%; min-height: 100vh; page-break-after: always; display: flex; flex-direction: column; box-sizing: border-box; padding: 0; margin-bottom: 20px; }',
    '.page-container { width: 100%; page-break-after: always; display: block; box-sizing: border-box; padding: 0; margin-bottom: 20px; }'
);
code = code.replace(
    'table { width: 100%; flex-grow: 1; border-collapse: collapse; table-layout: fixed; margin-bottom: 10px; height: 1px; }',
    'table { width: 100%; border-collapse: collapse; table-layout: fixed; margin-bottom: 10px; page-break-inside: auto; }\n          tr { page-break-inside: avoid; page-break-after: auto; }'
);
code = code.replace(
    '.signature-area { display: table; width: 100%; margin-top: auto; flex-shrink: 0; page-break-inside: avoid; padding-top: 20px; }',
    '.signature-area { display: table; width: 100%; margin-top: 30px; page-break-inside: avoid; padding-top: 20px; }'
);
code = code.replace(
    '.genel-table .main-text { font-size: 10px; font-weight: 800; line-height: 1.1; display: block; padding-bottom: 2px; }',
    '.genel-table .main-text { font-size: clamp(7px, 0.8vw, 10px); font-weight: 800; line-height: 1.1; display: block; padding-bottom: 2px; }'
);
code = code.replace(
    '.genel-table .sub-text { font-size: 8.5px; color: #475569; font-weight: 600; line-height: 1; display: block; }',
    '.genel-table .sub-text { font-size: clamp(6px, 0.7vw, 8px); color: #475569; font-weight: 600; line-height: 1; display: block; }'
);
code = code.replace(
    '.genel-table th { font-size: 11.5px; padding: 3px; background-color: #f1f5f9 !important; border: 1px solid #94a3b8; }',
    '.genel-table th { font-size: clamp(8px, 0.9vw, 11px); padding: 3px; background-color: #f1f5f9 !important; border: 1px solid #94a3b8; }'
);
code = code.replace(
    '.genel-table .row-header { font-size: 11.5px; width: 95px; font-weight: 900; background-color: #f8fafc !important; border-right: 2px solid #94a3b8; }',
    '.genel-table .row-header { font-size: clamp(8px, 0.9vw, 11px); width: clamp(60px, 8vw, 95px); font-weight: 900; background-color: #f8fafc !important; border-right: 2px solid #94a3b8; }'
);

fs.writeFileSync('src/App.tsx', code);
console.log('patched print');
