const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `    setConstraints(prevConstraints => {`;
const replacement = `    setConstraintModal(prev => {
      if (prev && prev.name === oldName && prev.type === type) return { ...prev, name };
      return prev;
    });
    setConstraints(prevConstraints => {`;

code = code.replace(target, replacement);

fs.writeFileSync('src/App.tsx', code);
console.log("Updated constraintModal logic in handleRename");
