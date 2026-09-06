const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace standard success toast
const oldToast = 'showToast(`Kusursuz! Kuantum AI motoru tüm olasılıkları saniyeler içinde tarayıp ${bestResult.iter} iterasyonla 0 açıkta kart ile programı tamamladı.`, "success");';
const newToast = 'showToast(`Kusursuz! Yapay Zeka modeli milyarlarca olasılığı tarayıp ${bestResult.iter} iterasyonda 0 çatışma ile optimum programı oluşturdu.`, "success");';

code = code.replace(oldToast, newToast);

fs.writeFileSync('src/App.tsx', code);
console.log('patched UI 3');
