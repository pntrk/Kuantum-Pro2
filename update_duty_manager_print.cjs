const fs = require('fs');
let content = fs.readFileSync('src/components/DutyManager.tsx', 'utf8');

// We need to add printModal state
content = content.replace(
  /const \[selectingCell, setSelectingCell\] = useState<{loc: string, dayId: number, dIdx: number} \| null>\(null\);/g,
  `const [selectingCell, setSelectingCell] = useState<{loc: string, dayId: number, dIdx: number} | null>(null);
  
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printType, setPrintType] = useState('weekly');
  const [printMonth, setPrintMonth] = useState(new Date().getMonth());
  const [printYear, setPrintYear] = useState(new Date().getFullYear());

  const executePrint = (type, year, month) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Yeni sekme açılamadı! Lütfen açılır pencerelere izin verin.");
      return;
    }

    const dayNamesTR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

    let htmlContent = \`
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="utf-8">
        <title>Nöbet Listesi</title>
        <style>
          body { font-family: sans-serif; padding: 20px; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #000; padding: 6px; text-align: center; }
          th { background-color: #f1f5f9; font-weight: bold; }
          .header { text-align: center; margin-bottom: 20px; }
          h1 { font-size: 18px; margin: 0; }
          h2 { font-size: 14px; margin: 5px 0; color: #475569; }
          .weekend { background-color: #e2e8f0; font-weight: bold; color: #64748b; }
          @media print {
            @page { size: A4 landscape; margin: 10mm; }
            body { padding: 0; }
            .page-break { page-break-before: always; }
          }
        </style>
      </head>
      <body>
    \`;

    const renderMonth = (y, m) => {
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      const monthName = new Date(y, m, 1).toLocaleDateString('tr-TR', { month: 'long' });
      
      let html = \`<div class="header page-break">
        <h1>ATATÜRK ORTAOKULU</h1>
        <h2>\${monthName} \${y} Nöbet Çizelgesi</h2>
      </div>\`;

      html += \`<table><thead><tr><th>TARİH / GÜN</th>\`;
      dutyLocations.forEach(loc => {
        html += \`<th>\${loc}</th>\`;
      });
      html += \`</tr></thead><tbody>\`;

      for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(y, m, d);
        const jsDay = dateObj.getDay();
        const weekDayId = jsDay === 0 ? 7 : jsDay;
        const dayStr = String(d).padStart(2, '0') + '.' + String(m + 1).padStart(2, '0') + '.' + y;
        const dayName = dayNamesTR[jsDay];

        const isActive = activeDays.some(ad => ad.id === weekDayId);

        if (!isActive) {
          html += \`<tr class="weekend"><td>\${dayStr} \${dayName}</td><td colspan="\${dutyLocations.length}">TATİL</td></tr>\`;
        } else {
          html += \`<tr><td><strong>\${dayStr}</strong> \${dayName}</td>\`;
          dutyLocations.forEach(loc => {
             const key = \`\${loc}_\${weekDayId}\`;
             const assigned = dutyAssignments[key] || [];
             html += \`<td>\${assigned.join(', ')}</td>\`;
          });
          html += \`</tr>\`;
        }
      }
      html += \`</tbody></table>\`;
      return html;
    };

    if (type === 'weekly') {
      htmlContent += \`<div class="header">
        <h1>ATATÜRK ORTAOKULU</h1>
        <h2>Haftalık Nöbet Şablonu</h2>
      </div>\`;
      htmlContent += \`<table><thead><tr><th>Nöbet Yeri \\\\ Gün</th>\`;
      activeDays.forEach(day => {
        htmlContent += \`<th>\${day.name}</th>\`;
      });
      htmlContent += \`</tr></thead><tbody>\`;
      dutyLocations.forEach(loc => {
        htmlContent += \`<tr><td><strong>\${loc}</strong></td>\`;
        activeDays.forEach(day => {
           const key = \`\${loc}_\${day.id}\`;
           const assigned = dutyAssignments[key] || [];
           htmlContent += \`<td>\${assigned.join(', ')}</td>\`;
        });
        htmlContent += \`</tr>\`;
      });
      htmlContent += \`</tbody></table>\`;
    } else if (type === 'monthly') {
      htmlContent += renderMonth(year, month);
    } else if (type === 'yearly') {
      const yearMonths = [
        { y: year, m: 8 }, { y: year, m: 9 }, { y: year, m: 10 }, { y: year, m: 11 },
        { y: year + 1, m: 0 }, { y: year + 1, m: 1 }, { y: year + 1, m: 2 }, { y: year + 1, m: 3 },
        { y: year + 1, m: 4 }, { y: year + 1, m: 5 }
      ];
      yearMonths.forEach((ym, idx) => {
         htmlContent += renderMonth(ym.y, ym.m);
      });
    }

    htmlContent += \`
        <script>
          window.onload = function() {
            setTimeout(function() { window.focus(); window.print(); }, 500);
          };
        </script>
      </body>
      </html>
    \`;

    // Remove first page break if it exists
    htmlContent = htmlContent.replace('<div class="header page-break">', '<div class="header">');

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };`
);

content = content.replace(
  /<button onClick=\{\(\) => window\.print\(\)\} className="bg-slate-200 text-slate-700 hover:bg-slate-300 px-3 py-1\.5 rounded-lg font-bold text-xs flex items-center gap-1\.5 transition-colors">/g,
  `<button onClick={() => setPrintModalOpen(true)} className="bg-slate-200 text-slate-700 hover:bg-slate-300 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors">`
);

const printModalJSX = `
      {printModalOpen && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4" onClick={() => setPrintModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col" onClick={e => e.stopPropagation()}>
             <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                <div>
                   <h3 className="font-black text-slate-800">Çizelge Yazdır</h3>
                   <p className="text-sm font-medium text-slate-500">Yazdırma türünü seçin.</p>
                </div>
                <button onClick={() => setPrintModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
             </div>
             
             <div className="p-6 flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Çıktı Türü</label>
                  <select value={printType} onChange={(e) => setPrintType(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 outline-none focus:border-indigo-500">
                     <option value="weekly">Haftalık Şablon</option>
                     <option value="monthly">Aylık Çizelge</option>
                     <option value="yearly">Yıllık Çizelge</option>
                  </select>
                </div>

                {(printType === 'monthly' || printType === 'yearly') && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Eğitim Yılı (Başlangıç)</label>
                    <select value={printYear} onChange={(e) => setPrintYear(parseInt(e.target.value))} className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 outline-none focus:border-indigo-500">
                       <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
                       <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                       <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
                    </select>
                  </div>
                )}

                {printType === 'monthly' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ay</label>
                    <select value={printMonth} onChange={(e) => setPrintMonth(parseInt(e.target.value))} className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 outline-none focus:border-indigo-500">
                       <option value={8}>Eylül</option>
                       <option value={9}>Ekim</option>
                       <option value={10}>Kasım</option>
                       <option value={11}>Aralık</option>
                       <option value={0}>Ocak</option>
                       <option value={1}>Şubat</option>
                       <option value={2}>Mart</option>
                       <option value={3}>Nisan</option>
                       <option value={4}>Mayıs</option>
                       <option value={5}>Haziran</option>
                    </select>
                  </div>
                )}
             </div>
             
             <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
                <button onClick={() => setPrintModalOpen(false)} className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700 transition-colors">İptal</button>
                <button onClick={() => {
                   let y = printYear;
                   let m = printMonth;
                   if (printType === 'monthly' && printMonth < 7) y = printYear + 1;
                   executePrint(printType, y, m);
                   setPrintModalOpen(false);
                }} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2">
                   <Printer className="w-4 h-4"/> Önizle / Yazdır
                </button>
             </div>
          </div>
        </div>
      )}
`;

content = content.replace('    </div>\n  );\n}', printModalJSX + '\n    </div>\n  );\n}');
content = content.replace("import { MapPin, Plus, Trash2, Users, Calendar, ClipboardCheck, AlertCircle, CheckCircle2, Wand2, Save, Printer, AlertTriangle } from 'lucide-react';", "import { MapPin, Plus, Trash2, Users, Calendar, ClipboardCheck, AlertCircle, CheckCircle2, Wand2, Save, Printer, AlertTriangle, X } from 'lucide-react';");

fs.writeFileSync('src/components/DutyManager.tsx', content);
