const fs = require('fs');
let code = fs.readFileSync('src/components/ConflictInspectorModal.tsx', 'utf8');

const target = `  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[280] flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[85vh] overflow-hidden border border-slate-200">
        
        {/* Header */}`;

const rep = `  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[280] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden border border-slate-200 relative">
        <div className="w-full flex justify-center pt-3 pb-2 sm:hidden shrink-0 touch-none bg-slate-900">
          <div className="w-12 h-1.5 bg-slate-600 rounded-full"></div>
        </div>
        {/* Header */}`;

code = code.replace(target, rep);

// Add pb-20 to scrollable area
const scrollTarget = `        <div className="p-4 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">`;
const scrollRep = `        <div className="p-4 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50 pb-24 sm:pb-4">`;

code = code.replace(scrollTarget, scrollRep);

fs.writeFileSync('src/components/ConflictInspectorModal.tsx', code);
console.log("Conflict patched");
