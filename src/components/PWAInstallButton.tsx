import React, { useState } from 'react';
import { Download, Smartphone, X, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onPointerDown={(e) => {
          e.preventDefault();
          install();
        }}
        className={`bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0 active:scale-95 touch-manipulation border border-indigo-400/40 ${className}`}
        title="Uygulamayı telefon veya bilgisayara yükle"
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden sm:inline">Uygulamayı Yükle</span>
        <span className="sm:hidden">Yükle</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            setShowIOSGuide(true);
          }}
          className={`bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/50 text-indigo-200 px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0 active:scale-95 touch-manipulation ${className}`}
          title="iPhone / iPad Ana Ekrana Ekle"
        >
          <Smartphone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="hidden sm:inline">Ana Ekrana Ekle</span>
          <span className="sm:hidden">Yükle</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl text-slate-900 border border-slate-200 animate-in fade-in slide-in-from-bottom-5 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-black text-sm">
                    📱
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">iPhone / iPad'e Yükle</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 space-y-2.5 text-xs sm:text-sm text-slate-600">
                <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                  <span>Safari alt çubuğundaki <Share className="w-3.5 h-3.5 inline mx-1 text-indigo-600" /> <strong>Paylaş</strong> simgesine dokunun.</span>
                </div>
                <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                  <span>Aşağı kaydırıp <strong>"Ana Ekrana Ekle"</strong> seçeneğine dokunun.</span>
                </div>
                <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                  <span>Sağ üstteki <strong>"Ekle"</strong> butonuna basarak tam ekran kullanın.</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-indigo-600 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm transition"
              >
                Anladım
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
