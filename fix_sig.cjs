const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');
// Fix line 802
code = code.replace("htmlContent += getSignatureHtml(key);", "htmlContent += getSignatureHtml();");
// Fix line 838
code = code.replace("htmlContent += getSignatureHtml();", "htmlContent += getSignatureHtml(key);");

fs.writeFileSync('src/App.tsx', code);
console.log('fixed signatures');
