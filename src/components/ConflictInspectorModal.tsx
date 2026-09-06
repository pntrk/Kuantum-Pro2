import React, { useMemo } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Clock, 
  User, 
  Users, 
  HelpCircle, 
  Sparkles,
  ShieldAlert,
  Search
} from 'lucide-react';
import { CourseCard, SchoolSettings, SchedulesMap, ConstraintsMap } from '../types/workerMessages';
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

interface ConflictInspectorModalProps {
  card: CourseCard | null;
  onClose: () => void;
  schoolSettings: SchoolSettings;
  schedules: SchedulesMap;
  classSchedules: SchedulesMap;
  roomSchedules?: SchedulesMap;
  lockedCells: Record<string, boolean>;
  constraints?: ConstraintsMap;
  onSelectSlot?: (dayIdx: number, periodIdx: number) => void;
}

export const ConflictInspectorModal: React.FC<ConflictInspectorModalProps> = ({
  card,
  onClose,
  schoolSettings,
  schedules,
  classSchedules,
  roomSchedules,
  lockedCells,
  constraints,
  onSelectSlot
}) => {
  if (!card) return null;

  const cardHours = card.hours || card.span || 1;
  const activeDays = (schoolSettings.weekDays || []).filter(d => d.active);

  // Analyze every possible slot in the week for this card
  const slotAnalysis = useMemo(() => {
    const results: {
      dayId: number;
      dayName: string;
      dayIdx: number;
      periodIdx: number;
      timeStr: string;
      isAvailable: boolean;
      reasons: string[];
      severity: 'ok' | 'warning' | 'conflict' | 'locked';
    }[] = [];

    let totalPossibleSlots = 0;
    let availableSlots = 0;

    activeDays.forEach(day => {
      const dayIdx = day.id - 1;
      const maxPeriods = day.periods || 9;
      const maxStart = maxPeriods - cardHours;

      for (let p = 0; p <= maxStart; p++) {
        totalPossibleSlots++;
        const reasons: string[] = [];
        let isAvailable = true;
        let severity: 'ok' | 'warning' | 'conflict' | 'locked' = 'ok';

        const startTime = schoolSettings.lessonTimes?.[p]?.start || `${p + 1}. Saat`;
        const endTime = schoolSettings.lessonTimes?.[p + cardHours - 1]?.end || '';
        const timeStr = endTime ? `${startTime} - ${endTime}` : startTime;

        // 1. Check Locked Cells in slot
        for (let h = 0; h < cardHours; h++) {
          const checkP = p + h;
          card.teachers?.forEach(t => {
            if (lockedCells[`${t}-${dayIdx}-${checkP}`]) {
              reasons.push(`${t} bu saatte kilitli bir derse sahip.`);
              isAvailable = false;
              severity = 'locked';
            }
          });
          card.classes?.forEach(c => {
            if (lockedCells[`${c}-${dayIdx}-${checkP}`]) {
              reasons.push(`${c} sınıfı bu saatte kilitli bir derse sahip.`);
              isAvailable = false;
              severity = 'locked';
            }
          });
        }

        // 2. Check Teacher Clashes
        for (let h = 0; h < cardHours; h++) {
          const checkP = p + h;
          card.teachers?.forEach(t => {
            const cellVal = schedules[t]?.[dayIdx]?.[checkP];
            if (cellVal && cellVal !== '') {
              const existing = parseCellData(cellVal);
              reasons.push(`${t} öğretmeninin halihazırda ${existing?.classes?.join(', ') || ''} sınıfında "${existing?.subject || 'Ders'}" dersi var.`);
              isAvailable = false;
              if (severity !== 'locked') severity = 'conflict';
            }
          });
        }

        // 3. Check Class Clashes
        for (let h = 0; h < cardHours; h++) {
          const checkP = p + h;
          card.classes?.forEach(c => {
            const cellVal = classSchedules[c]?.[dayIdx]?.[checkP];
            if (cellVal && cellVal !== '') {
              const existing = parseCellData(cellVal);
              reasons.push(`${c} sınıfının bu saatte ${existing?.teachers?.join(', ') || ''} ile "${existing?.subject || 'Ders'}" dersi mevcut.`);
              isAvailable = false;
              if (severity !== 'locked') severity = 'conflict';
            }
          });
        }

        // 4. Check Room Clashes (if assigned)
        if (roomSchedules && card.rooms && card.rooms.length > 0) {
          for (let h = 0; h < cardHours; h++) {
            const checkP = p + h;
            card.rooms.forEach(r => {
              const cellVal = roomSchedules[r]?.[dayIdx]?.[checkP];
              if (cellVal && cellVal !== '') {
                const existing = parseCellData(cellVal);
                reasons.push(`${r} dersliği ${existing?.classes?.join(', ') || ''} tarafından kullanımda.`);
                isAvailable = false;
                if (severity !== 'locked') severity = 'conflict';
              }
            });
          }
        }

        // 5. Check Teacher Off-Hour Constraints
        if (constraints?.teachers) {
          card.teachers?.forEach(t => {
            const offSlots = constraints.teachers[t] || [];
            for (let h = 0; h < cardHours; h++) {
              const key = `${dayIdx}-${p + h}`;
              if (offSlots.includes(key)) {
                reasons.push(`${t} öğretmeni idare tarafından bu saatte kapalı (kısıtlı) işaretlenmiş.`);
                isAvailable = false;
                if (severity !== 'locked') severity = 'conflict';
              }
            }
          });
        }

        if (isAvailable) {
          availableSlots++;
        }

        results.push({
          dayId: day.id,
          dayName: day.name,
          dayIdx,
          periodIdx: p,
          timeStr,
          isAvailable,
          reasons: Array.from(new Set(reasons)),
          severity
        });
      }
    });

    return {
      results,
      totalPossibleSlots,
      availableSlots,
      bottleneckRating: availableSlots === 0 ? 'CRITICAL' : availableSlots <= 3 ? 'HIGH' : 'NORMAL'
    };
  }, [card, activeDays, schedules, classSchedules, roomSchedules, lockedCells, constraints, schoolSettings]);

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[280] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 relative">
        <div className="w-full flex justify-center pt-3 pb-2 sm:hidden shrink-0 touch-none bg-slate-900">
          <div className="w-12 h-1.5 bg-slate-600 rounded-full"></div>
        </div>
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <Search className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight text-white">Akıllı Çakışma & Neden Analizi</h3>
                <span className="bg-indigo-500/30 text-indigo-200 text-[10px] font-black px-2 py-0.5 rounded-full border border-indigo-400/20">
                  Smart Inspector
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">Seçili kartın haftalık müsaitlik ve tıkanma raporu</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Card Brief Card */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="px-3 py-1.5 bg-indigo-600 text-white font-black text-xs rounded-lg -xs flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-95">
              <Clock className="w-3.5 h-3.5" />
              {cardHours} Saatlik Blok
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-sm">{card.subject}</div>
              <div className="flex items-center gap-3 text-xs text-slate-600 font-semibold mt-0.5">
                <span className="flex items-center gap-1"><User className="w-3 h-3 text-slate-400" /> {card.teachers?.join(', ') || 'Öğretmen Yok'}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3 text-slate-400" /> {card.classes?.join(', ') || 'Sınıf Yok'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className={`px-3 py-1 rounded-full font-black border flex items-center gap-1.5 ${
              slotAnalysis.bottleneckRating === 'CRITICAL'
                ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                : slotAnalysis.bottleneckRating === 'HIGH'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {slotAnalysis.bottleneckRating === 'CRITICAL' ? (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                  Tam Tıkanma (%0 Müsait)
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  {slotAnalysis.availableSlots} / {slotAnalysis.totalPossibleSlots} Yuva Müsait
                </>
              )}
            </div>
          </div>
        </div>

        {/* Diagnostic Results List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
          {slotAnalysis.availableSlots === 0 && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs text-red-900 space-y-1">
                <div className="font-extrabold text-sm">Bu ders için haftanın hiçbir gününde boş yuva kalmadı!</div>
                <p>
                  Öğretmenin veya sınıfın diğer dersleri, kilitli dersler veya kapalı izinli saatleri tüm olasılıkları doldurmuş.
                  Aşağıdaki listeden çakışma nedenlerini inceleyip ilgili saatlerdeki dersleri havuza taşıyabilirsiniz.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {slotAnalysis.results.map((slot, i) => {
              return (
                <div
                  key={i}
                  className={`p-3 rounded-xl border transition-all text-xs flex flex-col justify-between gap-1.5 ${
                    slot.isAvailable
                      ? 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-400 hover:shadow-xs'
                      : slot.severity === 'locked'
                      ? 'bg-amber-50/60 border-amber-200'
                      : 'bg-slate-50 border-slate-200 opacity-90'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-black/5 pb-1.5">
                    <div className="font-black text-slate-800 flex items-center gap-1.5">
                      <span className="text-indigo-600">{slot.dayName}</span>
                      <span className="text-slate-400">•</span>
                      <span>{slot.periodIdx + 1}. Saat</span>
                      <span className="text-[10px] text-slate-500 font-medium">({slot.timeStr})</span>
                    </div>

                    {slot.isAvailable ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Uygun
                      </span>
                    ) : (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        slot.severity === 'locked' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                      }`}>
                        <AlertTriangle className="w-3 h-3" />
                        {slot.severity === 'locked' ? 'Kilitli' : 'Çakışmalı'}
                      </span>
                    )}
                  </div>

                  {slot.isAvailable ? (
                    <div className="text-[11px] text-emerald-800 font-medium flex items-center justify-between pt-1">
                      <span>Bu saatte öğretmen, sınıf ve derslik tamamen müsait.</span>
                      {onSelectSlot && (
                        <button
                          onClick={() => {
                            onSelectSlot(slot.dayIdx, slot.periodIdx);
                            onClose();
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1 rounded text-[10px] transition-colors"
                        >
                          Buraya Koy
                        </button>
                      )}
                    </div>
                  ) : (
                    <ul className="space-y-1 text-[10.5px] text-slate-700 pt-0.5">
                      {slot.reasons.map((reason, rIdx) => (
                        <li key={rIdx} className="flex items-start gap-1 leading-snug">
                          <span className="text-red-500 font-bold shrink-0">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 md:px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500 sticky bottom-0 w-full z-10 shrink-0">
          <div className="flex items-center justify-center text-center md:text-left gap-1.5 font-medium">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Kırmızı çakışmalı dersleri çözmek için o saatteki dersleri sürükleyerek kaydırabilirsiniz.</span>
          </div>
          <button
            onClick={onClose}
            className="w-full md:w-auto px-4 py-3 md:py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors shadow-xs min-h-[44px] text-sm md:text-xs shrink-0"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
};
