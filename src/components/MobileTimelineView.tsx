import React, { useState, useMemo } from 'react';
import { 
  Calendar, Clock, User, Layers, MapPin, Lock, Unlock, 
  ArrowLeftRight, Plus, Sparkles, Check, ChevronRight,
  Search, BookOpen, AlertCircle, Trash2, Info, MoreVertical
} from 'lucide-react';
import { MobileQuickActionTarget } from './MobileQuickActionSheet';

interface MobileTimelineViewProps {
  previewType: 'teacher' | 'class' | 'room';
  setPreviewType: (type: 'teacher' | 'class' | 'room') => void;
  teachers: string[];
  classes: string[];
  rooms: string[];
  schedules: Record<string, any>;
  classSchedules: Record<string, any>;
  roomSchedules: Record<string, any>;
  schoolSettings: any;
  lockedCells: Record<string, boolean>;
  onToggleLock: (entity: string, dIdx: number, pIdx: number) => void;
  onOpenQuickAction: (target: MobileQuickActionTarget) => void;
  movingCard: MobileQuickActionTarget | null;
  onCancelMove: () => void;
  onExecuteMoveToSlot: (targetDayIdx: number, targetPeriodIdx: number) => void;
}

export const MobileTimelineView: React.FC<MobileTimelineViewProps> = ({
  previewType,
  setPreviewType,
  teachers = [],
  classes = [],
  rooms = [],
  schedules = {},
  classSchedules = {},
  roomSchedules = {},
  schoolSettings,
  lockedCells = {},
  onToggleLock,
  onOpenQuickAction,
  movingCard,
  onCancelMove,
  onExecuteMoveToSlot
}) => {
  const [selectedEntity, setSelectedEntity] = useState<string>('');
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active entities list based on type
  const entityList = useMemo(() => {
    if (previewType === 'teacher') return teachers;
    if (previewType === 'class') return classes;
    return rooms;
  }, [previewType, teachers, classes, rooms]);

  // Set initial selected entity if empty
  React.useEffect(() => {
    if (!selectedEntity || !entityList.includes(selectedEntity)) {
      if (entityList.length > 0) {
        setSelectedEntity(entityList[0]);
      }
    }
  }, [previewType, entityList]);

  const filteredEntities = useMemo(() => {
    if (!searchQuery.trim()) return entityList;
    const q = searchQuery.toLowerCase();
    return entityList.filter(e => e.toLowerCase().includes(q));
  }, [entityList, searchQuery]);

  const activeDays = useMemo(() => {
    return (schoolSettings?.weekDays || [
      { id: 1, name: 'Pazartesi', active: true },
      { id: 2, name: 'Salı', active: true },
      { id: 3, name: 'Çarşamba', active: true },
      { id: 4, name: 'Perşembe', active: true },
      { id: 5, name: 'Cuma', active: true }
    ]).filter((d: any) => d.active);
  }, [schoolSettings]);

  const currentSchedule = useMemo(() => {
    if (!selectedEntity) return null;
    if (previewType === 'teacher') return schedules[selectedEntity];
    if (previewType === 'class') return classSchedules[selectedEntity];
    return roomSchedules[selectedEntity];
  }, [previewType, selectedEntity, schedules, classSchedules, roomSchedules]);

  const periodsCount = schoolSettings?.periodsPerDay || 8;
  const periodTimes = schoolSettings?.periodTimes || [];

  // Parse cell string into structured data
  const parseCell = (cellStr: string | null | undefined) => {
    if (!cellStr) return null;
    try {
      if (cellStr.startsWith('{')) {
        return JSON.parse(cellStr);
      }
      const parts = cellStr.split('|');
      return {
        subject: parts[0] || '',
        teachers: parts[1] ? [parts[1]] : [],
        classes: parts[2] ? [parts[2]] : [],
        rooms: parts[3] ? [parts[3]] : [],
        hours: 1
      };
    } catch {
      return { subject: cellStr, hours: 1 };
    }
  };

  const selectedDayObj = activeDays[selectedDayIdx] || activeDays[0];

  // Daily statistics
  const dayStats = useMemo(() => {
    if (!currentSchedule) return { filled: 0, total: periodsCount };
    let filled = 0;
    for (let p = 0; p < periodsCount; p++) {
      if (currentSchedule[selectedDayIdx]?.[p]) filled++;
    }
    return { filled, total: periodsCount };
  }, [currentSchedule, selectedDayIdx, periodsCount]);

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden">
      {/* Top Controls: Type Tabs & Entity Selector */}
      <div className="bg-slate-900 text-white p-3 shrink-0 shadow-md border-b border-slate-800 space-y-2.5">
        {/* Entity Type Switcher (Öğretmen / Sınıf / Derslik) */}
        <div className="grid grid-cols-3 bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
          <button
            onPointerDown={() => {
              setPreviewType('teacher');
              setSearchQuery('');
            }}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center touch-manipulation ${
              previewType === 'teacher' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Öğretmenler
          </button>
          <button
            onPointerDown={() => {
              setPreviewType('class');
              setSearchQuery('');
            }}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center touch-manipulation ${
              previewType === 'class' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sınıflar
          </button>
          <button
            onPointerDown={() => {
              setPreviewType('room');
              setSearchQuery('');
            }}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center touch-manipulation ${
              previewType === 'room' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Derslikler
          </button>
        </div>

        {/* Entity Selector Dropdown & Quick Search */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 hover:border-indigo-500 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none shadow-inner"
            >
              {filteredEntities.map((ent) => (
                <option key={ent} value={ent} className="bg-slate-900 text-white">
                  {ent}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronRight className="w-4 h-4 rotate-90" />
            </div>
          </div>

          <div className="relative w-28 sm:w-36">
            <input
              type="text"
              placeholder="Filtrele..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-7 pr-2 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Day Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar touch-pan-x">
          {activeDays.map((d: any, idx: number) => {
            let dayLessonCount = 0;
            if (currentSchedule) {
              for (let p = 0; p < periodsCount; p++) {
                if (currentSchedule[idx]?.[p]) dayLessonCount++;
              }
            }
            const isSelected = selectedDayIdx === idx;

            return (
              <button
                key={d.id || idx}
                onPointerDown={() => setSelectedDayIdx(idx)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all active:scale-95 touch-manipulation ${
                  isSelected 
                    ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md ring-1 ring-indigo-300/40' 
                    : 'bg-slate-950/70 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <span>{d.name?.substring(0, 3)}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {dayLessonCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Active Move / Swap Alert Bar */}
      {movingCard && (
        <div className="bg-emerald-600 text-white px-3 py-2.5 shadow-lg flex items-center justify-between gap-2 shrink-0 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 overflow-hidden">
            <Sparkles className="w-4 h-4 text-emerald-200 animate-spin shrink-0" />
            <div className="text-xs truncate">
              <span className="font-black">{movingCard.cardData.subject}</span> taşınıyor: Hedef saate dokunun
            </div>
          </div>
          <button
            onPointerDown={onCancelMove}
            className="px-2.5 py-1 rounded-lg bg-emerald-800/80 hover:bg-emerald-900 active:bg-emerald-950 font-bold text-xs shrink-0 transition-colors"
          >
            İptal
          </button>
        </div>
      )}

      {/* Daily Progress & Summary */}
      <div className="px-3.5 py-2 bg-white border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
        <div className="font-bold text-slate-800 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          <span>{selectedDayObj?.name || 'Gün'} Ders Akışı</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-500">
            {dayStats.filled} / {dayStats.total} Ders Dolu
          </span>
          <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div 
              className="h-full bg-indigo-600 rounded-full transition-all"
              style={{ width: `${(dayStats.filled / dayStats.total) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Vertical Timeline Lesson Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
        {Array.from({ length: periodsCount }).map((_, pIdx) => {
          const periodNum = pIdx + 1;
          const timeSlot = periodTimes[pIdx] ? `${periodTimes[pIdx].start || ''} - ${periodTimes[pIdx].end || ''}` : '';
          const cellStr = currentSchedule?.[selectedDayIdx]?.[pIdx];
          const cardData = parseCell(cellStr);
          const lockKey = `${selectedEntity}_${selectedDayIdx}_${pIdx}`;
          const isLocked = !!lockedCells[lockKey];

          const isCurrentlyMovingThis = movingCard && 
            movingCard.entityName === selectedEntity && 
            movingCard.dayIdx === selectedDayIdx && 
            movingCard.periodIdx === pIdx;

          // If a lesson card exists in this period
          if (cardData) {
            return (
              <div
                key={pIdx}
                onPointerDown={() => {
                  if (movingCard) {
                    onExecuteMoveToSlot(selectedDayIdx, pIdx);
                  } else {
                    onOpenQuickAction({
                      entityType: previewType,
                      entityName: selectedEntity,
                      dayIdx: selectedDayIdx,
                      dayName: selectedDayObj?.name || '',
                      periodIdx: pIdx,
                      periodNumber: periodNum,
                      periodTime: timeSlot,
                      cardStr: cellStr,
                      cardData,
                      isLocked
                    });
                  }
                }}
                className={`relative bg-white rounded-2xl p-3.5 border shadow-xs transition-all active:scale-98 touch-manipulation cursor-pointer ${
                  isCurrentlyMovingThis 
                    ? 'border-indigo-500 ring-2 ring-indigo-400 bg-indigo-50/50 opacity-75' 
                    : movingCard 
                      ? 'border-emerald-400 bg-emerald-50/60 hover:bg-emerald-100' 
                      : isLocked 
                        ? 'border-amber-300 bg-amber-50/30' 
                        : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                      {periodNum}
                    </span>
                    {timeSlot && (
                      <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {timeSlot}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isLocked && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" /> Kilitli
                      </span>
                    )}
                    {movingCard ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-600 text-white animate-pulse">
                        🔄 Değiştir
                      </span>
                    ) : (
                      <button 
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          onOpenQuickAction({
                            entityType: previewType,
                            entityName: selectedEntity,
                            dayIdx: selectedDayIdx,
                            dayName: selectedDayObj?.name || '',
                            periodIdx: pIdx,
                            periodNumber: periodNum,
                            periodTime: timeSlot,
                            cardStr: cellStr,
                            cardData,
                            isLocked
                          });
                        }}
                        className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Subject and Details */}
                <div className="mt-2.5">
                  <div className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="truncate">{cardData.subject || 'Ders'}</span>
                    {cardData.hours && cardData.hours > 1 && (
                      <span className="text-[10px] font-bold px-1 py-0.2 rounded bg-indigo-100 text-indigo-800">
                        {cardData.hours}h
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-2 flex-wrap text-xs text-slate-600 font-semibold">
                    {previewType !== 'teacher' && cardData.teachers?.length > 0 && (
                      <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                        <User className="w-3 h-3 text-indigo-500" />
                        {cardData.teachers.join(', ')}
                      </span>
                    )}
                    {previewType !== 'class' && cardData.classes?.length > 0 && (
                      <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                        <Layers className="w-3 h-3 text-cyan-600" />
                        {cardData.classes.join(', ')}
                      </span>
                    )}
                    {cardData.rooms?.length > 0 && (
                      <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        {cardData.rooms.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          // EMPTY SLOT
          return (
            <div
              key={pIdx}
              onPointerDown={() => {
                if (movingCard) {
                  onExecuteMoveToSlot(selectedDayIdx, pIdx);
                }
              }}
              className={`rounded-2xl p-3 border-2 border-dashed transition-all touch-manipulation flex items-center justify-between ${
                movingCard
                  ? 'border-emerald-500 bg-emerald-50/80 hover:bg-emerald-100 cursor-pointer animate-pulse ring-2 ring-emerald-400 shadow-md'
                  : 'border-slate-300/80 bg-white/60 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${
                  movingCard ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {periodNum}
                </span>
                <div>
                  <div className={`text-xs font-bold ${movingCard ? 'text-emerald-900' : 'text-slate-500'}`}>
                    {movingCard ? '⚡ Bu Boş Saate Taşı' : `${periodNum}. Ders Boş`}
                  </div>
                  {timeSlot && (
                    <div className="text-[10px] text-slate-400">{timeSlot}</div>
                  )}
                </div>
              </div>

              {movingCard ? (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-black text-xs shadow-xs">
                  Buraya Yerleştir
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-slate-400">Boş</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
