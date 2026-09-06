const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace handleRenameEntity calls with handleRename
code = code.replace(/handleRenameEntity\(name, newVal, type\)/g, "handleRename(type, name, newVal)");
code = code.replace(/handleRenameEntity\(rowKey, newVal, previewType\)/g, "handleRename(previewType, rowKey, newVal)");

// Remove handleRenameEntity implementation
const startIdx = code.indexOf('const handleRenameEntity = (oldName, newName, type) => {');
if (startIdx !== -1) {
    let endIdx = code.indexOf('const handleRemoveEntity', startIdx);
    if (endIdx !== -1) {
        code = code.substring(0, startIdx) + code.substring(endIdx);
    }
}

fs.writeFileSync('src/App.tsx', code);
console.log("Cleaned up handleRenameEntity, using existing handleRename");
