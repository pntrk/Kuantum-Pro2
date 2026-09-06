const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const match = code.match(/const handleCreatePoolCard = \(\) => \{[\s\S]*?showToast\(poolForm.editingId \? "Kart güncellendi!" : "Kartlar havuza eklendi!"\);\n  \};/);
if (match) {
    console.log("Found handleCreatePoolCard");
}
