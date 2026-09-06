const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `      {confirmDialog && (
         <div className="fixed inset-0 bg-black/50 z-[250] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full">
               <h3 className="text-xl font-bold text-slate-800 mb-2">{confirmDialog.title}</h3>
               <p className="text-slate-600 mb-6">{confirmDialog.message}</p>
               <div className="flex justify-end gap-3">
                 <button onClick={() => setConfirmDialog(null)} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">İptal</button>
                 <button onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }} className="px-4 py-2 font-bold bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-sm transition-colors">Evet, Onaylıyorum</button>
               </div>
            </div>
         </div>
      )}`;

const replacement = `      {confirmDialog && (
         <div className="fixed inset-0 bg-black/50 z-[250] flex items-end md:items-center justify-center p-0 md:p-4 backdrop-blur-sm">
            <motion.div 
               initial={{ y: "100%" }}
               animate={{ y: 0 }}
               transition={{ type: "spring", damping: 25, stiffness: 200 }}
               className="bg-white p-6 rounded-t-2xl md:rounded-xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] md:shadow-2xl max-w-sm w-full relative"
            >
               {/* Drag Handle for Mobile */}
               <div className="w-full flex justify-center pb-4 md:hidden absolute top-3 left-0 right-0 touch-none" onClick={() => setConfirmDialog(null)}>
                   <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
               </div>
               <h3 className="text-xl font-bold text-slate-800 mb-2 md:mt-0 mt-3">{confirmDialog.title}</h3>
               <p className="text-slate-600 mb-6">{confirmDialog.message}</p>
               <div className="flex justify-end gap-3">
                 <button onClick={() => setConfirmDialog(null)} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">İptal</button>
                 <button onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }} className="px-4 py-2 font-bold bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-sm transition-colors">Evet, Onaylıyorum</button>
               </div>
            </motion.div>
         </div>
      )}`;

if(content.includes(target)) {
    fs.writeFileSync('src/App.tsx', content.replace(target, replacement));
    console.log("Success replacing confirmDialog");
} else {
    console.log("Failed replacing confirmDialog");
}
