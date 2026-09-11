const fs = require('fs');
let code = fs.readFileSync('src/components/ExportReportingModal.tsx', 'utf-8');

// 1. Unhide the Card View
code = code.replace(
  /\{\/\* 1\. MOBILE CARD VIEW FOR TEACHER \/ CLASS \(HIDDEN\) \*\/\}\s*<div className="hidden space-y-4 print:hidden">/g,
  '{/* 1. MOBILE CARD VIEW FOR TEACHER / CLASS */}\n                  <div className="space-y-4 block lg:hidden print:hidden">'
);

// 2. Hide Matrix on Mobile again
// Find the matrix container: `<div className="w-full border border-slate-300 rounded-lg shadow-2xs print:border-none print:shadow-none block print:block overflow-hidden">`
code = code.replace(
  /<div\s+className="w-full border border-slate-300 rounded-lg shadow-2xs print:border-none print:shadow-none block print:block overflow-hidden"\s*>/g,
  '<div className="w-full border border-slate-300 rounded-lg shadow-2xs print:border-none print:shadow-none hidden lg:block print:block overflow-hidden">'
);

// 3. Remove the Day Selector and map over all days
// We need to replace the Day Selector block and the IIFE rendering with a simple `activeDays.map` block.
/*
The current code looks like:
                      {/* Day Selector Side-by-Side Horizontal Bar * /}
                      <div className="bg-slate-50 p-1.5 sm:p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                        ...
                      </div>
                      {/* Selected Day Timetable Card & Table * /}
                      {(() => {
                        const currentDay = ...
                        ...
                      })()}
*/

// Let's use a regex to capture from `Day Selector Side-by-Side Horizontal Bar` down to the end of the IIFE `})()}`
const cardSearchRegex = /\{\/\* Day Selector Side-by-Side Horizontal Bar \*\/\}[\s\S]*?\}\)\(\)\}/m;

const cardReplaceCode = `{/* All Days Vertical List */}
                      <div className="space-y-6">
                        {activeDays.map((currentDay: any) => {
                          const dIdx = currentDay.id - 1;
                          const daySlots: any[] = [];
                          let activeCount = 0;
                          for (let p = 0; p < currentDay.periods; p++) {
                            const val =
                              exportType === "teacher"
                                ? schedules[selectedEntities[0]]?.[dIdx]?.[p]
                                : classSchedules[selectedEntities[0]]?.[dIdx]?.[p];
                            const parsed = val ? parseCellData(val) : null;
                            if (parsed) activeCount++;
                            daySlots.push({
                              period: p,
                              time: schoolSettings?.lessonTimes?.[p],
                              data: parsed,
                            });
                          }
                          return (
                            <div key={currentDay.id} className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
                              {/* Table Header Banner */}
                              <div className="bg-slate-900 text-white px-2 py-1.5 sm:px-3.5 sm:py-2.5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-indigo-400" />
                                  <span className="font-black text-xs sm:text-sm tracking-wide">
                                    {selectedEntities[0]} — {currentDay.name.toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                                  {activeCount} Ders
                                </span>
                              </div>
                              {/* Detailed Day Schedule Table */}
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                  <thead>
                                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-extrabold text-[9px] sm:text-[11px]">
                                      <th className="p-1 sm:p-2.5 text-center w-12 sm:w-24 leading-tight">
                                        Saat / Ders
                                      </th>
                                      <th className="p-1 sm:p-2.5 leading-tight">Ders Adı</th>
                                      <th className="p-1 sm:p-2.5 leading-tight">
                                        {exportType === "teacher"
                                          ? "Sınıf(lar)"
                                          : "Öğretmen(ler)"}
                                      </th>
                                      <th className="p-1 sm:p-2.5 text-center leading-tight">
                                        Derslik
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {daySlots.map(({ period, time, data }) => (
                                      <tr
                                        key={period}
                                        className={
                                          data
                                            ? "bg-indigo-50/25 hover:bg-indigo-50/40"
                                            : "bg-slate-50/20"
                                        }
                                      >
                                        {/* Period Number & Time */}
                                        <td className="p-1 sm:p-2 text-center align-middle font-bold">
                                          <div className="flex flex-col items-center">
                                            <span className="text-indigo-700 font-black text-[10px] sm:text-xs">
                                              {period + 1}. Ders
                                            </span>
                                            {time && (
                                              <span className="text-[8px] sm:text-[9.5px] text-slate-500 font-medium tracking-tighter">
                                                {time.start} - {time.end}
                                              </span>
                                            )}
                                          </div>
                                        </td>
                                        {/* Subject Name */}
                                        <td className="p-1 sm:p-2 align-middle font-bold text-slate-900">
                                          {data ? (
                                            <span className="text-[10px] sm:text-xs font-black text-indigo-950 leading-tight">
                                              {data.subject}
                                            </span>
                                          ) : (
                                            <span className="text-slate-400 font-normal italic text-[10px] sm:text-[11px]">
                                              Boş
                                            </span>
                                          )}
                                        </td>
                                        {/* Target Classes or Teachers */}
                                        <td className="p-1 sm:p-2 align-middle text-slate-800 font-bold text-[10px] sm:text-xs leading-tight">
                                          {data ? (
                                            <span>
                                              {exportType === "teacher"
                                                ? data.classes?.join(", ")
                                                : data.teachers?.join(", ")}
                                            </span>
                                          ) : (
                                            <span className="text-slate-300">
                                              -
                                            </span>
                                          )}
                                        </td>
                                        {/* Room */}
                                        <td className="p-1 sm:p-2 text-center align-middle">
                                          {data?.rooms &&
                                          data.rooms.length > 0 ? (
                                            <span className="inline-flex items-center gap-0.5 sm:gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-1 sm:px-2 py-0.5 rounded font-bold text-[8px] sm:text-[10px] leading-tight">
                                              <MapPin className="w-2.5 h-2.5" />
                                              {data.rooms.join(", ")}
                                            </span>
                                          ) : (
                                            <span className="text-slate-300 text-xs">
                                              -
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          );
                        })}
                      </div>`;

code = code.replace(cardSearchRegex, cardReplaceCode);

fs.writeFileSync('src/components/ExportReportingModal.tsx', code);
console.log("Card view replaced!");
