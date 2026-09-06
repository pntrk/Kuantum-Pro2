const fs = require('fs');
let code = fs.readFileSync('src/components/ExportReportingModal.tsx', 'utf8');

code = code.replace(
  '<h2 className="text-lg font-bold text-slate-800">Çıktı, Raporlama ve Paylaşım</h2>',
  '<h2 className="text-lg font-bold text-slate-800">{isInline ? "Mobil Önizleme ve Paylaşım" : "Çıktı, Raporlama ve Paylaşım"}</h2>'
);

code = code.replace(
  '<p className="text-xs text-slate-500 font-medium">Programları yazdırın, dışa aktarın veya öğretmenlerle paylaşın.</p>',
  '<p className="text-xs text-slate-500 font-medium">{isInline ? "Sınıf ve öğretmen programlarını inceleyin." : "Programları yazdırın, dışa aktarın veya öğretmenlerle paylaşın."}</p>'
);

fs.writeFileSync('src/components/ExportReportingModal.tsx', code);
console.log("Success patch title");
