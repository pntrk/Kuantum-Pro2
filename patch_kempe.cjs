const fs = require('fs');
let code = fs.readFileSync('src/workers/quantum.ts', 'utf8');

// Fix 1: Tabu Kempe Chain
code = code.replace(
`                        const ec = movableMap.get(bestConflicts[0]);
                        if (ec) {
                            // try to find a place for ec immediately without ejecting anything
                            remove(ec);
                            place(c, bestSlot.d, bestSlot.p);`,
`                        const ec = movableMap.get(bestConflicts[0]);
                        if (ec) {
                            const origEcD = ec.d;
                            const origEcP = ec.p;
                            // try to find a place for ec immediately without ejecting anything
                            remove(ec);
                            place(c, bestSlot.d, bestSlot.p);`
);

code = code.replace(
`                        if (!kempeSuccess) {
                            remove(c);
                            place(ec, ec.d, ec.p); // revert
                        }`,
`                        if (!kempeSuccess) {
                            remove(c);
                            place(ec, origEcD, origEcP); // revert
                        }`
);


// Fix 2: fixPhase Kempe Chain
code = code.replace(
`                if (isSoftConflict(c, c.d, c.p)) {
                    softConflictCount++;
                    remove(c);
                    let fixed = false;`,
`                if (isSoftConflict(c, c.d, c.p)) {
                    softConflictCount++;
                    const origD = c.d;
                    const origP = c.p;
                    remove(c);
                    let fixed = false;`
);

code = code.replace(
`                                    const ec = movableMap.get(conf[0]);
                                    if (ec) {
                                        remove(ec);
                                        place(c, dIdx, p);`,
`                                    const ec = movableMap.get(conf[0]);
                                    if (ec) {
                                        const origEcD = ec.d;
                                        const origEcP = ec.p;
                                        remove(ec);
                                        place(c, dIdx, p);`
);

code = code.replace(
`                                        } else {
                                            remove(c);
                                            place(ec, ec.d, ec.p);
                                        }`,
`                                        } else {
                                            remove(c);
                                            place(ec, origEcD, origEcP);
                                        }`
);

code = code.replace(
`                        if (!kempeFixed) {
                            // Re-place where it was
                            place(c, c.d, c.p);
                        }`,
`                        if (!kempeFixed) {
                            // Re-place where it was
                            place(c, origD, origP);
                        }`
);

fs.writeFileSync('src/workers/quantum.ts', code);
