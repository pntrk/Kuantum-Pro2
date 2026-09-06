const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// In the isGenel block:
// it currently has getSignatureHtml(key); but key is not defined, it should be getSignatureHtml()
code = code.replace(/htmlContent \+= getSignatureHtml\(key\);/g, "htmlContent += getSignatureHtml();");

// In the El Programi block, we need to add key. Let's find the second one.
// We can just use string splitting or regex.
const parts = code.split('htmlContent += getSignatureHtml();');
if (parts.length >= 3) {
    // The first one is in isGenel, we want that to be empty (or null).
    // The second one is in El Programı.
    code = parts[0] + 'htmlContent += getSignatureHtml();' + parts[1] + 'htmlContent += getSignatureHtml(key);' + parts.slice(2).join('htmlContent += getSignatureHtml();');
}

fs.writeFileSync('src/App.tsx', code);
console.log('fixed signature keys');
