import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeftRight, Lock, Unlock, Trash2, Info, X, 
  Sparkles, Clock, MapPin, User, BookOpen, Layers
} from 'lucide-react';

export interface MobileQuickActionTarget {
  entityType: 'teacher' | 'class' | 'room';
  entityName: string;
  dayIdx: number;
  dayName: string;
  periodIdx: number;
  periodNumber: number;
  periodTime?: string;
  cardStr: string;
  cardData: {
    id?: string;
    subject?: string;
    teachers?: string[];
    classes?: string[];
    rooms?: string[];
    hours?: number;
    [key: string]: any;
  };
  isLocked: boolean;
}

interface MobileQuickActionSheetProps {
  target: MobileQuickActionTarget | null;
  onClose: () => void;
  onStartMove: (target: MobileQuickActionTarget) => void;
  onToggleLock: (entityName: string, dayIdx: number, periodIdx: number) => void;
  onSendToPool: (target: MobileQuickActionTarget) => void;
  onInspect: (target: MobileQuickActionTarget) => void;
}

export const MobileQuickActionSheet: React.FC<MobileQuickActionSheetProps> = ({
  target,
  onClose,
  onStartMove,
  onToggleLock,
  onSendToPool,
  onInspect
}) => {
  if (!target) return null;

  const { cardData, entityName, entityType, dayName, periodNumber, periodTime, isLocked } = target;
  const teachersList = cardData.teachers?.join(', ') || '';
  const classesList = cardData.classes?.join(', ') || '';
  const roomsList = cardData.rooms?.join(', ') || '';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 z-[250] flex items-end justify-center p-0 backdrop-blur-xs">
        {/* Backdrop click */}
        <div className="absolute inset-0" onClick={onClose}></div>

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 overflow-hidden flex flex-col max-h-[88vh] z-10"
        >
          {/* Drag Handle */}
          <div className="w-full flex justify-center pt-3 pb-1 shrink-0 bg-slate-50 cursor-pointer touch-none" onClick={onClose}>
            <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
          </div>

          {/* Header & Lesson Info Card */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200">
                    {dayName} • {periodNumber}. Ders {periodTime ? `(${periodTime})` : ''}
                  </span>
                  {isLocked && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Kilitli
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1.5 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600 shrink-0" />
                  <span>{cardData.subject || 'Ders'}</span>
                  {cardData.hours && cardData.hours > 1 && (
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                      {cardData.hours} Saat Blok
                    </span>
                  )}
                </h3>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Entity Details */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
              {teachersList && (
                <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="truncate font-semibold">{teachersList}</span>
                </div>
              )}
              {classesList && (
                <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                  <span className="truncate font-semibold">{classesList}</span>
                </div>
              )}
              {roomsList && (
                <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center gap-1.5 col-span-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate font-semibold">Derslik: {roomsList}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions List */}
          <div className="p-4 space-y-2.5 overflow-y-auto">
            {/* 1. Swap / Move */}
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                onStartMove(target);
                onClose();
              }}
              className="w-full p-3.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 border border-indigo-200/80 text-indigo-950 font-bold text-sm flex items-center justify-between transition-all active:scale-98 touch-manipulation group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-black text-indigo-900">Başka Saatle Değiştir / Taşı</div>
                  <div className="text-xs text-indigo-700/80 font-normal">Uygun boş saatler yeşil parlar, tek tıkla yerleşir</div>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-lg bg-indigo-200/70 text-indigo-800">
                Seç &amp; Taşı
              </span>
            </button>

            {/* 2. Lock / Unlock */}
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                onToggleLock(entityName, target.dayIdx, target.periodIdx);
                onClose();
              }}
              className={`w-full p-3.5 rounded-2xl border font-bold text-sm flex items-center justify-between transition-all active:scale-98 touch-manipulation group shadow-2xs ${
                isLocked 
                  ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-950'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0 transition-transform ${
                  isLocked ? 'bg-amber-500 text-white' : 'bg-slate-700 text-white'
                }`}>
                  {isLocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>
                <div className="text-left">
                  <div className="text-sm font-black text-slate-900">
                    {isLocked ? 'Saatin Kilidini Aç' : 'Bu Saati Kilitle / Sabitle'}
                  </div>
                  <div className="text-xs text-slate-500 font-normal">
                    {isLocked ? 'Otomatik dağıtımda bu saat tekrar değiştirilebilir olur' : 'Otomatik dağıtımda bu dersin yeri asla bozulmaz'}
                  </div>
                </div>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                isLocked ? 'bg-amber-200 text-amber-900' : 'bg-slate-200 text-slate-700'
              }`}>
                {isLocked ? 'Kilidi Kaldır' : 'Sabitle'}
              </span>
            </button>

            {/* 3. Inspect Conflict / Rules */}
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                onInspect(target);
                onClose();
              }}
              className="w-full p-3.5 rounded-2xl bg-cyan-50 hover:bg-cyan-100 active:bg-cyan-200 border border-cyan-200/80 text-cyan-950 font-bold text-sm flex items-center justify-between transition-all active:scale-98 touch-manipulation group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-sm shrink-0 transition-transform">
                  <Info className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-black text-cyan-950">Çakışma ve Kısıtlama İncele</div>
                  <div className="text-xs text-cyan-700 font-normal">Öğretmen ve sınıfın uygunluk durumunu analiz et</div>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-lg bg-cyan-200/80 text-cyan-900">
                İncele
              </span>
            </button>

            {/* 4. Send to Pool */}
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                onSendToPool(target);
                onClose();
              }}
              className="w-full p-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-200/80 text-rose-950 font-bold text-sm flex items-center justify-between transition-all active:scale-98 touch-manipulation group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-sm shrink-0 transition-transform">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-black text-rose-900">Havuza Geri Gönder</div>
                  <div className="text-xs text-rose-700/80 font-normal">Dersi tablodan kaldırıp dağıtılmamış havuza aktar</div>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-lg bg-rose-200/80 text-rose-900">
                Havuza At
              </span>
            </button>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 shrink-0">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-200/80 hover:bg-slate-300 active:bg-slate-400 font-bold text-slate-700 text-xs sm:text-sm transition-colors"
            >
              Kapat
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
