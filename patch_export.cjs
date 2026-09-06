const fs = require('fs');
let code = fs.readFileSync('src/components/ExportReportingModal.tsx', 'utf8');

code = code.replace(
  '  schoolSettings: any;\n}',
  '  schoolSettings: any;\n  isInline?: boolean;\n}'
);

code = code.replace(
  '  schoolSettings\n}: ExportReportingModalProps',
  '  schoolSettings,\n  isInline = false\n}: ExportReportingModalProps'
);

const oldWrapper = `  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col h-[90vh] overflow-hidden border border-slate-200"
        >`;

const newWrapper = `  if (!isOpen && !isInline) return null;

  const innerContent = (
        <div 
          className={isInline ? "bg-white rounded-xl shadow-sm w-full flex flex-col h-full overflow-hidden border border-slate-200" : "bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col h-[90vh] overflow-hidden border border-slate-200"}
        >`;

code = code.replace(oldWrapper, newWrapper);

const oldClose = `            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
              <X className="w-5 h-5" />
            </button>`;

const newClose = `            {!isInline && (
              <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X className="w-5 h-5" />
              </button>
            )}`;

code = code.replace(oldClose, newClose);

const oldFooter = `        </motion.div>
      </div>
    </AnimatePresence>
  );
}`;

const newFooter = `        </div>
  );

  if (isInline) {
    return innerContent;
  }

  return (
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
  );
}`;

code = code.replace(oldFooter, newFooter);

fs.writeFileSync('src/components/ExportReportingModal.tsx', code);
console.log("Success patch export modal");
