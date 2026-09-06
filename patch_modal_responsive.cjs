const fs = require('fs');
let code = fs.readFileSync('src/components/ExportReportingModal.tsx', 'utf8');

let target1 = `<div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">{isInline ? "Mobil Önizleme ve Paylaşım" : "Çıktı, Raporlama ve Paylaşım"}</h2>
                <p className="text-xs text-slate-500 font-medium">{isInline ? "Sınıf ve öğretmen programlarını inceleyin." : "Programları yazdırın, dışa aktarın veya öğretmenlerle paylaşın."}</p>
              </div>
            </div>`;

let replacement1 = `<div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
            <div className="flex items-center gap-2.5 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner shrink-0">
                <Printer className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-bold text-slate-800 leading-tight">{isInline ? "Önizleme & Paylaşım" : "Çıktı, Raporlama ve Paylaşım"}</h2>
                <p className="text-[10px] md:text-xs text-slate-500 font-medium leading-tight mt-0.5">{isInline ? "Programları inceleyin ve hızlıca paylaşın." : "Programları yazdırın, dışa aktarın veya paylaşın."}</p>
              </div>
            </div>`;

code = code.replace(target1, replacement1);

let target2 = `<div className="w-full md:w-72 shrink-0 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/30 flex flex-col p-4 gap-4 md:gap-6 overflow-y-auto print:hidden max-h-[40vh] md:max-h-none">`;
let replacement2 = `<div className="w-full md:w-72 shrink-0 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50 flex flex-col p-3 md:p-4 gap-3 md:gap-6 overflow-y-auto print:hidden max-h-[35vh] md:max-h-none shadow-inner md:shadow-none">`;

code = code.replace(target2, replacement2);

fs.writeFileSync('src/components/ExportReportingModal.tsx', code);
console.log("Success patch");
