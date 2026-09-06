const fs = require('fs');
let code = fs.readFileSync('src/components/ExportReportingModal.tsx', 'utf8');

const target1 = `  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-5xl"
        >
          {innerContent}
        </motion.div>
      </div>
    </AnimatePresence>
  );`;

const rep1 = `  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm md:p-4 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 50 }}
          className="w-full md:max-w-5xl"
        >
          {innerContent}
        </motion.div>
      </div>
    </AnimatePresence>
  );`;

code = code.replace(target1, rep1);

const target2 = `        <div 
          className={isInline ? "bg-white md:rounded-xl shadow-sm w-full flex flex-col h-full overflow-hidden border-t md:border border-slate-200" : "bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col h-[90vh] overflow-hidden border border-slate-200"}
        >`;

const rep2 = `        <div 
          className={isInline ? "bg-white md:rounded-xl shadow-sm w-full flex flex-col h-full overflow-hidden border-t md:border border-slate-200" : "bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full md:max-w-5xl flex flex-col h-[90vh] overflow-hidden border border-slate-200 relative"}
        >
          {/* Mobile Drag Handle */}
          {!isInline && (
             <div className="w-full flex justify-center pt-3 pb-2 md:hidden shrink-0 touch-none bg-slate-50">
               <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
             </div>
          )}`;

code = code.replace(target2, rep2);

fs.writeFileSync('src/components/ExportReportingModal.tsx', code);
console.log("Export patched");
