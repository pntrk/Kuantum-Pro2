import fs from 'fs';

let content = fs.readFileSync('src/components/ExportReportingModal.tsx', 'utf8');

// 1. Add selectedDayIndex state
content = content.replace(
  /const \[isCompactSchoolView, setIsCompactSchoolView\] = useState\(false\);/,
  `const [isCompactSchoolView, setIsCompactSchoolView] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);`
);

// 2. Enable mobile view mode switcher for all export types (teachers, classes, school)
content = content.replace(
  /\{\(exportType === 'teacher' \|\| exportType === 'class'\) && \(\s*<div className="flex items-center gap-1 ml-auto shrink-0">/,
  `<div className="flex items-center gap-1 ml-auto shrink-0">`
);
// Make sure the closing bracket matches
content = content.replace(
  /<\/div>\s*\)\}\s*<\/div>\s*\)\}\s*<\/div>\s*\{\/\* Main Content Area \*\/\}/,
  `</div>\n          </div>\n        )}\n      </div>\n\n      {/* Main Content Area */}`
);

// 3. Update VIEW A (School / Çarşaf Liste) and VIEW B (Teacher / Class) rendering logic
const oldSchoolViewStr = `{/* VIEW A: OKUL GENEL ÇARŞAF LİSTESİ */}
            {exportType === 'school' && (
              <div className="overflow-x-auto custom-scrollbar border border-slate-300 rounded-lg shadow-2xs print:border-none print:shadow-none">`;

const newSchoolAndTeacherViewStr = `{/* VIEW A: OKUL GENEL ÇARŞAF LİSTESİ */}
            {exportType === 'school' && (
              <>
                {/* 1. MOBILE CARD VIEW FOR ÇARŞAF LİSTE */}
                {mobileDisplayMode === 'card' && (
                  <div className="space-y-4 print:hidden">
                    {/* Day Selector Side-by-Side Horizontal Bar */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[11px] font-bold text-slate-500 mb-2 flex items-center justify-between">
                        <span>GÜN SEÇİNİZ:</span>
                        <span className="text-indigo-600 font-extrabold">{activeDays[selectedDayIndex]?.name || 'PAZARTESİ'} Seçili</span>
                      </div>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar touch-pan-x">
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
                      </div>
                    </div>

                    {/* Teacher Day Schedule Cards */}
                    {(() => {
                      const currentDay = activeDays[selectedDayIndex] || activeDays[0];
                      if (!currentDay) return null;
                      const dIdx = currentDay.id - 1;

                      return (
                        <div className="space-y-3">
                          <div className="bg-slate-900 text-white px-3.5 py-2.5 rounded-xl flex items-center justify-between shadow-xs">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-indigo-400" />
                              <span className="font-black text-xs sm:text-sm">
                                OKUL GENELİ — {currentDay.name.toUpperCase()} PROGRAMI
                              </span>
                            </div>
                            <span className="text-[10px] font-bold bg-indigo-500/30 text-indigo-200 px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                              {filteredTeachersForSchool.length} Öğretmen
                            </span>
                          </div>

                          {filteredTeachersForSchool.map((t) => {
                            const daySlots: any[] = [];
                            let activeCount = 0;
                            for (let p = 0; p < currentDay.periods; p++) {
                              const val = schedules[t]?.[dIdx]?.[p];
                              const parsed = val ? parseCellData(val) : null;
                              if (parsed) activeCount++;
                              daySlots.push({
                                period: p,
                                time: schoolSettings?.lessonTimes?.[p],
                                data: parsed
                              });
                            }

                            if (activeCount === 0 && schoolSearchQuery.trim() !== '') return null;

                            return (
                              <div key={t} className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
                                <div className="bg-slate-50 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
                                  <span className="font-extrabold text-xs text-indigo-950">{t}</span>
                                  <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-full border \${
                                    activeCount > 0 ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                                  }\`}>
                                    {activeCount > 0 ? \`\${activeCount} Ders\` : 'Dersi Yok'}
                                  </span>
                                </div>

                                {activeCount > 0 ? (
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs border-collapse">
                                      <thead>
                                        <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-extrabold text-[10.5px]">
                                          <th className="p-2 text-center w-20">Saat / Ders</th>
                                          <th className="p-2">Ders</th>
                                          <th className="p-2">Sınıf(lar)</th>
                                          <th className="p-2 text-center">Derslik</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {daySlots.map(({ period, time, data }) => (
                                          <tr key={period} className={data ? 'bg-indigo-50/20' : 'bg-slate-50/20'}>
                                            <td className="p-1.5 text-center align-middle font-bold">
                                              <span className="text-indigo-700 font-extrabold text-[11px]">{period + 1}. Ders</span>
                                              {time && <div className="text-[9px] text-slate-500 font-normal">{time.start}</div>}
                                            </td>
                                            <td className="p-1.5 align-middle">
                                              {data ? (
                                                <span className="font-black text-xs text-slate-900">{data.subject}</span>
                                              ) : (
                                                <span className="text-slate-300 italic text-[10px]">-</span>
                                              )}
                                            </td>
                                            <td className="p-1.5 align-middle font-bold text-slate-800 text-xs">
                                              {data?.classes?.join(', ') || '-'}
                                            </td>
                                            <td className="p-1.5 text-center align-middle text-[10px] text-amber-800 font-bold">
                                              {data?.rooms?.length > 0 ? data.rooms.join(', ') : '-'}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <div className="p-2.5 text-center text-slate-400 text-xs italic">
                                    {currentDay.name} günü ders bulunmuyor.
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 2. FULL MATRIX TABLE VIEW FOR ÇARŞAF LİSTE */}
                <div className={\`overflow-x-auto custom-scrollbar border border-slate-300 rounded-lg shadow-2xs print:border-none print:shadow-none \${
                  mobileDisplayMode === 'card' ? 'hidden print:block' : 'block'
                }\`}>`;

content = content.replace(oldSchoolViewStr, newSchoolAndTeacherViewStr);

// Close the fragment for VIEW A
content = content.replace(
  /<\/table>\s*<\/div>\s*\)\}\s*\{\/\* VIEW B: ÖĞRETMEN VEYA SINIF PROGRAMI \*\/\}/,
  `</table>
              </div>
              </>
            )}

            {/* VIEW B: ÖĞRETMEN VEYA SINIF PROGRAMI */}`
);

// Update VIEW B Mobile Card View
const oldTeacherCardView = `{/* 1. MOBILE CARD VIEW (Active when mobileDisplayMode === 'card' in UI, but hidden in print) */}
                {mobileDisplayMode === 'card' && (
                  <div className="space-y-3 print:hidden">
                    {activeDays.map((day: any) => {
                      const dIdx = day.id - 1;
                      const daySlots: any[] = [];
                      for (let p = 0; p < day.periods; p++) {
                        const val = exportType === 'teacher'
                          ? schedules[selectedEntity]?.[dIdx]?.[p]
                          : classSchedules[selectedEntity]?.[dIdx]?.[p];
                        daySlots.push({
                          period: p,
                          time: schoolSettings?.lessonTimes?.[p],
                          data: val ? parseCellData(val) : null
                        });
                      }

                      const activeSlotCount = daySlots.filter(s => s.data).length;

                      return (
                        <div key={day.id} className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                          {/* Day Header Banner */}
                          <div className="bg-slate-100/90 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                              <span className="font-black text-slate-900 text-xs sm:text-sm">{day.name}</span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200 shadow-2xs">
                              {activeSlotCount} Ders
                            </span>
                          </div>

                          {/* Day Lesson Rows */}
                          <div className="divide-y divide-slate-100">
                            {daySlots.map(({ period, time, data }) => (
                              <div 
                                key={period} 
                                className={\`flex items-center gap-2.5 p-2.5 transition-colors \${
                                  data ? 'bg-indigo-50/20 hover:bg-indigo-50/40' : 'bg-slate-50/30'
                                }\`}
                              >
                                {/* Period Number & Time Pill */}
                                <div className="w-14 shrink-0 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-lg py-1 px-1 shadow-2xs">
                                  <span className="font-black text-xs text-indigo-700">{period + 1}. Ders</span>
                                  {time && (
                                    <span className="text-[9px] font-semibold text-slate-500 mt-0.5">
                                      {time.start}
                                    </span>
                                  )}
                                </div>

                                {/* Lesson Info Content */}
                                <div className="flex-1 min-w-0">
                                  {data ? (
                                    <div>
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-extrabold text-xs text-slate-900">{data.subject}</span>
                                        {data.rooms && data.rooms.length > 0 && (
                                          <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300/80 px-1.5 py-0.2 rounded font-bold flex items-center gap-0.5">
                                            <MapPin className="w-2.5 h-2.5" />
                                            {data.rooms.join(', ')}
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-[11px] font-semibold text-slate-600 mt-0.5">
                                        {exportType === 'teacher' ? (
                                          <span>Sınıflar: <strong className="text-slate-800">{data.classes?.join(', ')}</strong></span>
                                        ) : (
                                          <span>Öğretmen: <strong className="text-slate-800">{data.teachers?.join(', ')}</strong></span>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-[11px] font-medium text-slate-400 italic">
                                      Boş Saat
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}`;

const newTeacherCardView = `{/* 1. MOBILE CARD VIEW FOR TEACHER / CLASS */}
                {mobileDisplayMode === 'card' && (
                  <div className="space-y-4 print:hidden">
                    {/* Day Selector Side-by-Side Horizontal Bar */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[11px] font-bold text-slate-500 mb-2 flex items-center justify-between">
                        <span>GÜN SEÇİNİZ:</span>
                        <span className="text-indigo-600 font-extrabold">{activeDays[selectedDayIndex]?.name || 'PAZARTESİ'} Seçili</span>
                      </div>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar touch-pan-x">
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
                      </div>
                    </div>

                    {/* Selected Day Timetable Card & Table */}
                    {(() => {
                      const currentDay = activeDays[selectedDayIndex] || activeDays[0];
                      if (!currentDay) return null;
                      const dIdx = currentDay.id - 1;

                      const daySlots: any[] = [];
                      let activeCount = 0;
                      for (let p = 0; p < currentDay.periods; p++) {
                        const val = exportType === 'teacher'
                          ? schedules[selectedEntity]?.[dIdx]?.[p]
                          : classSchedules[selectedEntity]?.[dIdx]?.[p];
                        const parsed = val ? parseCellData(val) : null;
                        if (parsed) activeCount++;
                        daySlots.push({
                          period: p,
                          time: schoolSettings?.lessonTimes?.[p],
                          data: parsed
                        });
                      }

                      return (
                        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
                          {/* Table Header Banner */}
                          <div className="bg-slate-900 text-white px-3.5 py-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-indigo-400" />
                              <span className="font-black text-xs sm:text-sm tracking-wide">
                                {selectedEntity} — {currentDay.name.toUpperCase()} PROGRAMI
                              </span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                              {activeCount} Ders Saati
                            </span>
                          </div>

                          {/* Detailed Day Schedule Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-extrabold text-[11px]">
                                  <th className="p-2.5 text-center w-24">Saat / Ders</th>
                                  <th className="p-2.5">Ders Adı</th>
                                  <th className="p-2.5">{exportType === 'teacher' ? 'Sınıf(lar)' : 'Öğretmen(ler)'}</th>
                                  <th className="p-2.5 text-center">Derslik</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {daySlots.map(({ period, time, data }) => (
                                  <tr 
                                    key={period} 
                                    className={data ? 'bg-indigo-50/25 hover:bg-indigo-50/40' : 'bg-slate-50/20'}
                                  >
                                    {/* Period Number & Time */}
                                    <td className="p-2 text-center align-middle font-bold">
                                      <div className="flex flex-col items-center">
                                        <span className="text-indigo-700 font-black text-xs">{period + 1}. Ders</span>
                                        {time && (
                                          <span className="text-[9.5px] text-slate-500 font-medium whitespace-nowrap">
                                            {time.start} - {time.end}
                                          </span>
                                        )}
                                      </div>
                                    </td>

                                    {/* Subject Name */}
                                    <td className="p-2 align-middle font-bold text-slate-900">
                                      {data ? (
                                        <span className="text-xs font-black text-indigo-950">{data.subject}</span>
                                      ) : (
                                        <span className="text-slate-400 font-normal italic text-[11px]">Boş Saat</span>
                                      )}
                                    </td>

                                    {/* Target Classes or Teachers */}
                                    <td className="p-2 align-middle text-slate-800 font-bold text-xs">
                                      {data ? (
                                        <span>
                                          {exportType === 'teacher' ? data.classes?.join(', ') : data.teachers?.join(', ')}
                                        </span>
                                      ) : (
                                        <span className="text-slate-300">-</span>
                                      )}
                                    </td>

                                    {/* Room */}
                                    <td className="p-2 text-center align-middle">
                                      {data?.rooms && data.rooms.length > 0 ? (
                                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold text-[10px]">
                                          <MapPin className="w-2.5 h-2.5" />
                                          {data.rooms.join(', ')}
                                        </span>
                                      ) : (
                                        <span className="text-slate-300 text-xs">-</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}`;

content = content.replace(oldTeacherCardView, newTeacherCardView);

fs.writeFileSync('src/components/ExportReportingModal.tsx', content);
console.log('Update complete');
