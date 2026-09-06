const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  const autoDistributePro = () => {
    const coreCount = navigator.hardwareConcurrency || 4;
    if (unplacedCourses.length === 0) return showToast("Dağıtılacak kart havuzda yok.", "warning");`;

const replacement = `  const autoDistributePro = () => {
    const coreCount = navigator.hardwareConcurrency || 4;
    if (unplacedCourses.length === 0) return showToast("Dağıtılacak kart havuzda yok.", "warning");
    
    // Check conflicts before distributing
    const reportList = getConflictReport();
    if (reportList.length > 0) {
        setConflictReport(reportList);
        showToast("Dağıtım yapılamaz! Kısıtlamalar nedeniyle yerleşemeyecek kartlar var.", "error");
        return;
    }`;

code = code.replace(target, replacement);

const workerTarget = `                worker.postMessage({
                    schedules,
                    classSchedules,
                    roomSchedules,
                    unplacedCourses,
                    constraints,
                    schoolSettings,
                    lockedCells,
                    maxIterations: 800000,
                    tabuSize: 1500,
                    threadId: i
                });`;

const workerReplacement = `                worker.postMessage({
                    schedules,
                    classSchedules,
                    roomSchedules,
                    unplacedCourses,
                    constraints,
                    schoolSettings,
                    lockedCells,
                    distributionRules,
                    maxIterations: 800000,
                    tabuSize: 1500,
                    threadId: i
                });`;

code = code.replace(workerTarget, workerReplacement);

fs.writeFileSync('src/App.tsx', code);
console.log("Updated autoDistributePro");
