const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `        worker.onmessage = (e) => {
            if (e.data.type === 'progress') {
                if (i === 0) { // only update UI from first thread to avoid flicker
                    setDistributeState({ isRunning: true, progress: e.data.progress, phase: e.data.phase + ' (Çekirdek: ' + coreCount + ')' });
                }
            } else if (e.data.type === 'done') {`;

const replStr = `        worker.onmessage = (e) => {
            if (e.data.type === 'progress') {
                setCoreStates(prev => {
                    const newStates = [...prev];
                    newStates[i] = { progress: e.data.progress, phase: e.data.phase };
                    return newStates;
                });
                if (i === 0) { // only update UI from first thread to avoid flicker
                    setDistributeState({ isRunning: true, progress: e.data.progress, phase: e.data.phase + ' (Çekirdek: ' + coreCount + ')' });
                }
            } else if (e.data.type === 'done') {`;

code = code.replace(targetStr, replStr);
fs.writeFileSync('src/App.tsx', code);
console.log("Replaced via plain string matching.");
