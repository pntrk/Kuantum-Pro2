const fs = require('fs');
let code = fs.readFileSync('src/components/DutyManager.tsx', 'utf8');

const targetStart = `<div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar p-0 md:p-4">`;
const replacementStart = `<div className="hidden md:block flex-1 overflow-x-auto overflow-y-auto custom-scrollbar p-0 md:p-4">`;

if (code.includes(targetStart)) {
  code = code.replace(targetStart, replacementStart);
} else {
  console.log("Could not find start target");
}

const targetEnd = `                  </tbody>
                </table>
              </div>`;

const replacementEnd = `                  </tbody>
                </table>
              </div>

              {/* Mobile Roster View */}
              <div className="md:flex hidden flex-col flex-1 overflow-hidden" style={{ display: 'none' /* Will be overridden by md:hidden flex below */ }}></div>
              <div className="md:hidden flex flex-col flex-1 overflow-hidden">
                {/* Day Selector Pill Buttons */}
                <div className="flex gap-2 overflow-x-auto p-4 bg-slate-50 border-b border-slate-200 hide-scrollbar shrink-0">
                  {activeDays.map((day) => {
                     return (
                        <button
                          key={day.id}
                          onPointerDown={(e) => { e.preventDefault(); setMobileRosterDayId(day.id); }}
                          className={\`px-4 py-2 rounded-full font-bold text-xs shrink-0 transition-colors shadow-sm \${mobileRosterDayId === day.id ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 active:bg-slate-100'}\`}
                        >
                          {day.name}
                        </button>
                     );
                  })}
                </div>

                {/* Duty Location Cards */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
                  {/* Admin Card */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-amber-600" />
                        <h4 className="font-black text-amber-900 text-sm">NÖBETÇİ İDARECİ</h4>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {adminSchedule[mobileRosterDayId] ? (
                          <span className="bg-amber-100 text-amber-800 font-bold text-sm px-3 py-1.5 rounded-full border border-amber-200">
                            {adminSchedule[mobileRosterDayId]}
                          </span>
                      ) : (
                          <span className="bg-rose-50 text-rose-500 font-bold text-xs px-3 py-1.5 rounded-full border border-dashed border-rose-300">
                            Atanmadı
                          </span>
                      )}
                    </div>
                  </div>

                  {/* Location Cards */}
                  {dutyLocations.map(loc => {
                    const dIdx = activeDays.findIndex(d => d.id === mobileRosterDayId);
                    const key = \`\${loc}_\${mobileRosterDayId}\`;
                    const assigned = dutyAssignments[key] || [];

                    return (
                      <div 
                        key={loc}
                        onPointerDown={(e) => { e.preventDefault(); setSelectingCell({ loc, dayId: mobileRosterDayId, dIdx }); }}
                        className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-indigo-400" />
                            {loc}
                          </h4>
                          <span className="text-[10px] font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-1 rounded">
                            {assigned.length} Görevli
                          </span>
                        </div>
                        
                        {assigned.length === 0 ? (
                          <div className="flex items-center justify-center p-3 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-slate-400 text-xs font-semibold">
                            <Plus className="w-4 h-4 mr-1" /> Öğretmen Seç
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {assigned.map(t => {
                              const status = teacherStatuses[\`\${selectedCoverDate}_\${t}\`] || teacherStatuses[t] || 'aktif';
                              const isNotActive = status !== 'aktif';
                              let ringClass = 'bg-indigo-100 text-indigo-800 border-indigo-200';
                              
                              if (isNotActive) {
                                if (status === 'görevli') ringClass = 'bg-blue-100 text-blue-800 border-blue-300';
                                else if (status === 'raporlu') ringClass = 'bg-amber-100 text-amber-800 border-amber-300';
                                else if (status === 'izinli') ringClass = 'bg-purple-100 text-purple-800 border-purple-300';
                                else if (status === 'mazeretsiz') ringClass = 'bg-rose-100 text-rose-800 border-rose-300';
                              }
                              
                              return (
                                <span key={t} className={\`font-bold text-xs px-2.5 py-1.5 rounded-md border \${ringClass}\`}>
                                  {t}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>`;

if (code.includes(targetEnd)) {
  code = code.replace(targetEnd, replacementEnd);
} else {
  console.log("Could not find end target");
}

fs.writeFileSync('src/components/DutyManager.tsx', code);
console.log("Success patch mobile roster");
