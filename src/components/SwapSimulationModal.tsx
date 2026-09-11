import React, { useState, useMemo } from 'react';
import { 
  ArrowLeftRight, 
  X, 
  Sparkles, 
  Clock, 
  User, 
  GraduationCap, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export interface CardData {
  subject: string;
  teachers: string[];
  classes: string[];
  rooms: string[];
  hours?: number;
  fixed?: boolean;
}

export interface SlotCoordinates {
  entity: string;
  dIdx: number;
  pIdx: number;
  hours?: number;
}

export interface SwapSimulationModalState {
  isOpen: boolean;
  cardA: CardData | null;
  slotA: SlotCoordinates | null;
  cardB: CardData | null;
  slotB: SlotCoordinates | null;
}

export interface SchoolSettings {
  weekDays: { id: number; name: string; active: boolean; periods: number }[];
  [key: string]: any;
}

interface SwapSimulationModalProps {
  modalState: SwapSimulationModalState | null;
  onClose: () => void;
  onConfirmSwap: (
    slotA: SlotCoordinates, 
    slotB: SlotCoordinates, 
    cardA: CardData, 
    cardB: CardData
  ) => void;
  schoolSettings: SchoolSettings;
  schedules: Record<string, string[][]>;
  teachers: string[];
  classes: string[];
  rooms: string[];
}

export const SwapSimulationModal: React.FC<SwapSimulationModalProps> = ({
  modalState,
  onClose,
  onConfirmSwap,
  schoolSettings,
  schedules,
  teachers
}) => {
  if (!modalState || !modalState.isOpen || !modalState.cardA || !modalState.slotA) return null;

  const { cardA, slotA } = modalState;

  // Find all scheduled lessons across the board to allow choosing a target if not pre-populated
  const allScheduledSlots = useMemo(() => {
    const list: { slot: SlotCoordinates; card: CardData; label: string }[] = [];
    const activeDays = schoolSettings.weekDays.filter(d => d.active);

    teachers.forEach(teacher => {
      const grid = schedules[teacher];
      if (!grid) return;

      activeDays.forEach(day => {
        const dIdx = day.id;
        const periods = day.periods;
        let pIdx = 0;

        while (pIdx < periods) {
          const raw = grid[dIdx]?.[pIdx];
          if (raw && !raw.startsWith('CLOSED_') && !raw.startsWith('BLOCKED_')) {
            try {
              const data: CardData = JSON.parse(raw);
              const blockSize = data.hours || 1;

              // Don't include the same slot
              if (!(slotA.entity === teacher && slotA.dIdx === dIdx && slotA.pIdx === pIdx)) {
                list.push({
                  slot: { entity: teacher, dIdx, pIdx, hours: blockSize },
                  card: data,
                  label: `${data.subject} - ${data.classes.join(', ')} (${teacher}) [${day.name} ${pIdx + 1}. Saat]`
                });
              }
              pIdx += blockSize;
            } catch {
              pIdx++;
            }
          } else {
            pIdx++;
          }
        }
      });
    });

    return list;
  }, [schoolSettings, schedules, teachers, slotA]);

  const [selectedTargetIndex, setSelectedTargetIndex] = useState<number>(() => {
    if (modalState.slotB && modalState.cardB) {
      const idx = allScheduledSlots.findIndex(
        s => s.slot.entity === modalState.slotB?.entity && 
             s.slot.dIdx === modalState.slotB?.dIdx && 
             s.slot.pIdx === modalState.slotB?.pIdx
      );
      return idx >= 0 ? idx : 0;
    }
    return 0;
  });

  const currentTarget = allScheduledSlots[selectedTargetIndex] || null;
  const cardB = modalState.cardB || currentTarget?.card || null;
  const slotB = modalState.slotB || currentTarget?.slot || null;

  // Conflict Simulation Analysis
  const simulationResults = useMemo(() => {
    if (!cardA || !slotA || !cardB || !slotB) return null;

    const conflictsAtoB: string[] = [];
    const conflictsBtoA: string[] = [];

    // Check Card A moving to Slot B (slotB.dIdx, slotB.pIdx)
    // 1. Teachers of Card A busy at slotB?
    cardA.teachers.forEach(t => {
      if (t !== slotB.entity) {
        const tGrid = schedules[t];
        if (tGrid && tGrid[slotB.dIdx]?.[slotB.pIdx]) {
          const raw = tGrid[slotB.dIdx][slotB.pIdx];
          if (raw) {
            try {
              const parsed: CardData = JSON.parse(raw);
              if (!(parsed.subject === cardB.subject && parsed.classes.some(c => cardB.classes.includes(c)))) {
                conflictsAtoB.push(`Öğretmen ${t}, ${schoolSettings.weekDays[slotB.dIdx]?.name} ${slotB.pIdx + 1}. saatte başka bir derste (${parsed.subject}).`);
              }
            } catch {
              conflictsAtoB.push(`Öğretmen ${t} hedef saatte meşgul.`);
            }
          }
        }
      }
    });

    // 2. Classes of Card A busy at slotB?
    cardA.classes.forEach(c => {
      teachers.forEach(t => {
        const tGrid = schedules[t];
        if (tGrid && tGrid[slotB.dIdx]?.[slotB.pIdx]) {
          const raw = tGrid[slotB.dIdx][slotB.pIdx];
          if (raw) {
            try {
              const parsed: CardData = JSON.parse(raw);
              if (parsed.classes.includes(c)) {
                if (!(parsed.subject === cardB.subject && parsed.teachers.some(pt => cardB.teachers.includes(pt)))) {
                  conflictsAtoB.push(`Sınıf ${c}, ${schoolSettings.weekDays[slotB.dIdx]?.name} ${slotB.pIdx + 1}. saatte başka bir derste (${parsed.subject}).`);
                }
              }
            } catch {
              // ignore
            }
          }
        }
      });
    });

    // Check Card B moving to Slot A (slotA.dIdx, slotA.pIdx)
    // 1. Teachers of Card B busy at slotA?
    cardB.teachers.forEach(t => {
      if (t !== slotA.entity) {
        const tGrid = schedules[t];
        if (tGrid && tGrid[slotA.dIdx]?.[slotA.pIdx]) {
          const raw = tGrid[slotA.dIdx][slotA.pIdx];
          if (raw) {
            try {
              const parsed: CardData = JSON.parse(raw);
              if (!(parsed.subject === cardA.subject && parsed.classes.some(c => cardA.classes.includes(c)))) {
                conflictsBtoA.push(`Öğretmen ${t}, ${schoolSettings.weekDays[slotA.dIdx]?.name} ${slotA.pIdx + 1}. saatte meşgul (${parsed.subject}).`);
              }
            } catch {
              conflictsBtoA.push(`Öğretmen ${t} kaynak saatte meşgul.`);
            }
          }
        }
      }
    });

    // 2. Classes of Card B busy at slotA?
    cardB.classes.forEach(c => {
      teachers.forEach(t => {
        const tGrid = schedules[t];
        if (tGrid && tGrid[slotA.dIdx]?.[slotA.pIdx]) {
          const raw = tGrid[slotA.dIdx][slotA.pIdx];
          if (raw) {
            try {
              const parsed: CardData = JSON.parse(raw);
              if (parsed.classes.includes(c)) {
                if (!(parsed.subject === cardA.subject && parsed.teachers.some(pt => cardA.teachers.includes(pt)))) {
                  conflictsBtoA.push(`Sınıf ${c}, ${schoolSettings.weekDays[slotA.dIdx]?.name} ${slotA.pIdx + 1}. saatte başka bir derste (${parsed.subject}).`);
                }
              }
            } catch {
              // ignore
            }
          }
        }
      });
    });

    const isAtoBValid = conflictsAtoB.length === 0;
    const isBtoAValid = conflictsBtoA.length === 0;
    const canSwapSafely = isAtoBValid && isBtoAValid;

    return {
      conflictsAtoB,
      conflictsBtoA,
      isAtoBValid,
      isBtoAValid,
      canSwapSafely
    };
  }, [cardA, slotA, cardB, slotB, schedules, teachers, schoolSettings]);

  const handleApply = () => {
    if (!slotA || !slotB || !cardA || !cardB) return;
    onConfirmSwap(slotA, slotB, cardA, cardB);
    onClose();
  };

  const dayAName = schoolSettings.weekDays[slotA.dIdx]?.name || `Gün ${slotA.dIdx + 1}`;
  const dayBName = slotB ? (schoolSettings.weekDays[slotB.dIdx]?.name || `Gün ${slotB.dIdx + 1}`) : '';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-[9999] animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white px-5 py-4 flex items-center justify-between border-b border-indigo-500/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/80 text-white border border-indigo-400/40 shadow-sm">
              <ArrowLeftRight className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight text-white">Hızlı Takas (Swap) & Çakışma Kılavuzu</h3>
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                  Simülatör
                </span>
              </div>
              <p className="text-xs text-slate-300">İki dersin yer değişimini ve doğuracağı etkileri anlık analiz edin.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-800 text-xs custom-scrollbar">
          
          {/* Slot Selection dropdown if Card B was not predefined */}
          {allScheduledSlots.length > 0 && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
              <label className="font-extrabold text-slate-700 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Takas Edilecek Hedef Dersi Seçin:
              </label>
              <select
                value={selectedTargetIndex}
                onChange={(e) => setSelectedTargetIndex(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {allScheduledSlots.map((item, idx) => (
                  <option key={idx} value={idx}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Cards Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Card A Box */}
            <div className="p-3.5 rounded-xl border-2 border-indigo-200 bg-indigo-50/40 relative flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-indigo-200/80 pb-2">
                  <span className="font-black text-indigo-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                    Kaynak Ders (A)
                  </span>
                  <span className="bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded text-[10px]">
                    {cardA.hours} Saat
                  </span>
                </div>

                <div className="font-black text-sm text-slate-900 tracking-tight">
                  {cardA.subject}
                </div>

                <div className="space-y-1 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-slate-700">Sınıflar:</span>
                    <span>{cardA.classes.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-slate-700">Öğretmen:</span>
                    <span>{cardA.teachers.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-slate-700">Mevcut Zaman:</span>
                    <span className="text-indigo-700 font-semibold">{dayAName} {slotA.pIdx + 1}. Saat</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-indigo-100 text-[11px] font-bold text-indigo-700 flex items-center gap-1">
                <span>Hedef:</span>
                <span className="bg-white px-2 py-0.5 rounded border border-indigo-200 shadow-2xs">
                  {dayBName} {(slotB?.pIdx ?? 0) + 1}. Saat
                </span>
              </div>
            </div>

            {/* Card B Box */}
            <div className="p-3.5 rounded-xl border-2 border-amber-200 bg-amber-50/40 relative flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                  <span className="font-black text-amber-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                    Hedef Ders (B)
                  </span>
                  <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">
                    {cardB ? `${cardB.hours} Saat` : '-'}
                  </span>
                </div>

                <div className="font-black text-sm text-slate-900 tracking-tight">
                  {cardB ? cardB.subject : 'Seçilmedi'}
                </div>

                {cardB && (
                  <div className="space-y-1 text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold text-slate-700">Sınıflar:</span>
                      <span>{cardB.classes.join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold text-slate-700">Öğretmen:</span>
                      <span>{cardB.teachers.join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold text-slate-700">Mevcut Zaman:</span>
                      <span className="text-amber-700 font-semibold">{dayBName} {(slotB?.pIdx ?? 0) + 1}. Saat</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-amber-100 text-[11px] font-bold text-amber-700 flex items-center gap-1">
                <span>Hedef:</span>
                <span className="bg-white px-2 py-0.5 rounded border border-amber-200 shadow-2xs">
                  {dayAName} {slotA.pIdx + 1}. Saat
                </span>
              </div>
            </div>
          </div>

          {/* Conflict Analysis & Simulation Feedback Box */}
          {simulationResults && (
            <div className={`p-4 rounded-xl border ${
              simulationResults.canSwapSafely 
                ? 'bg-emerald-50/90 border-emerald-300 text-emerald-900' 
                : 'bg-rose-50/90 border-rose-300 text-rose-900'
            }`}>
              <div className="flex items-start gap-2.5">
                {simulationResults.canSwapSafely ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1.5 flex-1">
                  <div className="font-extrabold text-sm flex items-center gap-2">
                    {simulationResults.canSwapSafely ? (
                      <span className="text-emerald-800">Tam Uygun! Hiçbir Çakışma Tespit Edilmedi.</span>
                    ) : (
                      <span className="text-rose-800">Çakışma / Kural İhlali Uyarısı:</span>
                    )}
                  </div>

                  {simulationResults.canSwapSafely ? (
                    <p className="text-emerald-700 text-xs">
                      İki ders de karşılıklı olarak hedef saatlerdeki öğretmen, sınıf ve derslik uygunluk kriterlerini kusursuz şekilde sağlamaktadır.
                    </p>
                  ) : (
                    <div className="space-y-1 text-xs">
                      {simulationResults.conflictsAtoB.map((c, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-rose-700 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                          <span>{c}</span>
                        </div>
                      ))}
                      {simulationResults.conflictsBtoA.map((c, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-rose-700 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-200 font-bold text-xs transition-colors"
          >
            Vazgeç
          </button>

          <button
            onClick={handleApply}
            disabled={!cardB || !slotB}
            className={`px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
              simulationResults?.canSwapSafely
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>{simulationResults?.canSwapSafely ? 'Takası Gerçekleştir' : 'Yine de Takas Et'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
