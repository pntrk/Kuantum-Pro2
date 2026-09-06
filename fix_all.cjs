const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Fix setModalPoolForm bad replaces
code = code.replace(/setModalPoolForm\(\{ editingBlock: card\._editingBlock \|\| null,\.\.\.modalPoolForm,/g, "setModalPoolForm({ ...modalPoolForm,");
code = code.replace(/setModalPoolForm\(\{ editingBlock: card\._editingBlock \|\| null, teachers/g, "setModalPoolForm({ editingBlock: null, teachers");

// Check if EditableText is imported
if (!code.includes("import EditableText")) {
    // find import DutyManager
    code = code.replace("import DutyManager", "import EditableText from './components/EditableText';\nimport DutyManager");
}

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed errors");
