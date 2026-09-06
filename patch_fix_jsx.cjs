const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `                                                           {!brushMode.active && (
                                                             {/* Universal Hover/Tap Overlay */}
                                                             <div className="absolute inset-0 bg-slate-900/15 backdrop-blur-[0.5px] opacity-0 group-hover/cell:opacity-100 transition-opacity rounded-[3px] flex items-center justify-center gap-1.5 pointer-events-none z-20" tabIndex={0}>`;

const replacement = `                                                           {!brushMode.active && (
                                                             <div className="absolute inset-0 bg-slate-900/15 backdrop-blur-[0.5px] opacity-0 group-hover/cell:opacity-100 transition-opacity rounded-[3px] flex items-center justify-center gap-1.5 pointer-events-none z-20" tabIndex={0}>
                                                                 {/* Universal Hover/Tap Overlay */}`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacement);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Success fix jsx");
} else {
  console.log("target string not found.");
}
