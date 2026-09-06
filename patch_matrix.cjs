const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `      <div className="flex-1 overflow-hidden p-2 md:p-4 pb-4">
        {mainTab === 'matrix' ? (
          <div className="h-full flex flex-col md:flex-row gap-4">
             <div className="w-full md:w-80 shrink-0 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[50vh] md:h-full">`;

const replacement = `      <div className="flex-1 overflow-hidden p-2 md:p-4 pb-4">
        {mainTab === 'matrix' ? (
          <div className="h-full flex flex-col md:flex-row gap-4">
             {/* Mobile-only Previewer */}
             <div className="md:hidden flex-1 h-full w-full">
                <ExportReportingModal
                   isOpen={true}
                   isInline={true}
                   onClose={() => {}}
                   schedules={schedules}
                   classSchedules={classSchedules}
                   teachers={teachers}
                   classes={classes}
                   schoolInfo={schoolInfo}
                   schoolSettings={schoolSettings}
                />
             </div>
             
             <div className="hidden md:flex w-full md:w-80 shrink-0 bg-white rounded-xl shadow-sm border border-slate-200 flex-col h-[50vh] md:h-full">`;

code = code.replace(targetStr, replacement);

const targetStr2 = `             <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden relative">
                {/* Main Table Tools */}`;

const replacement2 = `             <div className="hidden md:flex flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex-col overflow-hidden relative">
                {/* Main Table Tools */}`;

code = code.replace(targetStr2, replacement2);

fs.writeFileSync('src/App.tsx', code);
console.log("Success patch app");
