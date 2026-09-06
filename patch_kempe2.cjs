const fs = require('fs');
let code = fs.readFileSync('src/workers/quantum.ts', 'utf8');

code = code.replace(
`                    const ec = movableMap.get(bestConflicts[0]);
                    if (ec) {
                        // try to find a place for ec immediately without ejecting anything
                        remove(ec);`,
`                    const ec = movableMap.get(bestConflicts[0]);
                    if (ec) {
                        const origEcD = ec.d;
                        const origEcP = ec.p;
                        // try to find a place for ec immediately without ejecting anything
                        remove(ec);`
);

fs.writeFileSync('src/workers/quantum.ts', code);
