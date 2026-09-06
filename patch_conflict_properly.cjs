const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const analyzeConflicts = `  const analyzeConflicts = () => {
     if (unplacedCourses.length === 0) return showToast("Havuza ait analiz edilecek bekleyen kart yok.", "warning");
     const reportList = getConflictReport();
     if (reportList.length > 0) {
         setConflictReport(reportList);
         showToast("Analiz tamamlandı. Çözülemeyen " + reportList.length + " kart tespit edildi.", "warning");
     } else {
         setConflictReport([]);
         showToast("Havuzdaki tüm derslerin yerleşimi için yeterli alan var.", "success");
     }
  };`;

const newAnalyzeConflicts = `  const analyzeConflicts = () => {
     if (unplacedCourses.length === 0) return showToast("Havuza ait analiz edilecek bekleyen kart yok.", "warning");
     const reportList = getConflictReport();
     // Set report even if empty so modal opens
     setConflictReport(reportList);
  };`;

code = code.replace(analyzeConflicts, newAnalyzeConflicts);

const button = `<button onClick={analyzeConflicts} className="w-full bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors">
                           <Activity className="w-4 h-4 text-blue-500"/> Çakışma Analizi
                        </button>`;

const newButton = `<button onClick={analyzeConflicts} className="w-full bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                           <Activity className="w-4 h-4 text-indigo-500"/> Ön Analiz (Dağıtıma Hazır Mı?)
                        </button>`;

code = code.replace(button, newButton);


const startIndex = code.indexOf('const renderConflictModal = () => {');
const endIndex = code.indexOf('  const renderMatrix = () => {');
const oldModal = code.substring(startIndex, endIndex);

const newModal = `const renderConflictModal = () => {
      if (!conflictReport) return null;
      const hasConflicts = conflictReport.length > 0;
      
      return (
        <div className="fixed inset-0 bg-slate-900/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full flex flex-col max-h-[90vh] overflow-hidden">
               <div className={\`p-4 border-b flex justify-between items-center \${hasConflicts ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}\`}>
                 <h3 className={\`font-bold text-lg flex items-center gap-2 \${hasConflicts ? 'text-red-800' : 'text-emerald-800'}\`}>
                   {hasConflicts ? (
                       <><AlertTriangle className="w-5 h-5 text-red-600" /> Dağıtım Yapılamaz: Çakışmalar Var</>
                   ) : (
                       <><CheckCircle2 className="w-5 h-5 text-emerald-600" /> Dağıtıma Hazır</>
                   )}
                 </h3>
                 <button onClick={() => setConflictReport(null)} className={\`p-1 transition-colors \${hasConflicts ? 'text-red-400 hover:text-red-800' : 'text-emerald-400 hover:text-emerald-800'}\`}><X className="w-5 h-5"/></button>
               </div>
               <div className="p-6 overflow-auto flex-1 bg-slate-50 custom-scrollbar">
                  {!hasConflicts ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                          </div>
                          <h2 className="text-2xl font-black text-slate-800 mb-2">Tüm Şartlar Uygun!</h2>
                          <p className="text-slate-600 max-w-md">Kısıtlamalar ve öğretmen/sınıf eşleşmeleri tarandı. Havuzdaki tüm derslerin yerleşebileceği boşluklar mevcut. Kuantum motorunu başlatabilirsiniz.</p>
                          <button onClick={() => { setConflictReport(null); autoDistributePro(); }} className="mt-8 px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-black rounded-xl shadow-lg transition-all flex items-center gap-2 transform hover:scale-105">
                              <Wand2 className="w-5 h-5"/> AI Kuantum Motoruyla Dağıt
                          </button>
                      </div>
                  ) : (
                      <>
                          <p className="text-sm text-slate-600 mb-6 font-semibold bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-start gap-3">
                              <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                              <span>Aşağıdaki dersler için kısıtlamalar nedeniyle yerleşim <strong>imkansız</strong> görünmektedir. Lütfen dağıtımdan önce bu koşulları esnetin veya kartları parçalayın. Aksi halde bu dersler havuzda kalacaktır.</span>
                          </p>
                          {conflictReport.map((report, idx) => {
                              const cClass = getColorForSubject(report.card.subject);
                              const isLengthIssue = report.maxConsecutiveSlot < report.card.hours;
                              return (
                                 <div key={report.card.id + idx} className={\`mb-4 border-l-4 rounded-r-lg bg-white shadow-sm overflow-hidden \${cClass.split(' ')[0]} border-slate-200\`}>
                                     <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                                         <h4 className="font-bold text-slate-800 flex items-center justify-between">
                                             <span>{idx+1}. {report.card.teachers.join(', ')} ➔ {report.card.classes.join(', ')}</span>
                                             <span className="text-sm text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">{report.card.subject} ({report.card.hours} Saat)</span>
                                         </h4>
                                     </div>
                                     <div className="p-4 text-sm text-slate-700">
                                         <ul className="space-y-2 list-disc pl-5 marker:text-red-400">
                                             {report.reason ? (
                                                 <li className="text-red-600 font-bold">{report.reason}</li>
                                             ) : report.availableSlots === 0 ? (
                                                 <li className="text-red-600"><strong>Çakışma:</strong> Öğretmen ve Sınıfın kısıtlamalardan sonra ortak boş saati hiç kalmamış.</li>
                                             ) : isLengthIssue ? (
                                                 <li className="text-amber-700"><strong>Blok Hatası:</strong> {report.card.hours} saatlik yan yana (blok) boşluk bulunamadı.</li>
                                             ) : (
                                                 <li className="text-slate-700"><strong>Kısıtlamalar:</strong> Ortak boş saatler var ancak kısıtlamalar nedeniyle ders yerleşemiyor.</li>
                                             )}
                                         </ul>
                                         <div className="mt-3 p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-600 flex items-start gap-2">
                                             <span className="text-amber-500">💡</span> <strong>Öneri:</strong> Bu kartı daha küçük parçalara (Örn: 2+1) ayırmayı deneyin veya öğretmenin kısıtlamalarını esnetin.
                                         </div>
                                     </div>
                                 </div>
                              );
                          })}
                      </>
                  )}
               </div>
           </div>
        </div>
      );
  };
`;

code = code.replace(oldModal, newModal);
fs.writeFileSync('src/App.tsx', code);
console.log('patched conflict analyzer properly');
