import React, { useState, useMemo } from 'react';
import { 
  X, 
  ArrowRightLeft, 
  User, 
  Users, 
  MapPin, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Clock, 
  AlertTriangle, 
  Calendar,
  Sliders,
  Maximize2,
  Info
} from 'lucide-react';
import { SchoolSettings, SchedulesMap, ConstraintsMap } from '../types/workerMessages';

const parseCellData = (valStr: string) => {
  if (!valStr || typeof valStr !== 'string') return null;
  try {
    const parsed = JSON.parse(valStr);
    return {
      id: parsed.id || '',
      teachers: Array.isArray(parsed.teachers) ? parsed.teachers : (parsed.teacher ? [parsed.teacher] : []),
      classes: Array.isArray(parsed.classes) ? parsed.classes : (parsed.cls ? [parsed.cls] : []),
      rooms: Array.isArray(parsed.rooms) ? parsed.rooms : [],
      subject: parsed.subject || '',
      span: parsed.span || 1
    };
  } catch (e) {
    const parts = valStr.split('::');
    const entity1 = parts[0] || '';
    const subj = parts[1] || '';
    return {
      id: '',
      teachers: [entity1], 
      classes: [entity1], 
      rooms: [],
      subject: subj,
      span: 1
    };
  }
};

export interface EntitySelection {
  type: 'teacher' | 'class' | 'room';
  name: string;
}

interface SplitCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEntityA?: EntitySelection | null;
  initialEntityB?: EntitySelection | null;
  teachers: string[];
  classes: string[];
  rooms: string[];
  schoolSettings: SchoolSettings;
  schedules: SchedulesMap;
  classSchedules: SchedulesMap;
  roomSchedules: SchedulesMap;
  constraints: ConstraintsMap;
  lockedCells: Record<string, boolean>;
  onOpenQuickCreate?: (teacher: string, cls: string) => void;
}

export const SplitCompareModal: React.FC<SplitCompareModalProps> = ({
  isOpen,
  onClose,
  initialEntityA,
  initialEntityB,
  teachers,
  classes,
  rooms,
  schoolSettings,
  schedules,
  classSchedules,
  roomSchedules,
  constraints,
  lockedCells,
  onOpenQuickCreate
}) => {
  const [entityA, setEntityA] = useState<EntitySelection>(
    initialEntityA || { type: 'teacher', name: teachers[0] || '' }
  );
  const [entityB, setEntityB] = useState<EntitySelection>(
    initialEntityB || { 
      type: 'teacher', 
      name: teachers[1] || (classes[0] ? classes[0] : teachers[0] || '') 
    }
  );

  const [viewMode, setViewMode] = useState<'unified' | 'side_by_side'>('unified');

  // Active days & max periods
  const activeDays = (schoolSettings.weekDays || []).filter(d => d.active);

  // Helper to fetch cell value
  const getCellValue = (entity: EntitySelection, dIdx: number, pIdx: number): string => {
    if (!entity.name) return '';
    if (entity.type === 'teacher') {
      return schedules[entity.name]?.[dIdx]?.[pIdx] || '';
    } else if (entity.type === 'class') {
      return classSchedules[entity.name]?.[dIdx]?.[pIdx] || '';
    } else if (entity.type === 'room') {
      return roomSchedules[entity.name]?.[dIdx]?.[pIdx] || '';
    }
    return '';
  };

  // Helper to check closed constraint
  const isCellClosed = (entity: EntitySelection, dIdx: number, pIdx: number): boolean => {
    if (!entity.name || !constraints) return false;
    const key = `${dIdx}-${pIdx}`;
    if (entity.type === 'teacher') {
      return (constraints.teachers?.[entity.name] || []).includes(key);
    } else if (entity.type === 'class') {
      return (constraints.classes?.[entity.name] || []).includes(key);
    } else if (entity.type === 'room') {
      return (constraints.rooms?.[entity.name] || []).includes(key);
    }
    return false;
  };

  // Swap Entity A and B
  const handleSwap = () => {
    const temp = { ...entityA };
    setEntityA({ ...entityB });
    setEntityB(temp);
  };

  // Metrics analysis across the week
  const comparisonStats = useMemo(() => {
    let mutualFreeHours = 0;
    let sharedLessonHours = 0;
    let clashHours = 0;
    let totalPossiblePeriods = 0;

    activeDays.forEach(day => {
      const dIdx = day.id - 1;
      for (let p = 0; p < day.periods; p++) {
        totalPossiblePeriods++;
        const cellA = getCellValue(entityA, dIdx, p);
        const cellB = getCellValue(entityB, dIdx, p);
        const closedA = isCellClosed(entityA, dIdx, p);
        const closedB = isCellClosed(entityB, dIdx, p);

        const isFreeA = !cellA && !closedA;
        const isFreeB = !cellB && !closedB;

        if (isFreeA && isFreeB) {
          mutualFreeHours++;
        }

        if (cellA && cellB) {
          const dataA = parseCellData(cellA);
          const dataB = parseCellData(cellB);
          
          // Check if it's the exact same shared lesson
          const isSameLesson = dataA && dataB && (
            (dataA.id && dataA.id === dataB.id) ||
            (dataA.teachers?.some(t => dataB.teachers?.includes(t)) && 
             dataA.classes?.some(c => dataB.classes?.includes(c)))
          );

          if (isSameLesson) {
            sharedLessonHours++;
          } else {
            clashHours++;
          }
        }
      }
    });

    return {
      mutualFreeHours,
      sharedLessonHours,
      clashHours,
      totalPossiblePeriods
    };
  }, [entityA, entityB, schedules, classSchedules, roomSchedules, constraints, activeDays]);

  if (!isOpen) return null;

  const renderEntitySelector = (
    entity: EntitySelection,
    setEntity: React.Dispatch<React.SetStateAction<EntitySelection>>,
    label: string,
    badgeColor: string
  ) => {
    const items = entity.type === 'teacher' ? teachers : entity.type === 'class' ? classes : rooms;

    return (
      <div className="flex-1 bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeColor}`}>
            {label}
          </span>
          <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-bold">
            <button
              onClick={() => {
                setEntity({ type: 'teacher', name: teachers[0] || '' });
              }}
              className={`px-2 py-1 rounded-md transition-colors ${
                entity.type === 'teacher' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Öğretmen
            </button>
            <button
              onClick={() => {
                setEntity({ type: 'class', name: classes[0] || '' });
              }}
              className={`px-2 py-1 rounded-md transition-colors ${
                entity.type === 'class' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sınıf
            </button>
            <button
              onClick={() => {
                setEntity({ type: 'room', name: rooms[0] || '' });
              }}
              className={`px-2 py-1 rounded-md transition-colors ${
                entity.type === 'room' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Derslik
            </button>
          </div>
        </div>

        <select
          value={entity.name}
          onChange={(e) => setEntity(prev => ({ ...prev, name: e.target.value }))}
          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-extrabold text-slate-800 outline-none focus:border-indigo-600 focus:bg-white transition-all cursor-pointer"
        >
          {items.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 z-[310] flex items-center justify-center p-3 md:p-6 backdrop-blur-xs animate-fadeIn">
      <div className="bg-slate-50 rounded-2xl shadow-2xl border border-slate-300 max-w-6xl w-full flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight text-white">Çoklu Karşılaştırma Modu</h3>
                <span className="bg-indigo-500/30 text-indigo-200 text-[10px] font-black px-2 py-0.5 rounded-full border border-indigo-400/20">
                  Split View & Boş Saat Bulucu
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">İki öğretmen veya sınıfın programını eşzamanlı kıyaslayın</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-0.5 rounded-lg border border-white/10 flex text-xs font-bold">
              <button
                onClick={() => setViewMode('unified')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  viewMode === 'unified' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Birleşik Matris
              </button>
              <button
                onClick={() => setViewMode('side_by_side')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  viewMode === 'side_by_side' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                Yan Yana Tablo
              </button>
            </div>

            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Entity Selector Bar */}
        <div className="p-4 bg-white border-b border-slate-200 flex flex-col md:flex-row items-center gap-3 shrink-0">
          {renderEntitySelector(entityA, setEntityA, 'Taraf 1 (A)', 'bg-indigo-100 text-indigo-800')}
          
          <button
            onClick={handleSwap}
            title="Taraf A ve B'yi Değiştir"
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 text-slate-600 transition-all shrink-0 hover:rotate-180"
          >
            <ArrowRightLeft className="w-5 h-5" />
          </button>

          {renderEntitySelector(entityB, setEntityB, 'Taraf 2 (B)', 'bg-purple-100 text-purple-800')}
        </div>

        {/* Quick Insights Cards */}
        <div className="px-6 py-2.5 bg-slate-100/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-black">
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{comparisonStats.mutualFreeHours} Ortak Boş Saat</span>
            </div>

            {comparisonStats.sharedLessonHours > 0 && (
              <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-800 border border-indigo-200 px-3 py-1 rounded-lg">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>{comparisonStats.sharedLessonHours} Saat Birlikte Ders</span>
              </div>
            )}

            {comparisonStats.clashHours > 0 && (
              <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>{comparisonStats.clashHours} Saat Aynı Anda Dolu</span>
              </div>
            )}
          </div>

          {/* Quick Helper */}
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
            <Info className="w-3.5 h-3.5 text-indigo-500" />
            <span>Yeşil hücreler her iki tarafın da tamamen müsait olduğu boş saatleri gösterir.</span>
          </div>
        </div>

        {/* Main Comparison Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-slate-100">
          {viewMode === 'unified' ? (
            /* Unified Conflict / Mutual Free Matrix */
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-black border-b border-slate-200 transition-colors hover:bg-slate-50/80">
                    <th className="p-3 text-left w-24 sticky left-0 bg-slate-100 z-10 border-r border-slate-200">GÜN</th>
                    {Array.from({ length: Math.max(...activeDays.map(d => d.periods), 9) }).map((_, pIdx) => (
                      <th key={pIdx} className="p-2 text-center border-r border-slate-200 min-w-[100px]">
                        <div>{pIdx + 1}. Saat</div>
                        <div className="text-[9px] text-slate-400 font-normal">
                          {schoolSettings.lessonTimes?.[pIdx]?.start || ''}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeDays.map(day => {
                    const dIdx = day.id - 1;
                    return (
                      <tr key={day.id} className="border-b border-slate-200 transition-colors hover:bg-slate-50/80">
                        <td className="p-3 font-extrabold text-slate-800 bg-slate-50 sticky left-0 z-10 border-r border-slate-200">
                          {day.name}
                        </td>
                        {Array.from({ length: Math.max(...activeDays.map(d => d.periods), 9) }).map((_, pIdx) => {
                          if (pIdx >= day.periods) {
                            return <td key={pIdx} className="bg-slate-100/70 border-r border-slate-200"></td>;
                          }

                          const cellA = getCellValue(entityA, dIdx, pIdx);
                          const cellB = getCellValue(entityB, dIdx, pIdx);
                          const closedA = isCellClosed(entityA, dIdx, pIdx);
                          const closedB = isCellClosed(entityB, dIdx, pIdx);

                          const dataA = parseCellData(cellA);
                          const dataB = parseCellData(cellB);

                          const isFreeA = !cellA && !closedA;
                          const isFreeB = !cellB && !closedB;

                          const isSameLesson = dataA && dataB && (
                            (dataA.id && dataA.id === dataB.id) ||
                            (dataA.teachers?.some(t => dataB.teachers?.includes(t)) && 
                             dataA.classes?.some(c => dataB.classes?.includes(c)))
                          );

                          // Style computation
                          let cellBg = 'bg-white';
                          let badgeContent = null;

                          if (closedA || closedB) {
                            cellBg = 'bg-red-50/70 border-red-200';
                            badgeContent = (
                              <div className="text-[10px] font-extrabold text-red-600 flex items-center justify-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {closedA && closedB ? 'İkisi de Kapalı' : closedA ? `${entityA.name} Kapalı` : `${entityB.name} Kapalı`}
                              </div>
                            );
                          } else if (isSameLesson) {
                            cellBg = 'bg-indigo-50/90 border-indigo-300';
                            badgeContent = (
                              <div className="text-center">
                                <span className="bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-95">
                                  Ortak Ders
                                </span>
                                <div className="font-extrabold text-indigo-950 text-[11px] mt-1 truncate">
                                  {dataA?.subject}
                                </div>
                              </div>
                            );
                          } else if (isFreeA && isFreeB) {
                            cellBg = 'bg-emerald-50/90 border-emerald-300';
                            badgeContent = (
                              <div className="text-center space-y-1">
                                <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center justify-center gap-1 mx-auto w-fit">
                                  <CheckCircle2 className="w-3 h-3" />
                                  ORTAK BOŞ
                                </span>
                                {onOpenQuickCreate && entityA.type === 'teacher' && entityB.type === 'class' && (
                                  <button
                                    onClick={() => onOpenQuickCreate(entityA.name, entityB.name)}
                                    className="text-[9px] font-bold text-emerald-800 hover:text-emerald-950 hover:underline block mx-auto"
                                  >
                                    + Ders Ekle
                                  </button>
                                )}
                              </div>
                            );
                          } else {
                            // Split details
                            badgeContent = (
                              <div className="space-y-1 text-[10px]">
                                <div className={`p-1 rounded font-semibold truncate ${
                                  cellA ? 'bg-indigo-100/70 text-indigo-900' : 'bg-emerald-100/50 text-emerald-700'
                                }`}>
                                  <span className="font-extrabold">A:</span> {cellA ? `${dataA?.subject || 'Ders'} (${dataA?.classes?.join(',') || ''})` : 'Boş'}
                                </div>
                                <div className={`p-1 rounded font-semibold truncate ${
                                  cellB ? 'bg-purple-100/70 text-purple-900' : 'bg-emerald-100/50 text-emerald-700'
                                }`}>
                                  <span className="font-extrabold">B:</span> {cellB ? `${dataB?.subject || 'Ders'} (${dataB?.classes?.join(',') || ''})` : 'Boş'}
                                </div>
                              </div>
                            );
                          }

                          return (
                            <td key={pIdx} className={`p-2 border-r border-b border-slate-200 transition-colors ${cellBg}`}>
                              {badgeContent}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Side by Side Dual Tables */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[
                { entity: entityA, label: 'Taraf 1 (A)', color: 'text-indigo-600' },
                { entity: entityB, label: 'Taraf 2 (B)', color: 'text-purple-600' }
              ].map((side, sIdx) => (
                <div key={sIdx} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                      <span className={`font-black ${side.color}`}>{side.label}:</span>
                      <span>{side.entity.name}</span>
                    </div>
                    <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600 uppercase">
                      {side.entity.type}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold transition-colors hover:bg-slate-50/80">
                          <th className="p-1.5 text-left">Gün</th>
                          {Array.from({ length: 9 }).map((_, p) => (
                            <th key={p} className="p-1 text-center font-bold text-[10px]">{p + 1}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {activeDays.map(day => {
                          const dIdx = day.id - 1;
                          return (
                            <tr key={day.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/80">
                              <td className="p-1.5 font-bold text-slate-700 text-[11px]">{day.name.slice(0, 3)}</td>
                              {Array.from({ length: 9 }).map((_, p) => {
                                if (p >= day.periods) return <td key={p} className="bg-slate-100/50"></td>;
                                const val = getCellValue(side.entity, dIdx, p);
                                const isClosed = isCellClosed(side.entity, dIdx, p);
                                const data = parseCellData(val);

                                return (
                                  <td
                                    key={p}
                                    className={`p-1 text-center border-l border-slate-100 text-[10px] ${
                                      isClosed
                                        ? 'bg-red-100 text-red-700 font-bold'
                                        : val
                                        ? 'bg-indigo-50 text-indigo-900 font-extrabold'
                                        : 'bg-emerald-50/40 text-emerald-600'
                                    }`}
                                    title={val ? `${data?.subject} - ${data?.teachers?.join(',')} - ${data?.classes?.join(',')}` : isClosed ? 'Kapalı' : 'Boş'}
                                  >
                                    {isClosed ? 'K' : val ? (data?.subject?.slice(0, 4) || 'Ders') : '—'}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="font-bold text-slate-700">Ortak Müsait Saatler</span>
            <span className="inline-block w-3 h-3 rounded-full bg-indigo-500 ml-3"></span>
            <span className="font-bold text-slate-700">Ortak Ders</span>
            <span className="inline-block w-3 h-3 rounded-full bg-red-500 ml-3"></span>
            <span className="font-bold text-slate-700">Kapalı Saat</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl transition-colors shadow-xs"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
};
