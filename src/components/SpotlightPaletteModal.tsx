import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  User, 
  Users, 
  MapPin, 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  Command, 
  X, 
  Sliders, 
  Clock, 
  Play, 
  Lock, 
  Eraser, 
  Download,
  SplitSquareVertical,
  Calendar
} from 'lucide-react';

export interface SpotlightItem {
  id: string;
  type: 'teacher' | 'class' | 'room' | 'subject' | 'action';
  title: string;
  subtitle?: string;
  badge?: string;
  details?: string;
  actionPayload?: any;
}

interface SpotlightPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: string[];
  classes: string[];
  rooms: string[];
  subjects: string[];
  unplacedCount?: number;
  onSelectEntity: (type: 'teacher' | 'class' | 'room' | 'subject', name: string) => void;
  onOpenSplitCompare?: (entityA?: { type: 'teacher' | 'class' | 'room'; name: string }) => void;
  onOpenConstraintModal?: (type: 'teacher' | 'class' | 'room' | 'subject', name: string) => void;
  onTriggerAction?: (actionId: string) => void;
}

export const SpotlightPaletteModal: React.FC<SpotlightPaletteModalProps> = ({
  isOpen,
  onClose,
  teachers,
  classes,
  rooms,
  subjects,
  unplacedCount = 0,
  onSelectEntity,
  onOpenSplitCompare,
  onOpenConstraintModal,
  onTriggerAction
}) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'teacher' | 'class' | 'room' | 'subject' | 'action'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);

  // Auto focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Touch gesture to swipe-down close on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current !== null) {
      const diffY = e.changedTouches[0].clientY - touchStartY.current;
      if (diffY > 60) {
        onClose();
      }
      touchStartY.current = null;
    }
  };

  // Aggregate searchable items
  const allItems: SpotlightItem[] = useMemo(() => {
    const list: SpotlightItem[] = [];

    // Quick Actions
    list.push(
      {
        id: 'action-heatmap',
        type: 'action',
        title: 'Ders Yükü Isı Haritası (Heatmap Overlay)',
        subtitle: 'Okul genelindeki yoğunluk, çakışma ve tepe saatleri çizelge üzerinde renklendir',
        badge: 'Isı Haritası',
        actionPayload: 'toggle_heatmap'
      },
      {
        id: 'action-split-compare',
        type: 'action',
        title: 'Çoklu Karşılaştırma Modunu Aç (Split View)',
        subtitle: 'İki öğretmen veya sınıfın programını yan yana karşılaştır',
        badge: 'Karşılaştır',
        actionPayload: 'open_split_compare'
      },
      {
        id: 'action-distribute',
        type: 'action',
        title: 'Kuantum AI Dağıtımı Başlat',
        subtitle: `${unplacedCount} havuz kartını çok çekirdekli yapay zeka ile yerleştir`,
        badge: 'AI Motoru',
        actionPayload: 'start_distribution'
      },
      {
        id: 'action-predictive',
        type: 'action',
        title: 'Derin Tahmin & Çıkmaz Sokak Analizi',
        subtitle: 'Tıkanma noktaları ve ders yerleşim zorluk ısı haritası',
        badge: 'Tahmin',
        actionPayload: 'open_predictive'
      },
      {
        id: 'action-export-png',
        type: 'action',
        title: 'Programı Resim Olarak İndir (PNG)',
        subtitle: 'Mevcut haftalık çizelgenin yüksek çözünürlüklü ekran görüntüsü',
        badge: 'Dışa Aktar',
        actionPayload: 'export_png'
      }
    );

    // Teachers
    teachers.forEach(t => {
      list.push({
        id: `teacher-${t}`,
        type: 'teacher',
        title: t,
        subtitle: 'Öğretmen Haftalık Çizelgesi',
        badge: 'Öğretmen'
      });
    });

    // Classes
    classes.forEach(c => {
      list.push({
        id: `class-${c}`,
        type: 'class',
        title: c,
        subtitle: 'Sınıf / Şube Haftalık Çizelgesi',
        badge: 'Sınıf'
      });
    });

    // Rooms
    rooms.forEach(r => {
      list.push({
        id: `room-${r}`,
        type: 'room',
        title: r,
        subtitle: 'Derslik / Laboratuvar Çizelgesi',
        badge: 'Derslik'
      });
    });

    // Subjects
    subjects.forEach(s => {
      list.push({
        id: `subject-${s}`,
        type: 'subject',
        title: s,
        subtitle: 'Ders Bazlı Program Dağılımı',
        badge: 'Ders'
      });
    });

    return list;
  }, [teachers, classes, rooms, subjects, unplacedCount]);

  // Filter items based on query & category
  const filteredItems = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr-TR');
    return allItems.filter(item => {
      if (activeCategory !== 'all' && item.type !== activeCategory) {
        return false;
      }
      if (!q) return true;
      const titleMatch = item.title.toLocaleLowerCase('tr-TR').includes(q);
      const subMatch = item.subtitle?.toLocaleLowerCase('tr-TR').includes(q);
      const badgeMatch = item.badge?.toLocaleLowerCase('tr-TR').includes(q);
      return titleMatch || subMatch || badgeMatch;
    });
  }, [allItems, query, activeCategory]);

  // Ensure selectedIndex is in bounds
  useEffect(() => {
    if (selectedIndex >= filteredItems.length) {
      setSelectedIndex(Math.max(0, filteredItems.length - 1));
    }
  }, [filteredItems.length, selectedIndex]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Handle execution
  const executeItem = (item: SpotlightItem) => {
    if (item.type === 'action') {
      if (item.actionPayload === 'open_split_compare' && onOpenSplitCompare) {
        onOpenSplitCompare();
      } else if (onTriggerAction) {
        onTriggerAction(item.actionPayload);
      }
      onClose();
      return;
    }

    onSelectEntity(item.type, item.title);
    onClose();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        executeItem(filteredItems[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  const categories = [
    { key: 'all', label: 'Tümü' },
    { key: 'teacher', label: 'Öğretmenler' },
    { key: 'class', label: 'Sınıflar' },
    { key: 'room', label: 'Derslikler' },
    { key: 'subject', label: 'Dersler' },
    { key: 'action', label: 'Komutlar' }
  ] as const;

  return (
    <div 
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-[320] flex items-end md:items-start justify-center pt-0 md:pt-20 p-0 md:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl border-t md:border border-slate-200/90 w-full h-[90vh] md:h-auto max-w-2xl overflow-hidden flex flex-col max-h-[92vh] md:max-h-[82vh] animate-scaleUp"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Mobile Drag Handle & Header bar */}
        <div 
          className="flex md:hidden items-center justify-between px-4 py-2.5 bg-slate-100/90 border-b border-slate-200/80 shrink-0 touch-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Visual Indicator */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-xs font-black text-slate-700 tracking-tight">Hızlı Arama & Komutlar</span>
          </div>

          {/* Swipe indicator in center */}
          <div className="w-10 h-1 bg-slate-300 rounded-full" />

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 active:bg-rose-100 active:text-rose-700 text-slate-700 font-bold text-xs rounded-lg transition-all active:scale-95 flex items-center gap-1 touch-manipulation shadow-2xs"
            aria-label="Kapat"
          >
            <X className="w-3.5 h-3.5" />
            <span>Kapat</span>
          </button>
        </div>

        {/* Search Header Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center gap-2 sm:gap-3 bg-slate-50/80 shrink-0">
          <Search className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-sm sm:text-base md:text-lg font-bold text-slate-800 placeholder:text-slate-400 outline-none"
            placeholder="Öğretmen, sınıf, derslik veya komut arayın... (Örn: Matematik, 8-A, Ahmet)"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          {query && (
            <button 
              type="button"
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 active:scale-95 transition-all shrink-0"
              title="Aramayı Temizle"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          
          {/* Desktop ESC badge */}
          <div className="hidden sm:flex items-center gap-1 text-[10px] font-black text-slate-400 bg-slate-200/60 px-2 py-1 rounded-md border border-slate-300/40 shrink-0">
            <span>ESC</span>
          </div>

          {/* Dedicated Close Button in Header Bar */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/80 active:bg-slate-300 rounded-xl transition-all active:scale-95 touch-manipulation flex items-center justify-center shrink-0 min-w-[36px] h-9"
            title="Pencereyi Kapat (Esc)"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="px-3 sm:px-4 py-2 border-b border-slate-100 bg-white flex items-center gap-1.5 overflow-x-auto custom-scrollbar shrink-0">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => {
                setActiveCategory(cat.key);
                setSelectedIndex(0);
                inputRef.current?.focus();
              }}
              className={`px-3 py-1 rounded-full text-xs font-black transition-all whitespace-nowrap ${
                activeCategory === cat.key
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div 
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar md:max-h-[55vh] min-h-0"
        >
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="text-sm font-bold text-slate-600">Eşleşen sonuç bulunamadı</p>
              <p className="text-xs text-slate-400 mt-1">Farklı bir arama terimi veya kategori seçebilirsiniz.</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              
              let Icon = User;
              let iconBg = 'bg-blue-100 text-blue-700';
              if (item.type === 'class') {
                Icon = Users;
                iconBg = 'bg-emerald-100 text-emerald-700';
              } else if (item.type === 'room') {
                Icon = MapPin;
                iconBg = 'bg-amber-100 text-amber-700';
              } else if (item.type === 'subject') {
                Icon = BookOpen;
                iconBg = 'bg-purple-100 text-purple-700';
              } else if (item.type === 'action') {
                Icon = Sparkles;
                iconBg = 'bg-indigo-100 text-indigo-700';
              }

              return (
                <div
                  key={item.id}
                  data-index={idx}
                  onClick={() => executeItem(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3 py-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-indigo-50/80 border border-indigo-200 text-indigo-950 shadow-xs' 
                      : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold ${iconBg}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm truncate text-slate-900">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                            item.type === 'teacher' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            item.type === 'class' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            item.type === 'room' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            item.type === 'action' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                            'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Quick secondary actions on hover/select */}
                    {isSelected && item.type !== 'action' && (
                      <div className="hidden sm:flex items-center gap-1">
                        {onOpenSplitCompare && (item.type === 'teacher' || item.type === 'class' || item.type === 'room') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenSplitCompare({ type: item.type as any, name: item.title });
                              onClose();
                            }}
                            title="Karşılaştırma Modunda Aç"
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors"
                          >
                            <SplitSquareVertical className="w-3.5 h-3.5" />
                            <span className="text-[10px]">Karşılaştır</span>
                          </button>
                        )}
                        {onOpenConstraintModal && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenConstraintModal(item.type, item.title);
                              onClose();
                            }}
                            title="Kısıtlamaları ve İzinli Saatleri Düzenle"
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span className="text-[10px]">Kısıtlar</span>
                          </button>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-slate-400">
                      <span className="text-[10px] font-bold text-slate-400 hidden md:inline">Seç</span>
                      <ArrowRight className="w-4 h-4 text-indigo-500" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper & mobile touch close action */}
        <div className="p-2.5 sm:p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium shrink-0">
          <div className="hidden sm:flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] shadow-2xs">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] shadow-2xs">↓</kbd> Gezin
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] shadow-2xs">Enter</kbd> Git
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] shadow-2xs">Ctrl + K</kbd> Aç/Kapat
            </span>
          </div>

          {/* Mobile Bottom Close Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-700 font-bold text-xs rounded-xl active:scale-95 transition-all flex items-center gap-1.5 touch-manipulation shadow-2xs"
            >
              <X className="w-3.5 h-3.5" />
              <span>Kapat</span>
            </button>
          </div>

          <span className="text-indigo-600 font-bold text-[11px]">
            {filteredItems.length} Sonuç
          </span>
        </div>
      </div>
    </div>
  );
};
