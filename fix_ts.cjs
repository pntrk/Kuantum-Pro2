const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/targetCardData\.hours/g, '(targetCardData as any).hours');
code = code.replace(/targetCardData\.failCount/g, '(targetCardData as any).failCount');
code = code.replace(/targetCardData\.id/g, '(targetCardData as any).id');
code = code.replace(/parsed\.hours/g, '(parsed as any).span');

fs.writeFileSync('src/App.tsx', code);
