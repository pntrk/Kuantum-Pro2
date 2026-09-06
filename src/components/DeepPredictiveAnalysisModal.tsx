import React, { useState } from 'react';
import { 
  Brain, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  ShieldAlert, 
  Layers, 
  TrendingUp, 
  Clock, 
  UserX, 
  HelpCircle, 
  Zap, 
  Sliders, 
  ArrowRight,
  Flame,
  Swords,
  X
} from 'lucide-react';
import { ShadowAnalysisResult, CardHeatmap } from '../types/shadowAnalysisTypes';

interface DeepPredictiveAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: ShadowAnalysisResult | null;
  isRunningDeep: boolean;
  onForceDeepRun: () => void;
  onApplyPredictiveSort?: () => void;
  deepLearningActive: boolean;
  onToggleDeepLearning: (active: boolean) => void;
}

export const DeepPredictiveAnalysisModal: React.FC<DeepPredictiveAnalysisModalProps> = ({
  isOpen,
  onClose,
  analysis,
  isRunningDeep,
  onForceDeepRun,
  onApplyPredictiveSort,
  deepLearningActive,
  onToggleDeepLearning
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'heatmap' | 'bottlenecks'>('overview');
  if (!isOpen) return null;

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'optimal':
        return { label: 'Optimum / Mükemmel Dağıtılabilir', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: CheckCircle2 };
      case 'feasible':
        return { label: 'Dağıtılabilir', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: CheckCircle2 };
      case 'tight':
        return { label: 'Dar Boğazlar Mevcut', color: 'bg-amber-100 text-amber-800 border-amber-300', icon: AlertTriangle };
      case 'critical':
        return { label: 'Kritik Risk / Dar Kapasite', color: 'bg-orange-100 text-orange-800 border-orange-300', icon: AlertTriangle };
      case 'impossible':
        return { label: 'Dağıtılamaz / 0 Uygun Saat', color: 'bg-rose-100 text-rose-800 border-rose-300', icon: XCircle };
      default:
        return { label: 'Analiz Ediliyor...', color: 'bg-slate-100 text-slate-800 border-slate-300', icon: RefreshCw };
    }
  };

  const statusBadge = getStatusBadge(analysis?.solvabilityStatus);
  const StatusIcon = statusBadge.icon;
  const feasibilityScore = analysis?.feasibilityScore ?? 0;
  const heatmap = analysis?.heatmap;
  const cardHeatmapList: CardHeatmap[] = heatmap?.cards ? Object.values(heatmap.cards) : [];
  const deadEnds = analysis?.deadEndWarnings || [];

  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-purple-950 text-white px-6 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Brain className="w-6 h-6 text-indigo-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">Sürekli Derin Analiz & Zorluk Isı Haritası</h2>
                <span className="text-[10px] font-bold uppercase bg-indigo-500/40 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-400/30">
                  Continuous Engine
                </span>
              </div>
              <p className="text-xs text-indigo-200/80">
                Gölge Web Worker tahtadaki tüm boşlukları tarar, çakışma potansiyelini ve zorluk ağırlıklarını (Heuristic Weight) hesaplar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onForceDeepRun}
              disabled={isRunningDeep}
              className="bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/20 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
              title="Çok aşamalı Monte Carlo simülasyonunu baştan çalıştır"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningDeep ? 'animate-spin' : ''}`} />
              {isRunningDeep ? 'Hesaplanıyor...' : 'Derin Simülasyonu Yenile'}
            </button>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-slate-200 px-6 flex items-center gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            Genel Durum & Simülasyon
          </button>
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'heatmap'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-500" />
            Olasılık & Zorluk Matrisi ({cardHeatmapList.length})
            {deadEnds.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {deadEnds.length} Çıkmaz
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('bottlenecks')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'bottlenecks'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserX className="w-4 h-4" />
            Kapasite & Kısıtlama Dar Boğazları ({analysis?.bottlenecks.length || 0})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar bg-slate-50/50">
          
          {/* Instant Dead-End Alert Banner */}
          {deadEnds.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-800 font-black text-sm">
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>Matematiksel Çıkmaz Tespiti (Dead-End Detection): {deadEnds.length} Ders İçin 0 Boş Yer Kaldı!</span>
                </div>
                <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  Kritik Engel
                </span>
              </div>
              <p className="text-xs text-rose-700 leading-relaxed">
                Kullanıcının belirlediği kapalı saat kısıtlamaları veya mevcut kilitli yerleşimler sebebiyle aşağıdaki dersler için ortak boş zaman dilimi matematiksel olarak tükenmiştir:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                {deadEnds.map((w, i) => (
                  <div key={i} className="bg-white p-3 rounded-lg border border-rose-200 shadow-xs text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span className="text-rose-700 font-black">{w.subject}</span>
                      <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded text-[10px] font-bold">{w.hours} Saat</span>
                    </div>
                    <div className="text-[11px] text-slate-700 font-semibold">{w.warningMessage}</div>
                    <div className="text-[10px] text-slate-500">{w.details}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <>
              {/* Top KPI Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* Feasibility Index */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
                    <span>Dağıtılabilirlik Skoru</span>
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className={`text-3xl font-black ${
                      feasibilityScore >= 80 ? 'text-emerald-600' :
                      feasibilityScore >= 50 ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      %{feasibilityScore}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">tahmini başarı</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden border border-slate-200">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        feasibilityScore >= 80 ? 'bg-emerald-500' :
                        feasibilityScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${feasibilityScore}%` }}
                    />
                  </div>
                </div>

                {/* Status Classification */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
                    <span>Programın Durumu</span>
                    <Layers className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-black ${statusBadge.color}`}>
                    <StatusIcon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{statusBadge.label}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">
                    {analysis?.bottlenecks.length ? `${analysis.bottlenecks.length} kritik dar boğaz saptandı` : 'Kapasite engeli yok'}
                  </p>
                </div>

                {/* Sim Placement Rate */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
                    <span>Monte Carlo Simülasyonu</span>
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-slate-800">
                      %{analysis?.predictiveStats.simulatedPlacementRate ?? 0}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">yerleşim oranı</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {analysis?.predictiveStats.computationTimeMs ?? 0} ms arka plan süresi
                  </p>
                </div>

                {/* Teacher Balance Index */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
                    <span>Öğretmen Yük Dengesi</span>
                    <Sliders className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-indigo-600">
                      %{analysis?.predictiveStats.teacherLoadBalanceScore ?? 0}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">homojenlik</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">
                    Bekleyen ders: <span className="font-bold text-slate-700">{analysis?.predictiveStats.unplacedLessons ?? 0}</span>
                  </p>
                </div>

              </div>

              {/* Deep Learning Toggle & Pool Sync Banner */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 text-white rounded-lg -sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-95">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wide">
                      Tahmine Dayalı Akıllı Havuz Sıralaması
                    </h4>
                    <p className="text-xs text-indigo-700">
                      Zor ve kısıtlı dersleri otomatik tespit edip dağıtım motorunun ve manuel sürüklemenin ilk sırasına yerleştirir.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {onApplyPredictiveSort && (
                    <button
                      onClick={onApplyPredictiveSort}
                      className="bg-indigo-600   text-white px-3 py-1.5 rounded-lg text-xs font-bold -sm  flex items-center gap-1 -md hover:-lg focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-95"
                    >
                      <ArrowRight className="w-3.5 h-3.5" /> Havuzu Zorluğa Göre Diz
                    </button>
                  )}
                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-indigo-200 shadow-sm text-xs font-bold text-slate-700">
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={deepLearningActive} 
                      onChange={(e) => onToggleDeepLearning(e.target.checked)} 
                    />
                    <span>Sürekli Öğrenme:</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                      deepLearningActive ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {deepLearningActive ? 'Açık' : 'Kapalı'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Two-Column Section: Smart Recommendations */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 font-black text-slate-800 text-sm">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span>Akıllı Dağıtım Tavsiyeleri</span>
                  </div>
                  <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">
                    {analysis?.suggestedFixes.length || 0} Tavsiye
                  </span>
                </div>

                {(!analysis?.suggestedFixes || analysis.suggestedFixes.length === 0) ? (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    <HelpCircle className="w-8 h-8 text-indigo-300 mx-auto mb-2 opacity-80" />
                    Önerilecek ek kısıtlama gevşetmesi bulunmuyor.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                    {analysis.suggestedFixes.map((fix, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3 rounded-lg border text-xs space-y-1.5 transition-colors ${
                          fix.severity === 'critical' ? 'bg-rose-50/70 border-rose-200' :
                          fix.severity === 'warning' ? 'bg-amber-50/70 border-amber-200' :
                          fix.severity === 'success' ? 'bg-emerald-50/70 border-emerald-200' :
                          'bg-blue-50/70 border-blue-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-slate-800">
                          {fix.severity === 'critical' ? <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" /> :
                           fix.severity === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" /> :
                           <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                          <span className="text-slate-900 font-black">{fix.title}</span>
                        </div>
                        <p className="text-slate-600 text-xs leading-relaxed">{fix.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 2: Heatmap & Probability Matrix */}
          {activeTab === 'heatmap' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-500" />
                    Ders Kartı Zorluk & Çakışma Isı Matrisi
                  </h3>
                  <p className="text-xs text-slate-500">
                    Her kartın tahtada kalan geçerli (çakışmasız) slot sayısı, rekabet ettiği diğer kartlar ve Heuristic Zorluk Ağırlığı
                  </p>
                </div>
                {heatmap?.maxContentionSlot && (
                  <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg text-xs text-amber-900">
                    <span className="font-bold">En Yoğun Talep Slotu:</span> Gün {heatmap.maxContentionSlot.dayIndex + 1}, Saat {heatmap.maxContentionSlot.periodIndex + 1} ({heatmap.maxContentionSlot.contentionScore} kart talip)
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {cardHeatmapList.map((card) => {
                  const isDead = card.isDeadEnd || card.validSlotsCount === 0;
                  return (
                    <div 
                      key={card.cardId} 
                      className={`p-3.5 rounded-xl border transition-all shadow-xs space-y-2.5 ${
                        isDead ? 'bg-rose-50/80 border-rose-300' :
                        card.difficultyLevel === 'extreme' ? 'bg-amber-50/80 border-amber-300' :
                        card.difficultyLevel === 'high' ? 'bg-orange-50/60 border-orange-200' :
                        'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-black text-slate-900 text-xs truncate">{card.subject}</span>
                          <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.2 rounded">
                            {card.hours}s
                          </span>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          isDead ? 'bg-rose-600 text-white' :
                          card.difficultyLevel === 'extreme' ? 'bg-amber-600 text-white' :
                          card.difficultyLevel === 'high' ? 'bg-orange-500 text-white' :
                          'bg-indigo-100 text-indigo-800'
                        }`}>
                          {isDead ? 'Dead-End (0)' : `Ağırlık: ${card.heuristicWeight}`}
                        </span>
                      </div>

                      {/* Teachers & Classes */}
                      <div className="text-[11px] text-slate-600 space-y-0.5">
                        <div className="truncate">Öğretmen: <span className="font-semibold text-slate-800">{card.teachers.join(', ') || '-'}</span></div>
                        <div className="truncate">Sınıf: <span className="font-semibold text-slate-800">{card.classes.join(', ') || '-'}</span></div>
                      </div>

                      {/* Remaining Valid Slots Indicator */}
                      <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Kalan Geçerli Slot:</span>
                        <span className={`font-black px-2 py-0.5 rounded ${
                          isDead ? 'bg-rose-200 text-rose-900' :
                          card.validSlotsCount <= 3 ? 'bg-amber-200 text-amber-900' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {card.validSlotsCount} alternatif
                        </span>
                      </div>

                      {/* Competing Cards List */}
                      {card.competingCards && card.competingCards.length > 0 && (
                        <div className="pt-1.5 border-t border-slate-200/50 space-y-1">
                          <div className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                            <Swords className="w-3 h-3 text-slate-400" />
                            En Çok Rekabet Ettiği Dersler:
                          </div>
                          <div className="space-y-1">
                            {card.competingCards.slice(0, 2).map((comp, cIdx) => (
                              <div key={cIdx} className="text-[10px] bg-black/5 p-1 rounded flex items-center justify-between">
                                <span className="font-semibold text-slate-800 truncate max-w-[140px]">{comp.subject}</span>
                                <span className="text-slate-500 text-[9px] truncate max-w-[100px]">{comp.conflictResource}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Capacity Bottlenecks */}
          {activeTab === 'bottlenecks' && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 font-black text-slate-800 text-sm">
                  <UserX className="w-4 h-4 text-amber-500" />
                  <span>Kapasite & Kısıtlama Dar Boğazları</span>
                </div>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                  {analysis?.bottlenecks.length || 0} Kayıt
                </span>
              </div>

              {(!analysis?.bottlenecks || analysis.bottlenecks.length === 0) ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                  Belirgin bir kapasite dar boğazı veya aşırı kısıtlama tespit edilmedi.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysis.bottlenecks.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                          <span className={`w-2 h-2 rounded-full ${item.riskScore >= 90 ? 'bg-rose-500' : 'bg-amber-500'}`} />
                          <span>{item.name}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">({item.type})</span>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                          item.riskScore >= 90 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          Risk: %{item.riskScore}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{item.message}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-1">
                        <span>Açık Alan: <b>{item.freeHours}s</b></span>
                        <span>İhtiyaç: <b>{item.requiredHours}s</b></span>
                        <span>Doluluk: <b>%{item.utilizationRate}</b></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 px-6 py-3.5 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sürekli Analiz & Zorluk Isı Haritası arka planda otomatik güncellenir</span>
          </div>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-sm transition-all"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
};

