const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `
                                 <ul className="space-y-2 list-disc pl-5 marker:text-red-400">
                                     <li><strong>Öğretmen Durumu:</strong> Haftalık {report.totalChecked} saatin <b>{report.teacherBusy} saatinde derste</b>, <b>{report.teacherClosed} saatinde kısıtlamalar nedeniyle kapalı</b>.</li>
                                     <li><strong>Sınıf Durumu:</strong> Haftalık {report.totalChecked} saatin <b>{report.classBusy} saatinde başka dersi var</b>, <b>{report.classClosed} saatinde kısıtlamalar nedeniyle kapalı</b>.</li>
                                     {isLengthIssue && report.availableSlots > 0 && ( <li className="text-amber-700"><strong>Blok Çakışması:</strong> Ortak boş saatler var ancak {report.card.hours} saatlik <b>yan yana (blok) boşluk bulunamadı</b>.</li> )}
                                     {report.availableSlots === 0 && ( <li className="text-red-600"><strong>Ortak Boşluk Yok:</strong> Sınıfın ve Öğretmenin aynı anda boş/açık olduğu <b>hiçbir saat dilimi bulunmuyor</b>.</li> )}
                                 </ul>
                                 <div className="mt-4 p-2 bg-blue-50 border border-blue-100 rounded text-xs text-blue-800">
                                     💡 <strong>Çözüm Önerisi:</strong> Kartı ({report.card.hours} saat) parçalara ayırmayı (Örn: 2+1) veya kilitli dersleri havuza alıp tekrar dağıtmayı deneyebilirsiniz.
                                 </div>
`;

const replaceStr = `
                                 <ul className="space-y-2 list-disc pl-5 marker:text-red-400">
                                     {report.availableSlots === 0 ? (
                                         <li className="text-red-600"><strong>Çakışma:</strong> Öğretmen ve Sınıfın ortak boş saati yok.</li>
                                     ) : isLengthIssue ? (
                                         <li className="text-amber-700"><strong>Blok Hatası:</strong> {report.card.hours} saatlik yan yana (blok) boşluk bulunamadı.</li>
                                     ) : (
                                         <li className="text-slate-700"><strong>Kısıtlamalar:</strong> Ortak boş saatler var ancak kısıtlamalar nedeniyle ders yerleşemiyor.</li>
                                     )}
                                 </ul>
                                 <div className="mt-3 p-2 bg-slate-50 border border-slate-100 rounded text-xs text-slate-500">
                                     💡 <strong>Öneri:</strong> Kartı parçalara ayırın (Örn: 2+1) veya kısıtlamaları esnetin.
                                 </div>
`;

code = code.replace(targetStr.trim(), replaceStr.trim());
fs.writeFileSync('src/App.tsx', code);
console.log('patched conflict ui');
