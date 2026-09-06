const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `    return (
      <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 select-none" onMouseUp={() => setPaintState({ isPainting: false, targetClosed: false })}>
        <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full flex flex-col max-h-[90vh] overflow-hidden">
           <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
             <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
               <Ban className="w-5 h-5 text-red-500" /> Detaylar ve Kısıtlamalar: <EditableText value={name} onSave={(newVal) => handleRename(type, name, newVal)} className="" textClassName="text-blue-700 hover:text-blue-800" />
             </h3>
             <button onClick={() => setConstraintModal(null)} className="p-1 text-slate-400 hover:text-slate-800 transition-colors"><X className="w-6 h-6"/></button>
           </div>`;

const replacement = `    return (
      <div className="fixed inset-0 bg-black/60 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 select-none" onMouseUp={() => setPaintState({ isPainting: false, targetClosed: false })}>
        <motion.div 
           initial={{ y: "100%" }}
           animate={{ y: 0 }}
           transition={{ type: "spring", damping: 25, stiffness: 200 }}
           className="bg-white rounded-t-2xl md:rounded-b-2xl md:rounded-xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] md:shadow-2xl max-w-5xl w-full flex flex-col max-h-[95vh] md:max-h-[90vh] overflow-hidden relative"
        >
           {/* Drag Handle for Mobile */}
           <div className="w-full flex justify-center pt-3 pb-2 md:hidden shrink-0 bg-slate-50 touch-none" onClick={() => setConstraintModal(null)}>
               <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
           </div>
           <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
             <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
               <Ban className="w-5 h-5 text-red-500" /> Detaylar ve Kısıtlamalar: <EditableText value={name} onSave={(newVal) => handleRename(type, name, newVal)} className="" textClassName="text-blue-700 hover:text-blue-800" />
             </h3>
             <button onClick={() => setConstraintModal(null)} className="p-1 text-slate-400 hover:text-slate-800 transition-colors hidden md:block"><X className="w-6 h-6"/></button>
           </div>`;

if(content.includes(target)) {
    fs.writeFileSync('src/App.tsx', content.replace(target, replacement));
    console.log("Success replacing renderConstraintModal start");
} else {
    console.log("Failed replacing renderConstraintModal start");
}
