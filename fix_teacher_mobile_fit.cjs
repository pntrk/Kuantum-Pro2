const fs = require('fs');
let code = fs.readFileSync('src/components/ExportReportingModal.tsx', 'utf-8');

// 1. Make the table text even smaller on mobile, remove x-scrolling
code = code.replace(
  /<table className="w-full text-\[9px\] md:text-\[10px\] lg:text-\[11px\] border-collapse table-fixed print-matrix-table break-words leading-tight">/,
  '<table className="w-full text-[6px] xs:text-[7px] sm:text-[9px] md:text-[10px] lg:text-[11px] border-collapse table-fixed print-matrix-table break-words leading-none sm:leading-tight">'
);

// 2. Remove overflow-x-auto to force fitting
code = code.replace(
  /className="overflow-x-auto custom-scrollbar border border-slate-300 rounded-lg shadow-2xs print:border-none print:shadow-none block print:block"/,
  'className="w-full border border-slate-300 rounded-lg shadow-2xs print:border-none print:shadow-none block print:block overflow-hidden"'
);

// 3. Adjust the Day column header width and padding
code = code.replace(
  /<th\s+style=\{\{ width: "13%" \}\}\s+className="sticky left-0 bg-slate-200 z-20 border-r-2 border-b-2 border-slate-400 p-2 font-black text-slate-900 text-center print:static"\s*>/,
  '<th\n                            style={{ width: "10%" }}\n                            className="sticky left-0 bg-slate-200 z-20 border-r border-b border-slate-400 p-0.5 sm:p-2 font-black text-slate-900 text-center print:static text-[7px] sm:text-[11px]"\n                          >'
);

// 4. Adjust the Period headers
code = code.replace(
  /style=\{\{ width: `\$\{87 \/ maxPeriods\}%` \}\}\s+className="border border-slate-300 bg-slate-100 p-1\.5 md:p-2 font-bold text-slate-700 text-center"/g,
  'style={{ width: `${90 / maxPeriods}%` }}\n                              className="border border-slate-300 bg-slate-100 p-0.5 sm:p-1.5 md:p-2 font-bold text-slate-700 text-center"'
);
code = code.replace(
  /<span className="font-black text-\[11px\] md:text-xs">/g,
  '<span className="font-black text-[7px] sm:text-[11px] md:text-xs leading-none">'
);
code = code.replace(
  /<div className="text-\[8\.5px\] md:text-\[9px\] font-normal text-slate-500 mt-0\.5 whitespace-nowrap">/g,
  '<div className="text-[5px] sm:text-[8.5px] md:text-[9px] font-normal text-slate-500 mt-0.5 whitespace-normal sm:whitespace-nowrap leading-none">'
);

// 5. Adjust the Day column cells
code = code.replace(
  /<td className="sticky left-0 bg-slate-100 z-10 border-r-2 border-slate-400 p-2 font-bold text-slate-800 text-center print:static">/g,
  '<td className="sticky left-0 bg-slate-100 z-10 border-r border-slate-400 p-0.5 sm:p-2 font-bold text-slate-800 text-center print:static text-[7px] sm:text-xs">'
);
// Make the Day text use short version on mobile if possible, but let's just let CSS handle it for now (or substring).
code = code.replace(
  /\{day\.name\}/g,
  '{typeof window !== "undefined" && window.innerWidth < 640 ? day.name.substring(0, 3) : day.name}'
);

// 6. Adjust the data cells
code = code.replace(
  /className="border border-slate-200 p-1 text-center h-16 md:h-20 print:h-\[22mm\] align-middle"/g,
  'className="border border-slate-200 p-0 sm:p-1 text-center h-12 sm:h-16 md:h-20 print:h-[22mm] align-middle"'
);
code = code.replace(
  /className="border border-slate-200 p-1 md:p-1\.5 text-center h-16 md:h-20 print:h-\[22mm\] align-middle bg-indigo-50\/30 overflow-hidden"/g,
  'className="border border-slate-200 p-0.5 sm:p-1 md:p-1.5 text-center h-12 sm:h-16 md:h-20 print:h-[22mm] align-middle bg-indigo-50/30 overflow-hidden"'
);

// We need to also tweak `getAdaptiveCellTypography` inside ExportReportingModal.tsx to return smaller text on mobile
// Let's modify the function if it's in the file.
let typographySearch = `  const getAdaptiveCellTypography = (`;
let typographyReplace = `  const getAdaptiveCellTypography = (
    subject: string,
    secondary: string,
    hasRoom: boolean,
  ) => {
    const totalLength = subject.length + secondary.length;
    let subjectStyle = "font-black text-indigo-950 text-[7px] sm:text-xs";
    let secondaryStyle = "font-bold text-slate-700 text-[6px] sm:text-[10px]";

    if (totalLength > 30 || hasRoom) {
      subjectStyle = "font-black text-indigo-950 text-[6px] sm:text-[10px] leading-tight";
      secondaryStyle = "font-bold text-slate-700 text-[5px] sm:text-[9px] leading-tight";
    }
    return { subjectStyle, secondaryStyle };
  };

  const old_getAdaptiveCellTypography = (`;
// Wait, replacing `getAdaptiveCellTypography` might break if it's already there. Let's just do a targeted regex for the return values or something.
// Actually, I can just modify the rendering directly inside the map where `subjectStyle` is used.
code = code.replace(
  /className=\{`\$\{subjectStyle\} break-words max-w-full`\}/g,
  'className={`font-black text-indigo-950 text-[6px] xs:text-[7px] sm:text-[10px] md:text-[11px] leading-none sm:leading-tight break-words max-w-full`}'
);
code = code.replace(
  /className=\{`\$\{secondaryStyle\} break-words max-w-full`\}/g,
  'className={`font-bold text-slate-700 text-[5px] xs:text-[6px] sm:text-[9px] md:text-[10px] leading-none sm:leading-tight mt-0.5 break-words max-w-full`}'
);

fs.writeFileSync('src/components/ExportReportingModal.tsx', code);
console.log("Teacher/Class mobile fit applied!");
