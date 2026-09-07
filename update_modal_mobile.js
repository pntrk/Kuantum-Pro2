import fs from 'fs';

let content = fs.readFileSync('src/components/ExportReportingModal.tsx', 'utf8');

// 1. Hide export buttons on mobile (line 1122)
content = content.replace(
  /<div className="flex items-center gap-1\.5 overflow-x-auto hide-scrollbar w-full sm:w-auto pt-1 sm:pt-0">/,
  `<div className="hidden sm:flex items-center gap-1.5 overflow-x-auto hide-scrollbar w-full sm:w-auto pt-1 sm:pt-0">`
);

// 2. Helper for short day name
const shortDayHelper = `const getShortDayName = (fullName: string) => {
  if (!fullName) return '';
  if (fullName.startsWith('Pazartesi')) return 'Pzt';
  if (fullName.startsWith('Salı')) return 'Sal';
  if (fullName.startsWith('Çarşamba')) return 'Çrş';
  if (fullName.startsWith('Perşembe')) return 'Prş';
  if (fullName.startsWith('Cuma')) return 'Cum';
  return fullName.slice(0, 3);
};`;

if (!content.includes('getShortDayName')) {
  content = content.replace(
    /const \[selectedDayIndex, setSelectedDayIndex\] = useState<number>\(0\);/,
    `const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

    ${shortDayHelper}`
  );
}

// 3. Replace Çarşaf Liste Day Selector
const oldSchoolDaySelector = `<div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar touch-pan-x">
                        {activeDays.map((day: any, idx: number) => {
                          const dIdx = day.id - 1;
                          let dayLessonsCount = 0;
                          teachers.forEach((t) => {
                            for (let p = 0; p < day.periods; p++) {
                              if (schedules[t]?.[dIdx]?.[p]) dayLessonsCount++;
                            }
                          });

                          const isSelected = selectedDayIndex === idx;

                          return (
                            <button
                              key={day.id}
                              type="button"
                              onClick={() => setSelectedDayIndex(idx)}
                              className={\`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer \${
                                isSelected
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-400/30'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                              }\`}
                            >
                              <Calendar className={\`w-3.5 h-3.5 \${isSelected ? 'text-white' : 'text-indigo-600'}\`} />
                              <span>{day.name}</span>
                              <span className={\`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold \${
                                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }\`}>
                                {dayLessonsCount} Ders
                              </span>
                            </button>
                          );
                        })}
                      </div>`;

const newSchoolDaySelector = `<div 
                        className="grid gap-1 sm:gap-2 w-full" 
                        style={{ gridTemplateColumns: \`repeat(\${activeDays.length}, minmax(0, 1fr))\` }}
                      >
                        {activeDays.map((day: any, idx: number) => {
                          const dIdx = day.id - 1;
                          let dayLessonsCount = 0;
                          teachers.forEach((t) => {
                            for (let p = 0; p < day.periods; p++) {
                              if (schedules[t]?.[dIdx]?.[p]) dayLessonsCount++;
                            }
                          });

                          const isSelected = selectedDayIndex === idx;

                          return (
                            <button
                              key={day.id}
                              type="button"
                              onClick={() => setSelectedDayIndex(idx)}
                              className={\`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all cursor-pointer active:scale-95 touch-manipulation \${
                                isSelected
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-400/30'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                              }\`}
                            >
                              <span className="font-black text-[11px] sm:text-xs tracking-tight leading-tight">
                                <span className="sm:hidden">{getShortDayName(day.name)}</span>
                                <span className="hidden sm:inline">{day.name}</span>
                              </span>
                              <span className={\`text-[9.5px] font-black mt-1 px-1.5 py-0.5 rounded-full leading-none \${
                                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-indigo-700 border border-slate-200'
                              }\`}>
                                {dayLessonsCount} D
                              </span>
                            </button>
                          );
                        })}
                      </div>`;

content = content.replace(oldSchoolDaySelector, newSchoolDaySelector);

// 4. Replace Teacher / Class Day Selector
const oldTeacherDaySelector = `<div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar touch-pan-x">
                        {activeDays.map((day: any, idx: number) => {
                          const dIdx = day.id - 1;
                          let daySlotsCount = 0;
                          for (let p = 0; p < day.periods; p++) {
                            const val = exportType === 'teacher'
                              ? schedules[selectedEntity]?.[dIdx]?.[p]
                              : classSchedules[selectedEntity]?.[dIdx]?.[p];
                            if (val) daySlotsCount++;
                          }

                          const isSelected = selectedDayIndex === idx;

                          return (
                            <button
                              key={day.id}
                              type="button"
                              onClick={() => setSelectedDayIndex(idx)}
                              className={\`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer \${
                                isSelected
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-400/30'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                              }\`}
                            >
                              <Calendar className={\`w-3.5 h-3.5 \${isSelected ? 'text-white' : 'text-indigo-600'}\`} />
                              <span>{day.name}</span>
                              <span className={\`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold \${
                                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }\`}>
                                {daySlotsCount} Ders
                              </span>
                            </button>
                          );
                        })}
                      </div>`;

const newTeacherDaySelector = `<div 
                        className="grid gap-1 sm:gap-2 w-full" 
                        style={{ gridTemplateColumns: \`repeat(\${activeDays.length}, minmax(0, 1fr))\` }}
                      >
                        {activeDays.map((day: any, idx: number) => {
                          const dIdx = day.id - 1;
                          let daySlotsCount = 0;
                          for (let p = 0; p < day.periods; p++) {
                            const val = exportType === 'teacher'
                              ? schedules[selectedEntity]?.[dIdx]?.[p]
                              : classSchedules[selectedEntity]?.[dIdx]?.[p];
                            if (val) daySlotsCount++;
                          }

                          const isSelected = selectedDayIndex === idx;

                          return (
                            <button
                              key={day.id}
                              type="button"
                              onClick={() => setSelectedDayIndex(idx)}
                              className={\`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all cursor-pointer active:scale-95 touch-manipulation \${
                                isSelected
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-400/30'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                              }\`}
                            >
                              <span className="font-black text-[11px] sm:text-xs tracking-tight leading-tight">
                                <span className="sm:hidden">{getShortDayName(day.name)}</span>
                                <span className="hidden sm:inline">{day.name}</span>
                              </span>
                              <span className={\`text-[9.5px] font-black mt-1 px-1.5 py-0.5 rounded-full leading-none \${
                                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-indigo-700 border border-slate-200'
                              }\`}>
                                {daySlotsCount} Ders
                              </span>
                            </button>
                          );
                        })}
                      </div>`;

content = content.replace(oldTeacherDaySelector, newTeacherDaySelector);

fs.writeFileSync('src/components/ExportReportingModal.tsx', content);
console.log('Mobile optimizations applied successfully.');
