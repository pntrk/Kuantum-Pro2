const fs = require('fs');
let code = fs.readFileSync('src/components/ExportReportingModal.tsx', 'utf-8');

// 1. Replace selectedEntity with selectedEntities
code = code.replace(/const \[selectedEntity, setSelectedEntity\] = useState<string>\(teachers\[0\] \|\| ''\);/, 'const [selectedEntities, setSelectedEntities] = useState<string[]>(teachers.length > 0 ? [teachers[0]] : []);');

// 2. Update useEffect
code = code.replace(/if \(!selectedEntity \|\| !teachers\.includes\(selectedEntity\)\) \{\s+setSelectedEntity\(teachers\[0\] \|\| ''\);\s+\}/, 'if (selectedEntities.length === 0 || !selectedEntities.every(e => teachers.includes(e))) {\n        setSelectedEntities(teachers.length > 0 ? [teachers[0]] : []);\n      }');
code = code.replace(/if \(!selectedEntity \|\| !classes\.includes\(selectedEntity\)\) \{\s+setSelectedEntity\(classes\[0\] \|\| ''\);\s+\}/, 'if (selectedEntities.length === 0 || !selectedEntities.every(e => classes.includes(e))) {\n        setSelectedEntities(classes.length > 0 ? [classes[0]] : []);\n      }');

// 3. Remove navigateEntity
code = code.replace(/\/\/ Helper for Stepper Navigation[\s\S]*?setSelectedEntity\(list\[nextIndex\]\);\s+\};\s+/, '');

// 4. Update calculateEntityTotalHours
code = code.replace(/const calculateEntityTotalHours = \(\) => \{[\s\S]*?if \(!selectedEntity\) return 0;/g, 'const calculateEntityTotalHours = (entity: string) => {\n    if (!entity) return 0;');
code = code.replace(/const dataSource = isTeacher \? schedules\[selectedEntity\] : classSchedules\[selectedEntity\];/g, 'const dataSource = isTeacher ? schedules[entity] : classSchedules[entity];');

// Remove totalEntityHours useMemo because we'll call the function directly
code = code.replace(/const totalEntityHours = useMemo\(\(\) => calculateEntityTotalHours\(\), \[.*?\]\);\s+/g, '');

// 5. Update PDF Generation
// This is the tricky part. We need to wrap the bodyRows generation in selectedEntities.forEach.
// Let's do this via regex carefully.
fs.writeFileSync('src/components/ExportReportingModal.tsx', code);
console.log('Phase 1 done');
