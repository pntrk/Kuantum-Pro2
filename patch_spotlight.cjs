const fs = require('fs');
let code = fs.readFileSync('src/components/SpotlightPaletteModal.tsx', 'utf8');

const target = `  return (
    <div 
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[320] flex items-start justify-center pt-16 md:pt-24 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh] animate-scaleUp"`;

const rep = `  return (
    <div 
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[320] flex items-start justify-center pt-0 md:pt-24 p-0 md:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-none md:rounded-2xl shadow-2xl border border-slate-200/80 w-full h-full md:h-auto max-w-2xl overflow-hidden flex flex-col max-h-screen md:max-h-[80vh] animate-scaleUp"`;

code = code.replace(target, rep);
fs.writeFileSync('src/components/SpotlightPaletteModal.tsx', code);
console.log("Spotlight patched");
