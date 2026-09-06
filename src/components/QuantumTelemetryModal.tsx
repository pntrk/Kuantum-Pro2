import React from 'react';
import { 
  Activity, 
  Cpu, 
  Trash2, 
  Flame, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  Layers,
  Clock,
  ShieldCheck,
  TrendingDown
} from 'lucide-react';
import { CoreProgressState, DistributionState } from '../types/workerMessages';

interface QuantumTelemetryModalProps {
  distributeState: DistributionState;
  coreStates: CoreProgressState[];
  onStop: () => void;
  totalInitialUnplaced?: number;
}

export const QuantumTelemetryModal: React.FC<QuantumTelemetryModalProps> = ({
  distributeState,
  coreStates,
  onStop,
  totalInitialUnplaced = 0
}) => {
  if (!distributeState.isRunning) return null;

  // Calculate stats across cores
  const totalCores = coreStates.length;
  const activeCores = coreStates.filter(c => c.status === 'running' || c.status === 'idle').length;
  const completedCores = coreStates.filter(c => c.status === 'completed' || c.progress === 100).length;
  const failedCores = coreStates.filter(c => c.status === 'failed').length;

  // Best unplaced count across workers
  const currentUnplacedValues = coreStates
    .map(c => c.unplaced)
    .filter((v): v is number => typeof v === 'number');
  
  const bestUnplaced = currentUnplacedValues.length > 0
    ? Math.min(...currentUnplacedValues)
    : 0;

  const totalPlacedEstimated = totalInitialUnplaced > 0
    ? Math.max(0, totalInitialUnplaced - bestUnplaced)
    : 0;

  const overallProgress = distributeState.progress || 0;

  // Radial progress calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallProgress / 100) * circumference;

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-[300] flex flex-col items-center justify-center p-4 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 p-6 md:p-8 rounded-3xl shadow-2xl max-w-2xl w-full text-white flex flex-col relative overflow-hidden">
        
        {/* Ambient Glow Background Effect */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header & Radial Progress */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6 pb-6 border-b border-slate-800 relative z-10">
          
          {/* Circular Radial Gauge */}
          <div className="flex items-center gap-5">
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="text-slate-800 stroke-current"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="text-indigo-500 transition-all duration-300 ease-out stroke-current"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black tracking-tight text-white">{overallProgress}%</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Yerleşim</span>
              </div>
            </div>

            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Çok Çekirdekli Motor
                </span>
                <span className="text-xs text-slate-400 font-bold">({totalCores} Çekirdek)</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white mt-1 tracking-tight">Kuantum AI Dağıtım</h2>
              <p className="text-xs text-slate-400 font-medium truncate max-w-sm mt-0.5" title={distributeState.phase}>
                {distributeState.phase || 'Milyarlarca kombinasyon taranıyor...'}
              </p>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 gap-2.5 w-full md:w-auto shrink-0">
            <div className="bg-slate-800/80 border border-slate-700/60 p-2.5 rounded-xl text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Yerleşen
              </div>
              <div className="text-lg font-black text-emerald-400 mt-0.5">
                {totalPlacedEstimated > 0 ? totalPlacedEstimated : (totalInitialUnplaced ? totalInitialUnplaced - bestUnplaced : 'Hesaplanıyor')}
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/60 p-2.5 rounded-xl text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" /> Kalan Kart
              </div>
              <div className="text-lg font-black text-amber-400 mt-0.5">
                {bestUnplaced}
              </div>
            </div>
          </div>
        </div>

        {/* Live Multi-Core Telemetry Grid */}
        <div className="w-full space-y-2.5 mb-6 max-h-[36vh] overflow-y-auto custom-scrollbar pr-1 relative z-10">
          <div className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center justify-between px-1">
            <span>Çekirdek Canlı Telemetri & Mini Isı Göstergesi</span>
            <span>{activeCores} Aktif / {totalCores} Toplam</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {coreStates.map((core, idx) => {
              const isFailed = core.status === 'failed';
              const isRecovering = core.status === 'recovering';
              const isDone = core.status === 'completed' || core.progress === 100;

              // Pseudo-sparkline calculation based on worker progress & iteration
              const coreIter = core.iter || 0;
              const sparklineHeights = [
                Math.max(15, (core.progress * 0.4) % 100),
                Math.max(25, (core.progress * 0.7) % 100),
                Math.max(35, (core.progress * 0.9) % 100),
                Math.max(20, (core.progress * 0.6) % 100),
                Math.min(100, core.progress)
              ];

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border flex flex-col justify-between gap-2 text-left transition-all ${
                    isFailed
                      ? 'bg-red-950/40 border-red-800/80 text-red-200'
                      : isRecovering
                      ? 'bg-amber-950/40 border-amber-800/80 text-amber-200'
                      : isDone
                      ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                      : 'bg-slate-800/60 border-slate-700/70 text-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5 font-black">
                      <Cpu className={`w-4 h-4 ${
                        isFailed ? 'text-red-400' :
                        isRecovering ? 'text-amber-400 animate-spin' :
                        isDone ? 'text-emerald-400' :
                        'text-cyan-400'
                      }`} />
                      <span>Çekirdek #{idx + 1}</span>

                      {core.retryCount > 0 && (
                        <span className="bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[8px] font-extrabold px-1.5 py-0.2 rounded-full">
                          {core.retryCount} Kurtarma
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Mini Sparkline Visualization */}
                      <div className="flex items-end gap-0.5 h-3.5 px-1 bg-slate-900/60 rounded">
                        {sparklineHeights.map((h, sIdx) => (
                          <div
                            key={sIdx}
                            className={`w-1 rounded-xs transition-all duration-300 ${
                              isDone ? 'bg-emerald-400' : isFailed ? 'bg-red-400' : 'bg-cyan-400'
                            }`}
                            style={{ height: `${Math.max(20, h)}%` }}
                          />
                        ))}
                      </div>

                      <span className={`font-black text-xs ${
                        isFailed ? 'text-red-400' : isDone ? 'text-emerald-400' : 'text-cyan-400'
                      }`}>
                        {isFailed ? 'Hata' : `${core.progress}%`}
                      </span>
                    </div>
                  </div>

                  {/* Core Progress Bar */}
                  <div className="w-full bg-slate-950/80 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        isFailed ? 'bg-red-500' :
                        isRecovering ? 'bg-amber-500 animate-pulse' :
                        isDone ? 'bg-emerald-400' :
                        'bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500'
                      }`}
                      style={{ width: `${isFailed ? 100 : core.progress}%` }}
                    />
                  </div>

                  {/* Core Telemetry Info */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium truncate">
                    <span className="truncate max-w-[170px]" title={core.phase}>
                      {core.phase || 'Optimizasyon...'}
                    </span>
                    {coreIter > 0 && (
                      <span className="shrink-0 text-slate-500 font-mono">
                        {coreIter} iter
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic AI Status Banner */}
        <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 w-full mb-4 flex items-center justify-between gap-3 text-xs relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="font-bold text-slate-200">Kuantum Kempe & Ejection Zincirleri Devrede</div>
              <div className="text-[11px] text-slate-400">Yapay zeka kilitli saatlere ve kısıtlamalara tam uyum sağlayarak çözüyor.</div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
            Otomatik Kurtarma Aktif
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onStop}
          disabled={distributeState.phase.startsWith('İptal')}
          className="w-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-rose-200 font-extrabold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs relative z-10"
        >
          <Trash2 className="w-4 h-4" />
          {distributeState.phase.startsWith('İptal') ? 'İşlem Durduruluyor...' : 'Dağıtımı Durdur (En İyi Sonucu Kaydet)'}
        </button>

      </div>
    </div>
  );
};
