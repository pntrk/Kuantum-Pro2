const fs = require('fs');

let code = fs.readFileSync('src/workers/quantum.ts', 'utf8');

const targetStr = `
                                const kconf = getConflictsAdvanced(ec, kd, kp, useSoftConstraints);
                                if (kconf !== null && kconf.length === 0) {
                                    place(ec, kd, kp);
                                    ecPlaced = true;
                                    kempeSuccess = true;
                                    break;
                                }
`;

const replaceStr = `
                                const kconf = getConflictsAdvanced(ec, kd, kp, useSoftConstraints);
                                if (kconf !== null && kconf.length === 0) {
                                    place(ec, kd, kp);
                                    ecPlaced = true;
                                    kempeSuccess = true;
                                    break;
                                } else if (kconf !== null && kconf.length === 1 && Math.random() > 0.3) {
                                    const ec2 = movableMap.get(kconf[0]);
                                    if (ec2 && ec2.mappedId !== c_id) {
                                        const origEc2D = ec2.d;
                                        const origEc2P = ec2.p;
                                        remove(ec2);
                                        place(ec, kd, kp);
                                        let ec2Placed = false;
                                        for (let k2d of shuffledDaysIndices) {
                                            if (ec2Placed) break;
                                            const k2max = schoolSettings.weekDays[k2d].periods - ec2.hours;
                                            if (k2max < 0) continue;
                                            const k2starts = getShuffledStarts(k2max + 1);
                                            for (let k2i = 0; k2i <= k2max; k2i++) {
                                                const k2p = k2starts[k2i];
                                                const k2conf = getConflictsAdvanced(ec2, k2d, k2p, useSoftConstraints);
                                                if (k2conf !== null && k2conf.length === 0) {
                                                    place(ec2, k2d, k2p);
                                                    ec2Placed = true;
                                                    break;
                                                }
                                            }
                                        }
                                        if (ec2Placed) {
                                            ecPlaced = true;
                                            kempeSuccess = true;
                                            break;
                                        } else {
                                            remove(ec);
                                            place(ec2, origEc2D, origEc2P);
                                        }
                                    }
                                }
`;

if (code.includes(targetStr.trim())) {
    code = code.replace(targetStr.trim(), replaceStr.trim());
    fs.writeFileSync('src/workers/quantum.ts', code);
    console.log('patched level 2');
} else {
    console.log('target string not found');
}
